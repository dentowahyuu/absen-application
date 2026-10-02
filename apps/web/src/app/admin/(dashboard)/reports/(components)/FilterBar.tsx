export interface LogFilters {
  from: string;
  to: string;
  name: string;
}

export function FilterBar({
  filters,
  onChange,
}: {
  filters: LogFilters;
  onChange: (filters: LogFilters) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-adm-outline-variant/30 bg-adm-surface-container-lowest p-4 shadow-sm">
      <div>
        <label className="text-xs font-medium text-adm-on-surface-variant">Nama Karyawan</label>
        <input
          type="text"
          placeholder="Cari nama..."
          value={filters.name}
          onChange={(e) => onChange({ ...filters, name: e.target.value })}
          className="mt-1 block w-40 rounded-lg border border-adm-outline-variant/40 px-3 py-2 text-sm focus:border-adm-primary focus:outline-none"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-adm-on-surface-variant">Dari Tanggal</label>
        <input
          type="date"
          value={filters.from}
          onChange={(e) => onChange({ ...filters, from: e.target.value })}
          className="mt-1 block rounded-lg border border-adm-outline-variant/40 px-3 py-2 text-sm focus:border-adm-primary focus:outline-none"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-adm-on-surface-variant">Sampai Tanggal</label>
        <input
          type="date"
          value={filters.to}
          onChange={(e) => onChange({ ...filters, to: e.target.value })}
          className="mt-1 block rounded-lg border border-adm-outline-variant/40 px-3 py-2 text-sm focus:border-adm-primary focus:outline-none"
        />
      </div>
    </div>
  );
}
