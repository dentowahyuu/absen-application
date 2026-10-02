export interface AttendanceResult {
  userName: string;
  timestamp: string;
  attendanceStatus: "clock_in" | "clock_out";
  similarity: number;
  officeName?: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

const todayLabel = new Date().toLocaleDateString("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function TodayStatusCard({ result }: { result: AttendanceResult | null }) {
  const clockIn = result?.attendanceStatus === "clock_in" ? result : null;
  const clockOut = result?.attendanceStatus === "clock_out" ? result : null;

  return (
    <section className="flex w-full flex-col gap-3 rounded-3xl bg-surface-container-lowest p-4 shadow-[0_4px_24px_-4px_rgba(0,105,72,0.08)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary">
            assignment_turned_in
          </span>
          <h2 className="text-headline-sm text-on-surface">Status Kehadiran Hari Ini</h2>
        </div>
        <span className="text-label-sm font-semibold text-primary">{todayLabel}</span>
      </div>

      {result && (
        <p className="text-body-sm text-on-surface-variant">
          Terverifikasi sebagai <span className="font-semibold text-on-surface">{result.userName}</span>{" "}
          (kemiripan {(result.similarity * 100).toFixed(1)}%)
          {result.officeName && (
            <>
              {" "}
              di <span className="font-semibold text-on-surface">{result.officeName}</span>
            </>
          )}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col justify-between rounded-2xl bg-surface-container-low p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-label-sm font-medium text-on-surface-variant">Jam Masuk</span>
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${clockIn ? "bg-primary-fixed/40" : "bg-surface-container-highest"}`}
            >
              <span
                className={`material-symbols-outlined text-[14px] ${clockIn ? "text-primary" : "text-outline"}`}
              >
                login
              </span>
            </span>
          </div>
          <div className="text-headline-sm font-extrabold tracking-tight text-on-surface">
            {clockIn ? formatTime(clockIn.timestamp) : "--:--"}{" "}
            <span className="text-label-sm font-normal text-outline">WIB</span>
          </div>
          <div
            className={`mt-2.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-label-sm ${
              clockIn
                ? "bg-primary-fixed/30 text-on-primary-fixed"
                : "bg-surface-container-highest text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[13px] font-bold">
              {clockIn ? "check_circle" : "schedule"}
            </span>
            <span className="font-bold">{clockIn ? "Berhasil" : "Belum Absen"}</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl bg-surface-container-low p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-label-sm font-medium text-on-surface-variant">Jam Pulang</span>
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${clockOut ? "bg-primary-fixed/40" : "bg-surface-container-highest"}`}
            >
              <span
                className={`material-symbols-outlined text-[14px] ${clockOut ? "text-primary" : "text-outline"}`}
              >
                logout
              </span>
            </span>
          </div>
          <div className="text-headline-sm font-extrabold tracking-tight text-on-surface">
            {clockOut ? formatTime(clockOut.timestamp) : "--:--"}{" "}
            <span className="text-label-sm font-normal text-outline">WIB</span>
          </div>
          <div
            className={`mt-2.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-label-sm ${
              clockOut
                ? "bg-primary-fixed/30 text-on-primary-fixed"
                : "bg-surface-container-highest text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">
              {clockOut ? "check_circle" : "schedule"}
            </span>
            <span>{clockOut ? "Berhasil" : "Belum Checkout"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
