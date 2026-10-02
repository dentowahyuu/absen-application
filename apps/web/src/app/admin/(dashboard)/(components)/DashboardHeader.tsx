"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const todayLabel = new Date().toLocaleDateString("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function DashboardHeader() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => setUsername(data.username));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="fixed left-[260px] right-0 top-0 z-40 flex h-16 items-center justify-end gap-4 border-b border-adm-outline-variant/20 bg-adm-surface-container-lowest px-6">
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-adm-outline-variant/40 px-3 py-2 text-label-md text-adm-on-surface md:flex">
          <span className="material-symbols-outlined text-[18px] text-adm-on-surface-variant">
            calendar_today
          </span>
          <span className="capitalize">{todayLabel}</span>
        </div>

        <div className="mx-1 h-6 w-px bg-adm-outline-variant/40" />

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="group flex items-center gap-2 pl-1"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-adm-primary-fixed/40 text-sm font-bold text-adm-primary ring-1 ring-adm-outline-variant/30">
              {username ? username[0]?.toUpperCase() : "?"}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-label-md font-semibold text-adm-on-surface group-hover:text-adm-primary">
                {username ?? "..."}
              </span>
              <span className="w-fit rounded bg-adm-surface-container-high px-1.5 py-0.2 text-label-sm text-adm-on-surface-variant">
                Admin
              </span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-adm-outline group-hover:text-adm-on-surface">
              expand_more
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 overflow-hidden rounded-lg border border-adm-outline-variant/30 bg-adm-surface-container-lowest shadow-md">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-label-md text-adm-error hover:bg-adm-error-container/50"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
