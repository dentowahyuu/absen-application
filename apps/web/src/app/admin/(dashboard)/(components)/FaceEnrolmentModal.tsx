"use client";

import { useRef, useState } from "react";
import type { Employee } from "./EmployeeTable";

function IconInput({
  icon,
  ...props
}: { icon: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-adm-outline">
        {icon}
      </span>
      <input
        {...props}
        className="w-full rounded-lg border border-adm-outline-variant/40 bg-adm-surface-container-lowest py-2.5 pl-10 pr-3 text-body-md text-adm-on-surface placeholder:text-adm-outline focus:border-adm-primary focus:outline-none focus:ring-1 focus:ring-adm-primary"
      />
    </div>
  );
}

export function FaceEnrolmentModal({
  employee,
  onClose,
  onSaved,
}: {
  employee?: Employee;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEditing = Boolean(employee);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [employeeCode, setEmployeeCode] = useState(employee?.employee_code ?? "");
  const [name, setName] = useState(employee?.name ?? "");
  const [email, setEmail] = useState(employee?.email ?? "");
  const [department, setDepartment] = useState(employee?.department ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyPhoto(file: File | null) {
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) applyPhoto(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEditing && !photo) {
      setError("Foto wajah wajib diunggah");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("employee_code", employeeCode);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("department", department);
      if (photo) {
        formData.append("photo", photo);
      }

      const res = await fetch(isEditing ? `/api/users/${employee!.id}` : "/api/users", {
        method: isEditing ? "PATCH" : "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message ?? "Gagal menyimpan data karyawan");
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentPhotoUrl = preview ?? (employee?.photo_url ? `/api/photos/${employee.photo_url}` : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-adm-inverse-surface/50 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-adm-surface-container-lowest shadow-xl">
        <div className="flex items-center justify-between border-b border-adm-outline-variant/20 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-adm-primary-fixed/40 text-adm-primary">
              <span className="material-symbols-outlined text-[20px]">
                {isEditing ? "edit" : "person_add"}
              </span>
            </span>
            <h2 className="font-jakarta text-headline-sm font-bold text-adm-on-surface">
              {isEditing ? "Edit Karyawan" : "Daftarkan Karyawan Baru"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-adm-outline hover:bg-adm-surface-container-low hover:text-adm-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-label-md font-medium text-adm-on-surface">
                Kode Karyawan
              </label>
              <IconInput
                icon="badge"
                required
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                placeholder="mis. 004"
              />
            </div>

            <div>
              <label className="mb-1 block text-label-md font-medium text-adm-on-surface">
                Nama Lengkap
              </label>
              <IconInput
                icon="person"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="mis. Siti Rahmawati"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-label-md font-medium text-adm-on-surface">
                  Email
                </label>
                <IconInput
                  icon="mail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="opsional"
                />
              </div>
              <div>
                <label className="mb-1 block text-label-md font-medium text-adm-on-surface">
                  Departemen
                </label>
                <IconInput
                  icon="apartment"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="opsional"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-label-md font-medium text-adm-on-surface">
                Foto Wajah Master
                {isEditing && (
                  <span className="font-normal text-adm-outline"> (kosongkan jika tidak diubah)</span>
                )}
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => applyPhoto(e.target.files?.[0] ?? null)}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed p-4 transition-colors ${
                  isDragging
                    ? "border-adm-primary bg-adm-primary-fixed/20"
                    : "border-adm-outline-variant/50 hover:border-adm-primary hover:bg-adm-surface-container-low"
                }`}
              >
                {currentPhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentPhotoUrl}
                    alt="Preview"
                    className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-adm-outline-variant/30"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-adm-surface-container-high text-adm-outline">
                    <span className="material-symbols-outlined text-[28px]">add_a_photo</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-label-md font-semibold text-adm-on-surface">
                    {photo ? photo.name : currentPhotoUrl ? "Ganti foto" : "Klik atau tarik foto ke sini"}
                  </p>
                  <p className="mt-0.5 text-body-sm text-adm-on-surface-variant">
                    Pastikan wajah terlihat jelas &amp; menghadap kamera
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-4 flex items-center gap-1.5 text-body-sm text-adm-error">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </p>
          )}

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-adm-outline-variant/40 py-2.5 text-label-lg font-semibold text-adm-on-surface hover:bg-adm-surface-container-low"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-adm-primary py-2.5 text-label-lg font-semibold text-adm-on-primary shadow-sm hover:bg-adm-primary-container disabled:cursor-not-allowed disabled:bg-adm-outline-variant"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSubmitting ? "sync" : "check"}
              </span>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
