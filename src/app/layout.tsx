import "./globals.css";
import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Cuotas Moderadoras",
  description: "Sistema web para el control de cuotas moderadoras y particulares.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <NuqsAdapter>
          {children}
          <Toaster richColors />
        </NuqsAdapter>
      </body>
    </html>
  );
}