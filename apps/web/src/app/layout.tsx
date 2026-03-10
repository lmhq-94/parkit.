import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Parkit Dashboard Console",
  description: "Parking management system admin dashboard",
  icons: {
    icon: "/icon",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-page text-text-primary antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
