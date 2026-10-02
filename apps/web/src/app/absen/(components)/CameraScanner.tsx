"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AttendanceResult } from "./TodayStatusCard";

const CAPTURE_WIDTH = 640;
const CAPTURE_HEIGHT = 480;
const JPEG_QUALITY = 0.8;

type ScanStatus = "starting" | "ready" | "capturing" | "processing" | "error";
type LocationStatus = "requesting" | "ready" | "denied" | "unsupported";

const BADGE_COPY: Record<ScanStatus, { text: string; icon: string }> = {
  starting: { text: "Menyiapkan kamera...", icon: "hourglass_empty" },
  ready: { text: "Posisikan Wajah Anda", icon: "face" },
  capturing: { text: "Mengambil Gambar...", icon: "photo_camera" },
  processing: { text: "Memverifikasi Biometrik...", icon: "sync" },
  error: { text: "Wajah Tidak Terdeteksi", icon: "error" },
};

const LOCATION_COPY: Record<LocationStatus, { text: string; icon: string; tone: "ok" | "warn" }> = {
  requesting: { text: "Mendeteksi lokasi Anda...", icon: "location_searching", tone: "warn" },
  ready: { text: "Lokasi terdeteksi", icon: "location_on", tone: "ok" },
  denied: { text: "Izin lokasi ditolak. Aktifkan GPS untuk absen.", icon: "location_off", tone: "warn" },
  unsupported: { text: "Perangkat tidak mendukung GPS.", icon: "location_off", tone: "warn" },
};

export function CameraScanner({
  onSuccess,
}: {
  onSuccess: (result: AttendanceResult) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const coordsRef = useRef<{ lat: number; lng: number } | null>(null);

  const [status, setStatus] = useState<ScanStatus>("starting");
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("requesting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: CAPTURE_WIDTH, height: CAPTURE_HEIGHT, facingMode: "user" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus("ready");
      } catch {
        setStatus("error");
        setErrorMessage("Tidak dapat mengakses kamera. Periksa izin browser.");
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        coordsRef.current = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocationStatus("ready");
      },
      (err) => {
        coordsRef.current = null;
        setLocationStatus(err.code === err.PERMISSION_DENIED ? "denied" : "unsupported");
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const captureFrame = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) {
        resolve(null);
        return;
      }
      canvas.width = CAPTURE_WIDTH;
      canvas.height = CAPTURE_HEIGHT;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.drawImage(video, 0, 0, CAPTURE_WIDTH, CAPTURE_HEIGHT);
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", JPEG_QUALITY);
    });
  }, []);

  const handleScan = useCallback(async () => {
    if (isSubmitting || status !== "ready") return;

    if (!coordsRef.current) {
      setErrorMessage("Lokasi GPS belum siap. Pastikan izin lokasi diaktifkan.");
      return;
    }

    setIsSubmitting(true);
    setStatus("capturing");
    setErrorMessage(null);
    setDebugInfo(null);

    const blob = await captureFrame();
    if (!blob) {
      setStatus("error");
      setErrorMessage("Gagal mengambil gambar dari kamera.");
      setIsSubmitting(false);
      return;
    }

    setStatus("processing");

    try {
      const formData = new FormData();
      formData.append("photo", blob, "snapshot.jpg");
      formData.append("latitude", String(coordsRef.current.lat));
      formData.append("longitude", String(coordsRef.current.lng));

      const res = await fetch("/api/attendance", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.closest_match) {
          setDebugInfo(
            `Kandidat terdekat: ${data.closest_match} (kemiripan ${(data.similarity * 100).toFixed(1)}%, minimal ${(data.threshold * 100).toFixed(0)}%)`
          );
        }
        throw new Error(data?.message ?? "Wajah tidak dikenali");
      }

      onSuccess({
        userName: data.user_name,
        timestamp: data.timestamp,
        attendanceStatus: data.attendance_status,
        similarity: data.similarity,
        officeName: data.office_name,
      });
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  }, [captureFrame, isSubmitting, onSuccess, status]);

  const badge = BADGE_COPY[status];
  const locationBadge = LOCATION_COPY[locationStatus];
  const canScan = status === "ready" && locationStatus === "ready" && !isSubmitting;

  return (
    <section className="relative flex w-full flex-col items-center overflow-hidden rounded-3xl bg-surface-container-lowest p-4 shadow-[0_4px_24px_-4px_rgba(0,105,72,0.08)]">
      <div
        className={`mb-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 shadow-sm ${
          status === "error" ? "bg-error-container text-error" : "bg-primary-fixed/40 text-on-primary-fixed"
        }`}
      >
        <span
          className={`material-symbols-outlined text-[18px] ${status === "error" ? "text-error" : "text-primary"} ${status === "processing" ? "animate-spin" : ""}`}
        >
          {badge.icon}
        </span>
        <span className="text-label-md font-bold">{badge.text}</span>
      </div>

      <div
        className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-label-sm ${
          locationBadge.tone === "ok" ? "bg-primary-fixed/25 text-on-primary-fixed-variant" : "bg-tertiary-fixed/50 text-on-tertiary-fixed-variant"
        }`}
      >
        <span className={`material-symbols-outlined text-[15px] ${locationStatus === "requesting" ? "animate-pulse" : ""}`}>
          {locationBadge.icon}
        </span>
        <span>{locationBadge.text}</span>
      </div>

      <div className="relative my-1 flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
        <div className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-primary-fixed/20 opacity-30" />
        <div className="pointer-events-none absolute -inset-2 animate-pulse rounded-full bg-gradient-to-tr from-primary-fixed via-secondary-fixed to-primary-fixed/40 opacity-70" />

        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-primary via-primary-fixed to-secondary p-1.5 shadow-lg">
          <div className="relative h-full w-full overflow-hidden rounded-full bg-surface-container-highest">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full -scale-x-100 object-cover"
            />

            {status === "processing" && (
              <div
                className="pointer-events-none absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-fixed to-transparent shadow-[0_0_12px_#85f8c4]"
                style={{ animation: "laser-scan 1.6s ease-in-out infinite" }}
              />
            )}

            <div className="pointer-events-none absolute inset-4">
              <div className="absolute left-0 top-0 h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-primary-fixed" />
              <div className="absolute right-0 top-0 h-5 w-5 rounded-tr-lg border-r-2 border-t-2 border-primary-fixed" />
              <div className="absolute bottom-0 left-0 h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-primary-fixed" />
              <div className="absolute bottom-0 right-0 h-5 w-5 rounded-br-lg border-b-2 border-r-2 border-primary-fixed" />
            </div>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-container px-3.5 py-1.5 text-label-md text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px] text-tertiary">lightbulb</span>
        <span>Posisikan wajah Anda di dalam lingkaran</span>
      </div>

      {errorMessage && (
        <p className="mt-3 max-w-md text-center text-sm text-error">{errorMessage}</p>
      )}
      {debugInfo && <p className="mt-1 max-w-md text-center text-xs text-outline">{debugInfo}</p>}

      <div className="mt-5 flex w-full flex-col gap-2">
        <button
          onClick={handleScan}
          disabled={!canScan}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary text-label-lg font-bold text-on-primary shadow-[0_8px_20px_-4px_rgba(0,105,72,0.35)] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[24px]">photo_camera</span>
          <span>{isSubmitting ? "Memproses..." : "Ambil Foto & Presensi"}</span>
        </button>
      </div>
    </section>
  );
}
