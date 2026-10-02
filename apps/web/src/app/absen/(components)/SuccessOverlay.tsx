"use client";

import { useEffect } from "react";
import type { AttendanceResult } from "./TodayStatusCard";

const AUTO_DISMISS_MS = 4000;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export function SuccessOverlay({
  result,
  onDismiss,
}: {
  result: AttendanceResult;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const isClockOut = result.attendanceStatus === "clock_out";

  return (
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-[60] flex cursor-pointer items-center justify-center bg-on-background/60 px-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "pop-in 0.45s cubic-bezier(0.34,1.56,0.64,1)" }}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-surface-container-lowest p-7 text-center shadow-2xl"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-fixed/40">
          <span className="material-symbols-outlined text-[48px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>

        <h2 className="mt-4 text-headline-md font-bold text-on-surface">
          {isClockOut ? "Sampai Jumpa!" : "Selamat Bekerja!"}
        </h2>
        <p className="mt-1 text-body-md text-on-surface-variant">
          {isClockOut ? "Presensi pulang berhasil dicatat" : "Presensi masuk berhasil dicatat"}
        </p>

        <div className="mt-5 rounded-2xl bg-surface-container-low p-4">
          <p className="text-headline-sm font-bold text-primary">{result.userName}</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-label-sm font-bold ${
                isClockOut
                  ? "bg-secondary-fixed/50 text-on-secondary-fixed-variant"
                  : "bg-primary-fixed/40 text-on-primary-fixed"
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {isClockOut ? "logout" : "login"}
              </span>
              {isClockOut ? "Absen Pulang" : "Absen Masuk"}
            </span>
            <span className="text-body-md font-semibold text-on-surface">
              {formatTime(result.timestamp)} WIB
            </span>
          </div>
          {result.officeName && (
            <p className="mt-2 flex items-center justify-center gap-1 text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[15px]">location_on</span>
              {result.officeName}
            </p>
          )}
        </div>

        <p className="mt-4 text-body-sm text-outline">Ketuk di mana saja untuk menutup</p>

        <div className="absolute bottom-0 left-0 h-1 bg-primary" style={{ animation: `shrink-width ${AUTO_DISMISS_MS}ms linear` }} />
      </div>
    </div>
  );
}
