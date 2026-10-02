export interface AttendanceLogRow {
  id: string;
  user_id: string;
  name: string;
  employee_code: string;
  clock_in: string | null;
  clock_out: string | null;
  status: string;
  similarity: number | null;
  photo_url: string | null;
  office_name: string | null;
}

function formatTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function similarityColor(similarity: number | null) {
  if (similarity == null) return "text-adm-on-surface-variant";
  if (similarity >= 0.7) return "text-adm-primary";
  if (similarity >= 0.5) return "text-adm-tertiary";
  return "text-adm-error";
}

export function LogTable({ logs }: { logs: AttendanceLogRow[] }) {
  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-adm-outline-variant/60 bg-adm-surface-container-lowest p-10 text-center text-body-sm text-adm-on-surface-variant">
        Belum ada data absensi.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-adm-surface-container-low/70 text-label-sm uppercase tracking-wider text-adm-on-surface-variant">
            <th className="px-4 py-3 font-semibold">Karyawan</th>
            <th className="px-4 py-3 font-semibold">Lokasi</th>
            <th className="px-4 py-3 font-semibold">Jam Masuk</th>
            <th className="px-4 py-3 font-semibold">Jam Pulang</th>
            <th className="px-4 py-3 font-semibold">Kemiripan</th>
            <th className="px-4 py-3 text-center font-semibold">Bukti</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-adm-surface-container-high/40 text-body-md text-adm-on-surface">
          {logs.map((log) => (
            <tr key={log.id} className="transition-colors hover:bg-adm-surface-container-low/40">
              <td className="px-4 py-3.5">
                <div className="font-bold text-adm-on-surface">{log.name}</div>
                <div className="font-mono text-[11px] text-adm-outline">{log.employee_code}</div>
              </td>
              <td className="px-4 py-3.5 text-adm-on-surface-variant">
                {log.office_name ?? "-"}
              </td>
              <td className="px-4 py-3.5 font-mono text-[13px]">{formatTime(log.clock_in)}</td>
              <td className="px-4 py-3.5 font-mono text-[13px]">{formatTime(log.clock_out)}</td>
              <td className={`px-4 py-3.5 font-mono font-semibold ${similarityColor(log.similarity)}`}>
                {log.similarity != null ? `${(log.similarity * 100).toFixed(1)}%` : "-"}
              </td>
              <td className="px-4 py-3.5 text-center">
                {log.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/photos/${log.photo_url}`}
                    alt={log.name}
                    className="mx-auto h-9 w-9 rounded-md object-cover ring-1 ring-adm-primary/40"
                  />
                ) : (
                  <span className="text-adm-outline">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
