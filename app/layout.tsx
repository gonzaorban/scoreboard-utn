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
  // Genérico a propósito: el layout raíz también envuelve /login y /registro,
  // que no tienen materia. La home lo pisa con su `generateMetadata`.
  title: "Marcador · Copa de las Casas",
  description:
    "Marcador oficial por equipos. Los profesores otorgan y restan puntos; los estudiantes consultan la tabla y el historial.",
  // Necesario para que las URLs de OG salgan absolutas (sin esto, una ruta
  // relativa en metadata es error de build). En Vercel la URL de produccion
  // viene sola; NEXT_PUBLIC_SITE_URL queda como override si hay dominio propio.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000"),
  ),
  openGraph: {
    title: "Marcador · Copa de las Casas",
    description:
      "Marcador oficial por equipos. Los profesores otorgan y restan puntos; los estudiantes consultan la tabla y el historial.",
    siteName: "La Copa de las Casas",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  // El favicon sale por convencion de archivo (app/icon.svg). No declarar
  // `icons` aca: hacerlo anula esa convencion.
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
            Marcador · Desarrollado por{" "}
            <span className="font-semibold">Equipo MDD</span>
          </p>
          <p className="mt-2">
            <a
              href="https://github.com/gonzaorban/scoreboard-ics"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <svg
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="currentColor"
                aria-hidden
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
              Código fuente en GitHub
            </a>
          </p>
          <p className="mt-2 italic">
            “Sucede que necesitamos cierta cantidad de valor para enfrentarnos a
            nuestros enemigos…”
          </p>
        </footer>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
