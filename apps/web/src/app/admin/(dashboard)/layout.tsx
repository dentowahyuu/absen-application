import { Sidebar } from "./(components)/Sidebar";
import { DashboardHeader } from "./(components)/DashboardHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
      />
      <div className="font-inter min-h-screen bg-adm-surface">
        <Sidebar />
        <DashboardHeader />
        <main className="min-h-screen pl-[260px] pt-16">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
