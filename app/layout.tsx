import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/providers";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cube Practice Timer",
  description: "X-Cross と F2L の読みに強くなる、スマホ向けキューブタイマー",
  applicationName: "Cube Practice Timer",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Cube Timer" },
};

export const viewport: Viewport = {
  themeColor: "#07111f",
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
