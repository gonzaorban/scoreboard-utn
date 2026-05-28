import type { Metadata } from "next";
import { Cinzel, EB_Garamond, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";

// Cinzel: tipografía "grabada" estilo pergamino para títulos.
const cinzel = Cinzel({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

// EB Garamond: serif legible para el cuerpo, evoca libros antiguos.
const garamond = EB_Garamond({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Copa de las Casas · Ingeniería y Calidad",
  description:
    "Marcador oficial de la Copa de las Casas de la materia Ingeniería y Calidad. Los profesores otorgan y restan puntos; los estudiantes consultan la tabla y el historial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${cinzel.variable} ${garamond.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border/60 py-6 text-center text-sm text-muted-foreground">
          <p>
            Copa de las Casas · Materia{" "}
            <span className="font-semibold">Ingeniería y Calidad</span> ·
            Desarrollado por <span className="font-semibold">Equipo MDD</span>
          </p>
          <p className="mt-1 italic">
            “Sucede que necesitamos cierta cantidad de valor para enfrentarnos a
            nuestros enemigos…”
          </p>
        </footer>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
