"use client";

import { useCallback, useEffect, useState } from "react";
import { LogTable, type AttendanceLogRow } from "../(components)/LogTable";
import { FilterBar, type LogFilters } from "./(components)/FilterBar";
import { ExportButton } from "./(components)/ExportButton";

function defaultFilters(): LogFilters {
  const to = new Date().toISOString().slice(0, 10);
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 6);
  const from = fromDate.toISOString().slice(0, 10);
  return { from, to, name: "" };
}

export default function ReportsPage() {
  const [filters, setFilters] = useState<LogFilters>(defaultFilters);
  const [logs, setLogs] = useState<AttendanceLogRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ from: filters.from, to: filters.to });
    const res = await fetch(`/api/logs?${params.toString()}`);
    setLogs(await res.json());
    setIsLoading(false);
  }, [filters.from, filters.to]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filteredLogs = logs.filter((log) =>
    log.name.toLowerCase().includes(filters.name.trim().toLowerCase())
  );

  return (
    <>
      <div>
        <div className="mb-1 flex items-center gap-2">
          <span className="inline-flex items-center justify-center rounded-md bg-adm-primary-fixed/40 p-1 text-adm-primary">
            <span className="material-symbols-outlined text-[18px]">summarize</span>
          </span>
          <span className="text-label-sm font-bold uppercase tracking-wider text-adm-primary">
            Laporan &amp; Rekap
          </span>
        </div>
        <h1 className="font-jakarta text-headline-lg font-bold tracking-tight text-adm-on-surface">
          Rekap Absensi
        </h1>
        <p className="mt-0.5 text-body-md text-adm-on-surface-variant">
          Filter dan ekspor data kehadiran karyawan
        </p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <FilterBar filters={filters} onChange={setFilters} />
        <ExportButton logs={filteredLogs} />
      </div>

      <div className="rounded-xl bg-adm-surface-container-lowest shadow-sm">
        <div className="border-b border-adm-surface-container-high/50 p-5">
          <h2 className="font-jakarta text-headline-sm font-bold text-adm-on-surface">
            Hasil ({filteredLogs.length} baris)
          </h2>
        </div>
        {isLoading ? (
          <p className="px-5 py-5 text-body-sm text-adm-on-surface-variant">Memuat data...</p>
        ) : (
          <div className="pb-2">
            <LogTable logs={filteredLogs} />
          </div>
        )}
      </div>
    </>
  );
}
