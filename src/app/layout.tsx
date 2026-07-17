import type { Metadata } from "next";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { getConfiguredStorageMode } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "EndoGuide",
  description: "Patient intelligence and research organization for endometriosis"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const storageMode = getConfiguredStorageMode();

  return (
    <html lang="en">
      <body>
        <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
          <SidebarNav />
          <main className="p-6 md:p-10">
            {storageMode === "local" ? (
              <p className="mb-6 rounded-md border bg-muted p-3 text-sm leading-6 text-muted-foreground">
                Local-only mode: health records stay in this browser and are not synced. Clearing browser data can remove them.
              </p>
            ) : null}
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
