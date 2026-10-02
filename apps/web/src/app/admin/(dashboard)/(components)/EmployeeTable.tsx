export interface Employee {
  id: string;
  employee_code: string;
  name: string;
  email: string | null;
  department: string | null;
  is_active: boolean;
  photo_url: string | null;
}

export function EmployeeTable({
  employees,
  onEdit,
  onDelete,
}: {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}) {
  if (employees.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-adm-outline-variant/60 bg-adm-surface-container-lowest p-10 text-center text-body-sm text-adm-on-surface-variant">
        Tidak ada karyawan yang cocok.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-adm-surface-container-low/70 text-label-sm uppercase tracking-wider text-adm-on-surface-variant">
            <th className="px-4 py-3 font-semibold">Karyawan</th>
            <th className="px-4 py-3 font-semibold">Departemen</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 text-right font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-adm-surface-container-high/40 text-body-md text-adm-on-surface">
          {employees.map((employee) => (
            <tr key={employee.id} className="transition-colors hover:bg-adm-surface-container-low/40">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {employee.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/photos/${employee.photo_url}`}
                      alt={employee.name}
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-adm-primary-fixed"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-adm-surface-container-high" />
                  )}
                  <div>
                    <div className="font-bold text-adm-on-surface">{employee.name}</div>
                    <div className="font-mono text-[11px] text-adm-outline">{employee.employee_code}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-adm-on-surface-variant">{employee.department || "-"}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-label-sm font-semibold ${
                    employee.is_active
                      ? "bg-adm-primary-fixed/40 text-adm-primary"
                      : "bg-adm-surface-container-high text-adm-on-surface-variant"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${employee.is_active ? "bg-adm-primary" : "bg-adm-outline"}`}
                  />
                  {employee.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onEdit(employee)}
                  className="mr-3 text-label-md font-semibold text-adm-primary hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(employee)}
                  className="text-label-md font-semibold text-adm-error hover:underline"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
