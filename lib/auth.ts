import { createClient } from "@/lib/supabase/server";
import type { Teacher } from "@/lib/database.types";

/**
 * Devuelve el perfil de profesor APROBADO del usuario autenticado, o null si no
 * hay sesión, el usuario no es profesor, o aún está pendiente de aprobación.
 * Usado por el header y el guard de /admin: solo los aprobados tienen acceso.
 */
export async function getCurrentTeacher(): Promise<Teacher | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: teacher } = await supabase
    .from("teachers")
    .select("*")
    .eq("id", user.id)
    .eq("status", "approved")
    .maybeSingle();

  return teacher ?? null;
}

/**
 * Estado del usuario actual respecto al rol de profesor:
 * - "anon": sin sesión.
 * - "pending": logueado, con solicitud pendiente de aprobación (sin acceso).
 * - "approved": profesor aprobado (acceso completo al panel).
 *
 * Lo usan /login, /registro y /pendiente para decidir a dónde enviar al usuario.
 */
export type UserStatus =
  | { state: "anon" }
  | { state: "pending"; fullName: string }
  | { state: "approved"; teacher: Teacher };

export async function getCurrentUserStatus(): Promise<UserStatus> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { state: "anon" };

  const { data: teacher } = await supabase
    .from("teachers")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (teacher?.status === "approved") {
    return { state: "approved", teacher };
  }

  // Logueado pero sin fila de profesor (no debería ocurrir si el registro
  // siempre inserta la fila) o con status 'pending': lo tratamos como pendiente.
  const fullName =
    teacher?.full_name ??
    (typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : (user.email ?? ""));

  return { state: "pending", fullName };
}
