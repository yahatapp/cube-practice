import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Providers from "@/app/Providers";
import ServiceWorkerRegistration from "@/features/pwa/ServiceWorkerRegistration";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cube Practice Timer",
  description: "WCA形式の3×3×3スクランブルとAo5・Ao12・Ao100に対応したキューブタイマー",
  applicationName: "Cube Practice Timer",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Cube Timer" },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className="scheme-dark bg-zinc-950" lang="ja">
      <body className="min-h-dvh bg-gradient-to-b from-indigo-950/40 via-zinc-950 to-zinc-950 font-sans text-zinc-200 antialiased">
        <Providers>{children}</Providers>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
