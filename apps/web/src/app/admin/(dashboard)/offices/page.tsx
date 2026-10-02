"use client";

import { useCallback, useEffect, useState } from "react";
import { OfficeTable, type Office } from "./(components)/OfficeTable";
import { OfficeFormModal } from "./(components)/OfficeFormModal";

export default function OfficesPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);

  const loadOffices = useCallback(async () => {
    const res = await fetch("/api/offices");
    setOffices(await res.json());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadOffices();
  }, [loadOffices]);

  async function handleDelete(office: Office) {
    if (!confirm(`Hapus lokasi "${office.name}"? Karyawan tidak akan bisa absen dari titik ini lagi.`)) {
      return;
    }
    const res = await fetch(`/api/offices/${office.id}`, { method: "DELETE" });
    if (res.ok) {
      loadOffices();
    } else {
      const data = await res.json().catch(() => null);
      alert(data?.message ?? "Gagal menghapus lokasi kantor");
    }
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-3 pb-1 md:flex-row md:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-flex items-center justify-center rounded-md bg-adm-primary-fixed/40 p-1 text-adm-primary">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
            </span>
            <span className="text-label-sm font-bold uppercase tracking-wider text-adm-primary">
              Geofencing
            </span>
          </div>
          <h1 className="font-jakarta text-headline-lg font-bold tracking-tight text-adm-on-surface">
            Lokasi Kantor
          </h1>
          <p className="mt-0.5 text-body-md text-adm-on-surface-variant">
            Karyawan hanya bisa absen jika lokasi GPS mereka berada dalam radius salah satu titik
            di bawah ini.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 self-start rounded-lg bg-adm-primary px-4 py-2 text-label-lg font-semibold text-adm-on-primary shadow-sm transition-all hover:bg-adm-primary-container md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
          Tambah Lokasi
        </button>
      </div>

      <div className="rounded-xl bg-adm-surface-container-lowest shadow-sm">
        <div className="border-b border-adm-surface-container-high/50 p-5">
          <h2 className="font-jakarta text-headline-sm font-bold text-adm-on-surface">
            {offices.length} Lokasi Terdaftar
          </h2>
        </div>
        {isLoading ? (
          <p className="px-5 py-5 text-body-sm text-adm-on-surface-variant">Memuat data...</p>
        ) : (
          <div className="pb-2">
            <OfficeTable
              offices={offices}
              onEdit={(office) => setEditingOffice(office)}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>

      {showForm && <OfficeFormModal onClose={() => setShowForm(false)} onSaved={loadOffices} />}

      {editingOffice && (
        <OfficeFormModal
          office={editingOffice}
          onClose={() => setEditingOffice(null)}
          onSaved={loadOffices}
        />
      )}
    </>
  );
}
