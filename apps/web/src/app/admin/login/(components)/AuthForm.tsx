"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"loading" | "setup" | "login">("loading");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => setMode(data.hasAdmin ? "login" : "setup"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "setup" && password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(mode === "setup" ? "/api/auth/setup" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message ?? "Gagal masuk");
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-adm-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-adm-primary text-xl font-bold text-adm-on-primary">
            H
          </div>
          <span className="font-jakarta text-headline-sm font-bold tracking-tight text-adm-primary">
            HadirYuk
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-adm-primary-fixed-dim/40 bg-adm-primary-fixed/30 px-2.5 py-0.5 text-label-sm text-adm-on-secondary-fixed-variant">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-adm-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-adm-primary" />
            </span>
            LAN • Server Lokal
          </span>
        </div>

        {mode === "loading" ? (
          <p className="text-center text-body-sm text-adm-on-surface-variant">Memuat...</p>
        ) : (
          <div className="rounded-xl bg-adm-surface-container-lowest p-6 shadow-sm">
            <h1 className="font-jakarta text-headline-md font-bold text-adm-on-surface">
              {mode === "setup" ? "Buat Akun Admin" : "Masuk ke Dashboard"}
            </h1>
            <p className="mt-1 text-body-sm text-adm-on-surface-variant">
              {mode === "setup"
                ? "Belum ada akun admin. Buat akun pertama untuk mengelola sistem absensi."
                : "Masukkan username dan password admin untuk melanjutkan."}
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="text-label-md font-medium text-adm-on-surface">
                  Username
                </label>
                <div className="relative mt-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-adm-outline">
                    person
                  </span>
                  <input
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-lg border border-adm-outline-variant/40 bg-adm-surface-container-lowest py-2 pl-10 pr-3 text-body-sm text-adm-on-surface placeholder:text-adm-outline focus:border-adm-primary focus:outline-none focus:ring-1 focus:ring-adm-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-label-md font-medium text-adm-on-surface">
                  Password
                </label>
                <div className="relative mt-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-adm-outline">
                    lock
                  </span>
                  <input
                    required
                    type="password"
                    minLength={mode === "setup" ? 8 : undefined}
                    autoComplete={mode === "setup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-adm-outline-variant/40 bg-adm-surface-container-lowest py-2 pl-10 pr-3 text-body-sm text-adm-on-surface placeholder:text-adm-outline focus:border-adm-primary focus:outline-none focus:ring-1 focus:ring-adm-primary"
                  />
                </div>
              </div>

              {mode === "setup" && (
                <div>
                  <label className="text-label-md font-medium text-adm-on-surface">
                    Konfirmasi Password
                  </label>
                  <div className="relative mt-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-adm-outline">
                      lock_reset
                    </span>
                    <input
                      required
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-lg border border-adm-outline-variant/40 bg-adm-surface-container-lowest py-2 pl-10 pr-3 text-body-sm text-adm-on-surface placeholder:text-adm-outline focus:border-adm-primary focus:outline-none focus:ring-1 focus:ring-adm-primary"
                    />
                  </div>
                </div>
              )}

              {error && (
                <p className="flex items-center gap-1.5 text-body-sm text-adm-error">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-adm-primary py-2.5 text-label-lg font-semibold text-adm-on-primary shadow-sm transition-all hover:bg-adm-primary-container disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {mode === "setup" ? "person_add" : "login"}
                </span>
                {isSubmitting ? "Memproses..." : mode === "setup" ? "Buat Akun" : "Masuk"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
