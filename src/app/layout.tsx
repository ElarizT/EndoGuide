import type { Metadata } from "next";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "EndoGuide",
  description: "Patient intelligence and research organization for endometriosis"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
          <SidebarNav />
          <main className="p-6 md:p-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
