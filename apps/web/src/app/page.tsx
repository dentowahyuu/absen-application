import { HeroSection } from "./(components)/HeroSection";
import { QuickActionCard } from "./(components)/QuickActionCard";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 py-10 sm:grid-cols-2">
        <QuickActionCard
          href="/absen"
          title="Absen Sekarang"
          description="Buka kamera dan lakukan presensi masuk/pulang."
          icon={<span className="text-xl">📷</span>}
        />
        <QuickActionCard
          href="/admin"
          title="Dashboard Admin"
          description="Lihat rekap kehadiran & kelola data karyawan."
          icon={<span className="text-xl">📊</span>}
        />
      </section>
    </main>
  );
}
