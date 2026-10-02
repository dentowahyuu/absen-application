export function AttendanceHeader() {
  return (
    <header className="fixed top-0 z-50 w-full bg-surface/85 pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-lg min-w-0 items-center gap-3 px-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-extrabold text-on-primary">
          H
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-headline-sm font-bold leading-none text-on-surface">
              HadirYuk
            </span>
            <span className="text-body-sm text-outline">•</span>
            <span className="text-label-md uppercase tracking-wider text-primary">Presensi</span>
          </div>
          <div className="mt-0.5 inline-flex w-fit max-w-full items-center gap-1.5 rounded-full bg-primary-fixed/30 px-2 py-0.5">
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-primary" />
            <span className="truncate text-label-sm text-on-primary-fixed-variant">
              Verifikasi Wajah &amp; Lokasi GPS
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
