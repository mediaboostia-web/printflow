import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Print_Flow — Facturation & Gestion de Production Imprimerie",
  description: "Suivi de production, gestion de clients, devis, BAT, factures et livraisons pour imprimeries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-bg-base text-text-main">
        {children}
      </body>
    </html>
  );
}
