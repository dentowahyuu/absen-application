"use client";

import { useCallback, useEffect, useState } from "react";
import { KpiCards, type Stats } from "./(components)/KpiCards";
import { LogTable, type AttendanceLogRow } from "./(components)/LogTable";
import { FaceEnrolmentModal } from "./(components)/FaceEnrolmentModal";
import { EmployeeTable, type Employee } from "./(components)/EmployeeTable";

const todayLongLabel = new Date().toLocaleDateString("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function AdminPage() {
  const [logs, setLogs] = useState<AttendanceLogRow[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEnrolment, setShowEnrolment] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const todayISO = new Date().toISOString().slice(0, 10);

  const loadData = useCallback(async () => {
    const [logsRes, usersRes] = await Promise.all([
      fetch(`/api/logs?from=${todayISO}&to=${todayISO}`),
      fetch("/api/users"),
    ]);
    setLogs(await logsRes.json());
    setEmployees(await usersRes.json());
    setIsLoading(false);
  }, [todayISO]);

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 20000);
    return () => clearInterval(timer);
  }, [loadData]);

  async function handleDelete(employee: Employee) {
    if (!confirm(`Hapus karyawan "${employee.name}"? Seluruh riwayat absensinya juga akan terhapus.`)) {
      return;
    }
    const res = await fetch(`/api/users/${employee.id}`, { method: "DELETE" });
    if (res.ok) {
      loadData();
    } else {
      const data = await res.json().catch(() => null);
      alert(data?.message ?? "Gagal menghapus karyawan");
    }
  }

  const stats: Stats = {
    totalEmployees: employees.filter((u) => u.is_active).length,
    presentToday: new Set(logs.map((l) => l.user_id)).size,
    clockedOutToday: new Set(logs.filter((l) => l.clock_out).map((l) => l.user_id)).size,
    avgSimilarity:
      logs.length > 0
        ? logs.reduce((sum, l) => sum + (l.similarity ?? 0), 0) / logs.length
        : null,
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-3 pb-1 md:flex-row md:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-flex items-center justify-center rounded-md bg-adm-primary-fixed/40 p-1 text-adm-primary">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </span>
            <span className="text-label-sm font-bold uppercase tracking-wider text-adm-primary">
              Sistem Presensi Wajah • LAN
            </span>
          </div>
          <h1 className="font-jakarta text-headline-lg font-bold tracking-tight text-adm-on-surface">
            Ringkasan Presensi Hari Ini
          </h1>
          <p className="mt-0.5 flex items-center gap-2 text-body-md text-adm-on-surface-variant">
            <span className="capitalize">{todayLongLabel}</span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-adm-outline-variant" />
            <span className="flex items-center gap-1 font-medium text-adm-primary">
              <span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span>
              Diperbarui otomatis setiap 20 detik
            </span>
          </p>
        </div>
        <button
          onClick={() => setShowEnrolment(true)}
          className="flex items-center gap-2 self-start rounded-lg bg-adm-primary px-4 py-2 text-label-lg font-semibold text-adm-on-primary shadow-sm transition-all hover:bg-adm-primary-container md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Daftarkan Karyawan Baru
        </button>
      </div>

      <KpiCards stats={stats} />

      <div className="flex flex-col gap-3 rounded-xl bg-adm-surface-container-lowest shadow-sm">
        <div className="flex items-center gap-3 border-b border-adm-surface-container-high/50 p-5">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-adm-primary opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-adm-primary" />
          </span>
          <h2 className="font-jakarta text-headline-sm font-bold text-adm-on-surface">
            Log Presensi Hari Ini
          </h2>
          <span className="rounded-full bg-adm-primary-fixed/40 px-2 py-0.5 text-label-sm font-semibold text-adm-on-secondary-fixed-variant">
            {logs.length} tercatat
          </span>
        </div>
        {isLoading ? (
          <p className="px-5 pb-5 text-body-sm text-adm-on-surface-variant">Memuat data...</p>
        ) : (
          <div className="pb-2">
            <LogTable logs={logs} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-adm-surface-container-lowest shadow-sm">
        <div className="flex items-center justify-between border-b border-adm-surface-container-high/50 p-5">
          <h2 className="font-jakarta text-headline-sm font-bold text-adm-on-surface">
            Daftar Karyawan
          </h2>
          <span className="text-body-sm text-adm-on-surface-variant">
            {employees.length} karyawan
          </span>
        </div>
        {isLoading ? (
          <p className="px-5 pb-5 text-body-sm text-adm-on-surface-variant">Memuat data...</p>
        ) : (
          <div className="pb-2">
            <EmployeeTable
              employees={employees}
              onEdit={(employee) => setEditingEmployee(employee)}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>

      {showEnrolment && (
        <FaceEnrolmentModal onClose={() => setShowEnrolment(false)} onSaved={loadData} />
      )}

      {editingEmployee && (
        <FaceEnrolmentModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSaved={loadData}
        />
      )}
    </>
  );
}
