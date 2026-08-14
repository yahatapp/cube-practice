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
  themeColor: "#111318",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
