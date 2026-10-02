"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SystemHealthWidget } from "./SystemHealthWidget";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "grid_view" },
  { href: "/admin/reports", label: "Laporan & Rekap", icon: "summarize" },
  { href: "/admin/offices", label: "Lokasi Kantor", icon: "location_on" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed bottom-0 left-0 top-0 z-50 flex w-[260px] select-none flex-col justify-between border-r border-adm-outline-variant/30 bg-adm-surface-container-lowest">
      <div className="flex flex-col">
        <div className="flex h-16 items-center justify-between border-b border-adm-outline-variant/20 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-adm-primary text-sm font-extrabold text-adm-on-primary">
              H
            </div>
            <span className="font-jakarta text-headline-sm font-bold tracking-tight text-adm-primary">
              HadirYuk
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-adm-primary-fixed-dim/40 bg-adm-primary-fixed/30 px-2 py-0.5 text-label-sm text-adm-on-secondary-fixed-variant">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-adm-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-adm-primary" />
            </span>
            LAN
          </span>
        </div>

        <nav className="mt-2 flex flex-col gap-1 p-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-label-md transition-all ${
                  isActive
                    ? "rounded-l-lg border-r-4 border-adm-primary bg-adm-primary-fixed/25 font-semibold text-adm-primary"
                    : "text-adm-on-surface-variant hover:bg-adm-surface-container-low hover:text-adm-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-2">
        <SystemHealthWidget />
      </div>
    </aside>
  );
}
