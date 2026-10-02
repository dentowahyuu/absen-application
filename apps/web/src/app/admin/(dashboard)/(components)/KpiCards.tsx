export interface Stats {
  totalEmployees: number;
  presentToday: number;
  clockedOutToday: number;
  avgSimilarity: number | null;
}

function Card({
  label,
  value,
  icon,
  barClassName,
  iconWrapClassName,
  iconClassName,
  footer,
}: {
  label: string;
  value: string;
  icon: string;
  barClassName: string;
  iconWrapClassName: string;
  iconClassName: string;
  footer: React.ReactNode;
}) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-adm-surface-container-lowest p-5 shadow-sm transition-all hover:shadow-md">
      <div className={`absolute left-0 right-0 top-0 h-1.5 ${barClassName}`} />
      <div className="flex items-start justify-between">
        <div>
          <span className="text-label-md font-semibold uppercase tracking-wider text-adm-on-surface-variant">
            {label}
          </span>
          <div className="mt-1 text-[32px] font-bold leading-[38px] tracking-tight text-adm-on-surface">
            {value}
          </div>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${iconWrapClassName}`}
        >
          <span className={`material-symbols-outlined text-[26px] ${iconClassName}`}>{icon}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 border-t border-adm-surface-container-high/60 pt-3 text-body-sm text-adm-on-surface-variant">
        {footer}
      </div>
    </div>
  );
}

export function KpiCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card
        label="Total Karyawan"
        value={String(stats.totalEmployees)}
        icon="groups"
        barClassName="bg-adm-inverse-surface"
        iconWrapClassName="bg-adm-surface-container-high/60 text-adm-inverse-surface"
        iconClassName=""
        footer={
          <>
            <span className="material-symbols-outlined text-[16px]">badge</span>
            <span>Karyawan aktif terdaftar</span>
          </>
        }
      />
      <Card
        label="Hadir Hari Ini"
        value={String(stats.presentToday)}
        icon="check_circle"
        barClassName="bg-adm-primary"
        iconWrapClassName="bg-adm-primary-fixed/40 text-adm-primary"
        iconClassName="text-adm-primary"
        footer={
          <span>
            <strong className="font-semibold text-adm-on-surface">
              {stats.totalEmployees > 0
                ? `${((stats.presentToday / stats.totalEmployees) * 100).toFixed(0)}%`
                : "0%"}
            </strong>{" "}
            dari total karyawan
          </span>
        }
      />
      <Card
        label="Sudah Pulang"
        value={String(stats.clockedOutToday)}
        icon="logout"
        barClassName="bg-adm-secondary"
        iconWrapClassName="bg-adm-secondary-fixed/50 text-adm-secondary"
        iconClassName="text-adm-secondary"
        footer={<span>Sudah menyelesaikan presensi keluar</span>}
      />
      <Card
        label="Rata-rata Kemiripan"
        value={stats.avgSimilarity != null ? `${(stats.avgSimilarity * 100).toFixed(1)}%` : "-"}
        icon="face"
        barClassName="bg-adm-tertiary"
        iconWrapClassName="bg-adm-tertiary-fixed/60 text-adm-tertiary"
        iconClassName="text-adm-tertiary"
        footer={<span>Skor kecocokan wajah hari ini</span>}
      />
    </div>
  );
}
