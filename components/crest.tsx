/**
 * Escudo de la Copa de las Casas. Versión **canónica** del logo.
 *
 * El mismo dibujo existe replicado en `app/icon.svg` (favicon) y en
 * `app/opengraph-image.tsx` (preview al compartir). No se puede compartir el
 * código: `icon.svg` es un archivo estático que Next lee del disco y no puede
 * importar un componente React, y `ImageResponse` sólo soporta un subconjunto
 * de CSS. Si tocás los paths de acá, replicá el cambio en esos dos archivos.
 *
 * A diferencia de las copias, el campo usa `currentColor` para tomar el color
 * del contexto. El borde y la cruz van con un oro **fijo**, no con
 * `var(--color-accent)`: ese token se invierte a granate en el bloque `.dark`
 * de globals.css, y sobre un campo que en oscuro es oro el escudo quedaría
 * granate-sobre-oro, perdiendo el contraste que lo hace legible.
 */
export function Crest({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Campo del escudo: toma el color del contexto (primary en el header). */}
      <path
        d="M32 3 7 11v22c0 13.3 10.2 23.1 25 28 14.8-4.9 25-14.7 25-28V11L32 3Z"
        fill="currentColor"
      />

      {/* Cuarteles: una pincelada de cada casa sobre el campo. */}
      <g clipPath="url(#crest-clip)" opacity="0.9">
        <path d="M32 8v22H11V13l21-5Z" fill="var(--color-gryffindor)" />
        <path d="M32 8v22h21V13L32 8Z" fill="var(--color-ravenclaw)" />
        <path d="M11 30h21v25c-11.7-4.2-19.5-11.9-21-22v-3Z" fill="var(--color-slytherin)" />
        <path d="M53 30H32v25c11.7-4.2 19.5-11.9 21-22v-3Z" fill="var(--color-hufflepuff)" />
      </g>

      {/* Borde y cruz de oro viejo: dan la lectura de "escudo" a 16px. */}
      <path
        d="M32 3 7 11v22c0 13.3 10.2 23.1 25 28 14.8-4.9 25-14.7 25-28V11L32 3Z"
        stroke="#d9b45c"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M32 8v47M11 30h42"
        stroke="#d9b45c"
        strokeWidth="2.5"
      />

      <defs>
        <clipPath id="crest-clip">
          <path d="M32 3 7 11v22c0 13.3 10.2 23.1 25 28 14.8-4.9 25-14.7 25-28V11L32 3Z" />
        </clipPath>
      </defs>
    </svg>
  );
}
