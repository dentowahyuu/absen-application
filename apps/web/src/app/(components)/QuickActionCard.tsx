import Link from "next/link";

interface QuickActionCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function QuickActionCard({ href, title, description, icon }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-600">
          {title}
        </h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </Link>
  );
}
