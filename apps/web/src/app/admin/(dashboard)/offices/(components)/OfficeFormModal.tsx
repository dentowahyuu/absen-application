"use client";

import { useState } from "react";
import type { Office } from "./OfficeTable";

export function OfficeFormModal({
  office,
  onClose,
  onSaved,
}: {
  office?: Office;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEditing = Boolean(office);

  const [name, setName] = useState(office?.name ?? "");
  const [latitude, setLatitude] = useState(office ? String(office.latitude) : "");
  const [longitude, setLongitude] = useState(office ? String(office.longitude) : "");
  const [radiusMeters, setRadiusMeters] = useState(office ? String(office.radius_meters) : "30");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name,
        latitude: Number(latitude),
        longitude: Number(longitude),
        radius_meters: Number(radiusMeters),
      };

      const res = await fetch(isEditing ? `/api/offices/${office!.id}` : "/api/offices", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message ?? "Gagal menyimpan lokasi kantor");
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-adm-inverse-surface/50 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-adm-surface-container-lowest shadow-xl">
        <div className="flex items-center justify-between border-b border-adm-outline-variant/20 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-adm-primary-fixed/40 text-adm-primary">
              <span className="material-symbols-outlined text-[20px]">location_on</span>
            </span>
            <h2 className="font-jakarta text-headline-sm font-bold text-adm-on-surface">
              {isEditing ? "Edit Lokasi Kantor" : "Tambah Lokasi Kantor"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-adm-outline hover:bg-adm-surface-container-low hover:text-adm-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-label-md font-medium text-adm-on-surface">
                Nama Kantor
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="mis. Kantor Pusat (Jakarta)"
                className="w-full rounded-lg border border-adm-outline-variant/40 bg-adm-surface-container-lowest px-3 py-2.5 text-body-md text-adm-on-surface placeholder:text-adm-outline focus:border-adm-primary focus:outline-none focus:ring-1 focus:ring-adm-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-label-md font-medium text-adm-on-surface">
                  Latitude
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="-6.2056565"
                  className="w-full rounded-lg border border-adm-outline-variant/40 bg-adm-surface-container-lowest px-3 py-2.5 font-mono text-body-sm text-adm-on-surface placeholder:text-adm-outline focus:border-adm-primary focus:outline-none focus:ring-1 focus:ring-adm-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-label-md font-medium text-adm-on-surface">
                  Longitude
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="106.8039111"
                  className="w-full rounded-lg border border-adm-outline-variant/40 bg-adm-surface-container-lowest px-3 py-2.5 font-mono text-body-sm text-adm-on-surface placeholder:text-adm-outline focus:border-adm-primary focus:outline-none focus:ring-1 focus:ring-adm-primary"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-label-md font-medium text-adm-on-surface">
                Radius Absen (meter)
              </label>
              <input
                required
                type="number"
                min={5}
                step={1}
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(e.target.value)}
                className="w-full rounded-lg border border-adm-outline-variant/40 bg-adm-surface-container-lowest px-3 py-2.5 text-body-md text-adm-on-surface focus:border-adm-primary focus:outline-none focus:ring-1 focus:ring-adm-primary"
              />
              <p className="mt-1 text-body-sm text-adm-on-surface-variant">
                Karyawan hanya bisa absen jika GPS-nya berada dalam radius ini dari titik kantor.
              </p>
            </div>

            <p className="flex items-start gap-1.5 text-body-sm text-adm-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-adm-secondary">info</span>
              Salin latitude/longitude dari Google Maps: klik kanan titik lokasi → klik koordinat yang muncul.
            </p>
          </div>

          {error && (
            <p className="mt-4 flex items-center gap-1.5 text-body-sm text-adm-error">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </p>
          )}

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-adm-outline-variant/40 py-2.5 text-label-lg font-semibold text-adm-on-surface hover:bg-adm-surface-container-low"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-adm-primary py-2.5 text-label-lg font-semibold text-adm-on-primary shadow-sm hover:bg-adm-primary-container disabled:cursor-not-allowed disabled:bg-adm-outline-variant"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
