import { createClient } from "@/lib/supabase/server";
import type { Teacher } from "@/lib/database.types";

/**
 * Devuelve el perfil de profesor del usuario autenticado, o null si no hay
 * sesión o el usuario no es profesor. Usado por el header y el guard de /admin.
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
    .maybeSingle();

  return teacher ?? null;
}
