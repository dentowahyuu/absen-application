"use client";

import { useEffect, useState } from "react";

interface HealthCheck {
  status: "ok" | "down";
  latencyMs: number | null;
  modelLoaded?: boolean;
}

interface HealthResponse {
  db: HealthCheck;
  minio: HealthCheck;
  ai: HealthCheck;
  checkedAt: string;
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      {ok && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-adm-primary-fixed-dim opacity-75" />
      )}
      <span
        className={`relative inline-flex h-2 w-2 rounded-full ${ok ? "bg-adm-primary-fixed-dim" : "bg-adm-error"}`}
      />
    </span>
  );
}

export function SystemHealthWidget() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/system/health");
        const data = await res.json();
        if (!cancelled) setHealth(data);
      } catch {
        // keep last known state on transient fetch failure
      }
    }
    load();
    const timer = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const allOk = health && health.db.status === "ok" && health.minio.status === "ok" && health.ai.status === "ok";

  return (
    <div className="rounded-xl border border-white/10 bg-adm-inverse-surface p-4 text-adm-inverse-on-surface shadow-sm">
      <div className="mb-2 flex items-center justify-between border-b border-white/15 pb-2">
        <span className="text-label-sm font-semibold tracking-wide text-adm-inverse-on-surface">
          Status Server Lokal
        </span>
        <StatusDot ok={Boolean(allOk)} />
      </div>
      <div className="space-y-1.5 text-body-sm text-adm-secondary-fixed-dim">
        <div className="flex items-center justify-between">
          <span className="text-white/60">Database:</span>
          <span className={`font-medium ${health?.db.status === "ok" ? "text-adm-primary-fixed-dim" : "text-red-300"}`}>
            {!health ? "..." : health.db.status === "ok" ? `Online (${health.db.latencyMs}ms)` : "Offline"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/60">Storage:</span>
          <span className={`font-medium ${health?.minio.status === "ok" ? "text-adm-primary-fixed-dim" : "text-red-300"}`}>
            {!health ? "..." : health.minio.status === "ok" ? "MinIO OK" : "MinIO Offline"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/60">AI Engine:</span>
          <span className={`font-medium ${health?.ai.status === "ok" ? "text-adm-primary-fixed-dim" : "text-red-300"}`}>
            {!health ? "..." : health.ai.status === "ok" ? `Aktif (${health.ai.latencyMs}ms)` : "Offline"}
          </span>
        </div>
      </div>
    </div>
  );
}
