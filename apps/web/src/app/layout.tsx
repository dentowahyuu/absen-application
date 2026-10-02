import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Absen Wajah",
  description: "Absensi karyawan berbasis face recognition (LAN)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
