"use client";

import { useEffect, useState } from "react";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function greetingForHour(hour: number) {
  if (hour < 10) return "Selamat Pagi!";
  if (hour < 15) return "Selamat Siang!";
  if (hour < 18) return "Selamat Sore!";
  return "Selamat Malam!";
}

export function GreetingCard() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateLabel = now
    ? `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`
    : "";
  const timeLabel = now
    ? [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map((n) => String(n).padStart(2, "0"))
        .join(":")
    : "--:--:--";

  return (
    <section className="relative flex w-full flex-col gap-3 overflow-hidden rounded-3xl bg-surface-container-lowest p-4 shadow-[0_4px_24px_-4px_rgba(0,105,72,0.08)]">
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary-fixed/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-secondary-fixed/30 blur-xl" />

      <div className="relative z-10 flex items-center justify-between">
        <span className="text-label-md font-bold uppercase tracking-wide text-primary">
          {now ? greetingForHour(now.getHours()) : "Halo!"}
        </span>
      </div>

      <div className="relative z-10 flex w-full flex-col items-center justify-center rounded-2xl bg-surface-container-low p-4 text-center">
        <div className="mb-1 flex items-center justify-center gap-1.5 text-center text-on-surface-variant">
          <span className="material-symbols-outlined shrink-0 text-[18px] text-secondary">
            calendar_today
          </span>
          <span className="text-label-md font-semibold">{dateLabel || "Memuat tanggal..."}</span>
        </div>
        <div className="my-0.5 flex flex-wrap items-baseline justify-center gap-1 text-on-surface">
          <span className="text-[clamp(2rem,11vw,3rem)] font-extrabold leading-none tracking-tight text-primary">
            {timeLabel}
          </span>
          <span className="ml-1 text-headline-sm font-bold text-outline">WIB</span>
        </div>
      </div>
    </section>
  );
}
