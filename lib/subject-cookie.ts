/**
 * Cookie de preferencia de materia.
 *
 * Cuando dos cursadas comparten año y cuatrimestre, el default alfabético de
 * `resolveSelectedSubject()` deja a la mitad del curso en la materia
 * equivocada. Recordamos la que el alumno eligió en el selector para que las
 * siguientes visitas caigan en la suya.
 *
 * Importa `next/headers`: **solo servidor** (Server Components y Server
 * Actions). Vive aparte de [lib/subjects.ts](lib/subjects.ts), que debe seguir
 * puro porque lo importa un componente cliente.
 */

import { cookies } from "next/headers";

/**
 * Nombre de la cookie. Prefijado para no chocar con las `sb-*` de Supabase,
 * que el proxy reescribe enteras. Sin prefijo `__Host-`/`__Secure-`: obligan a
 * `secure` y romperían el desarrollo en `http://localhost`.
 */
export const SUBJECT_COOKIE = "scoreboard_materia";

/**
 * Un año. Una cursada dura un cuatrimestre o un año, y el punto de la cookie
 * son justamente las visitas siguientes: una cookie de sesión no serviría.
 */
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Atributos de la cookie. Es una preferencia de interfaz, no un secreto.
 *
 * - `httpOnly: false` — el valor es el UUID de una materia de lectura pública,
 *   que ya viaja en el HTML (el `<select>` del filtro lista todos los ids). No
 *   hay nada que proteger, y así queda disponible para leerla desde el cliente
 *   más adelante sin ida y vuelta al servidor.
 * - `sameSite: "lax"` — con `strict` el navegador no mandaría la cookie en una
 *   navegación top-level que venga de otro sitio, así que un link compartido
 *   por WhatsApp o el campus ignoraría la preferencia justo al aterrizar.
 * - `path: "/"` — aplica a las cuatro páginas con filtro.
 * - `secure` solo en producción — en Vercel todo es HTTPS, pero fijarlo en
 *   `true` haría que el navegador descarte la cookie en `http://localhost` y
 *   pareciera que la funcionalidad no anda.
 */
export const SUBJECT_COOKIE_OPTIONS = {
  path: "/",
  maxAge: ONE_YEAR_SECONDS,
  httpOnly: false,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

/**
 * Lee la materia recordada. Devuelve `undefined` si no hay cookie.
 *
 * No valida contra la base a propósito: de eso ya se encarga
 * `resolveSelectedSubject()`, que cae al default cuando el id no existe
 * (materia borrada, cookie de otro entorno).
 *
 * `|| undefined` y no `??`: una cookie con valor vacío debe contar como ausente.
 */
export async function readSubjectCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SUBJECT_COOKIE)?.value || undefined;
}
