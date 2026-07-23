import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Print_Flow — Facturation & Gestion de Production Imprimerie",
  description: "Suivi de production, gestion de clients, devis, BAT, factures et livraisons pour imprimeries.",
  icons: {
    icon: "/Favicon_PrintFlow.png",
    shortcut: "/Favicon_PrintFlow.png",
    apple: "/Favicon_PrintFlow.png",
  },
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
      <head>
        <link rel="icon" href="/Favicon_PrintFlow.png" type="image/png" />
        <link rel="shortcut icon" href="/Favicon_PrintFlow.png" type="image/png" />
        <link rel="apple-touch-icon" href="/Favicon_PrintFlow.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,300..900;1,300..900&family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-bg-base text-text-main">
        {children}
      </body>
    </html>
  );
}
