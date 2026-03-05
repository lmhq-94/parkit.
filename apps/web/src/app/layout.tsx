import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Parkit Admin",
  description: "Parking management system admin dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}
