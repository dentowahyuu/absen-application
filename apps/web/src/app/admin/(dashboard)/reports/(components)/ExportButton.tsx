import type { AttendanceLogRow } from "../../(components)/LogTable";

function toCsv(logs: AttendanceLogRow[]): string {
  const header = ["Kode Karyawan", "Nama", "Masuk", "Pulang", "Status", "Kemiripan"];
  const rows = logs.map((log) => [
    log.employee_code,
    log.name,
    log.clock_in ?? "",
    log.clock_out ?? "",
    log.status,
    log.similarity != null ? (log.similarity * 100).toFixed(1) : "",
  ]);
  return [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export function ExportButton({ logs }: { logs: AttendanceLogRow[] }) {
  function handleExport() {
    const csv = toCsv(logs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rekap-absensi-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      disabled={logs.length === 0}
      className="flex items-center gap-2 rounded-lg bg-adm-surface-container-lowest px-4 py-2 text-label-md font-medium text-adm-on-surface shadow-sm hover:bg-adm-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-[18px] text-adm-primary">download</span>
      Export CSV
    </button>
  );
}
