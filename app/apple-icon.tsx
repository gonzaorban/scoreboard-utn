import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Ícono para "añadir a pantalla de inicio" en iOS, que no acepta SVG (por eso
 * no alcanza con app/icon.svg). Copia del escudo de components/crest.tsx.
 * iOS recorta las esquinas y no soporta transparencia, así que va con fondo.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f6efe0",
        }}
      >
        <svg width="150" height="150" viewBox="0 0 64 64">
          <path
            d="M32 3 7 11v22c0 13.3 10.2 23.1 25 28 14.8-4.9 25-14.7 25-28V11L32 3Z"
            fill="#6b2318"
          />
          <path d="M32 8v22H11V13l21-5Z" fill="#8f2320" opacity="0.9" />
          <path d="M32 8v22h21V13L32 8Z" fill="#1f3f7a" opacity="0.9" />
          <path
            d="M11 30h21v25c-11.7-4.2-19.5-11.9-21-22v-3Z"
            fill="#1f5c3d"
            opacity="0.9"
          />
          <path
            d="M53 30H32v25c11.7-4.2 19.5-11.9 21-22v-3Z"
            fill="#e0a92b"
            opacity="0.9"
          />
          <path
            d="M32 3 7 11v22c0 13.3 10.2 23.1 25 28 14.8-4.9 25-14.7 25-28V11L32 3Z"
            fill="none"
            stroke="#d9b45c"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path d="M32 8v47M11 30h42" stroke="#d9b45c" strokeWidth="2.5" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
