export interface Office {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_active: boolean;
}

export function OfficeTable({
  offices,
  onEdit,
  onDelete,
}: {
  offices: Office[];
  onEdit: (office: Office) => void;
  onDelete: (office: Office) => void;
}) {
  if (offices.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-adm-outline-variant/60 bg-adm-surface-container-lowest p-10 text-center text-body-sm text-adm-on-surface-variant">
        Belum ada lokasi kantor yang diatur. Karyawan tidak akan bisa absen sampai minimal satu
        lokasi ditambahkan.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-adm-surface-container-low/70 text-label-sm uppercase tracking-wider text-adm-on-surface-variant">
            <th className="px-4 py-3 font-semibold">Nama Kantor</th>
            <th className="px-4 py-3 font-semibold">Koordinat</th>
            <th className="px-4 py-3 font-semibold">Radius</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 text-right font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-adm-surface-container-high/40 text-body-md text-adm-on-surface">
          {offices.map((office) => (
            <tr key={office.id} className="transition-colors hover:bg-adm-surface-container-low/40">
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-adm-primary">
                    location_on
                  </span>
                  <span className="font-bold text-adm-on-surface">{office.name}</span>
                </div>
              </td>
              <td className="px-4 py-3.5 font-mono text-[12px] text-adm-on-surface-variant">
                {office.latitude.toFixed(6)}, {office.longitude.toFixed(6)}
              </td>
              <td className="px-4 py-3.5 text-adm-on-surface-variant">{office.radius_meters} m</td>
              <td className="px-4 py-3.5">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-label-sm font-semibold ${
                    office.is_active
                      ? "bg-adm-primary-fixed/40 text-adm-primary"
                      : "bg-adm-surface-container-high text-adm-on-surface-variant"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${office.is_active ? "bg-adm-primary" : "bg-adm-outline"}`}
                  />
                  {office.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </td>
              <td className="px-4 py-3.5 text-right">
                <button
                  onClick={() => onEdit(office)}
                  className="mr-3 text-label-md font-semibold text-adm-primary hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(office)}
                  className="text-label-md font-semibold text-adm-error hover:underline"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
