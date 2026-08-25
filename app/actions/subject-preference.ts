"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { SUBJECT_COOKIE, SUBJECT_COOKIE_OPTIONS } from "@/lib/subject-cookie";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Recuerda la materia que el usuario eligió en el selector.
 *
 * **Sin autenticación a propósito**: el marcador es público y quien más
 * necesita esto es el alumno anónimo, que no tiene cuenta. Lo único que la
 * cookie puede hacer es cambiar qué materia (pública) se muestra por defecto,
 * así que no hay nada que proteger. No le agregues un `getCurrentTeacher()`:
 * dejaría la funcionalidad sin su único destinatario.
 *
 * Tiene que ser una Server Action (o un Route Handler): en Next.js 16 no se
 * puede hacer `cookies().set` durante el render de un Server Component porque
 * las cabeceras ya se enviaron. Ver el try/catch de
 * [lib/supabase/server.ts](lib/supabase/server.ts).
 *
 * Ojo: seguir un link con `?materia=` **no** pasa por acá. Solo una elección
 * explícita en el selector cambia la preferencia.
 */
export async function rememberSubject(
  subjectId: string,
): Promise<ActionResult> {
  if (!subjectId) return { ok: false, error: "Falta la materia." };

  // Comprobamos contra la base para no persistir un id inexistente en el
  // navegador si alguien llama a la action a mano. Es un lookup por clave
  // primaria en una tabla chica, y solo corre cuando cambia el selector.
  const supabase = await createClient();
  const { data } = await supabase
    .from("subjects")
    .select("id")
    .eq("id", subjectId)
    .maybeSingle();

  if (!data) return { ok: false, error: "La materia no existe." };

  const store = await cookies();
  store.set(SUBJECT_COOKIE, subjectId, SUBJECT_COOKIE_OPTIONS);

  // Sin `revalidatePath`: no cambiamos ningún dato, las páginas con filtro ya
  // son `force-dynamic`, y el `router.push` que dispara el selector provoca un
  // render nuevo igual. Revalidar acá tiraría el Router Cache del cliente en
  // cada cambio del desplegable, para nada.
  return { ok: true };
}
