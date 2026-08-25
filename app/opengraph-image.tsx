import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "La Copa de las Casas · Marcador por equipos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Paleta fija (equivalentes hex de los oklch de globals.css): ImageResponse no
// resuelve variables CSS del tema.
const PERGAMINO = "#f6efe0";
const GRANATE = "#6b2318";
const ORO = "#d9b45c";
const TINTA = "#3b2d21";
const CASAS = ["#8f2320", "#1f5c3d", "#1f3f7a", "#e0a92b"];

/**
 * Preview al compartir el link. El escudo es una copia de components/crest.tsx
 * (versión canónica) con los colores resueltos a hex; si tocás uno, tocá el otro.
 */
export default async function Image() {
  // Instancia **estática** de Cinzel a proposito: Satori (el motor de
  // ImageResponse) no soporta fuentes variables — con el .ttf variable el
  // build falla con "Cannot read properties of undefined".
  const cinzel = await readFile(join(process.cwd(), "assets/Cinzel-Bold.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: PERGAMINO,
          fontFamily: "Cinzel",
          position: "relative",
        }}
      >
        <svg width="230" height="230" viewBox="0 0 64 64">
          <path
            d="M32 3 7 11v22c0 13.3 10.2 23.1 25 28 14.8-4.9 25-14.7 25-28V11L32 3Z"
            fill={GRANATE}
          />
          <path d="M32 8v22H11V13l21-5Z" fill={CASAS[0]} opacity="0.9" />
          <path d="M32 8v22h21V13L32 8Z" fill={CASAS[2]} opacity="0.9" />
          <path
            d="M11 30h21v25c-11.7-4.2-19.5-11.9-21-22v-3Z"
            fill={CASAS[1]}
            opacity="0.9"
          />
          <path
            d="M53 30H32v25c11.7-4.2 19.5-11.9 21-22v-3Z"
            fill={CASAS[3]}
            opacity="0.9"
          />
          <path
            d="M32 3 7 11v22c0 13.3 10.2 23.1 25 28 14.8-4.9 25-14.7 25-28V11L32 3Z"
            fill="none"
            stroke={ORO}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path d="M32 8v47M11 30h42" stroke={ORO} strokeWidth="2.5" />
        </svg>

        <div
          style={{
            marginTop: 24,
            fontSize: 80,
            fontWeight: 700,
            color: GRANATE,
            letterSpacing: -1,
          }}
        >
          La Copa de las Casas
        </div>
        <div style={{ marginTop: 12, fontSize: 34, color: TINTA }}>
          Marcador por equipos
        </div>

        {/* Banda inferior con los cuatro colores de casa. */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 18,
          }}
        >
          {CASAS.map((c) => (
            <div key={c} style={{ flex: 1, background: c }} />
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Cinzel", data: cinzel, style: "normal", weight: 700 }],
    },
  );
}
