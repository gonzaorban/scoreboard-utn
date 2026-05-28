"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error: string } | null;

/**
 * Inicia sesión de un profesor con email + contraseña.
 * Pensada para usarse con useActionState desde el formulario de /login.
 */
export async function signIn(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Indica tu email y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Credenciales inválidas. Revisa tu email y contraseña." };
  }

  // Verificamos que el usuario sea realmente un profesor registrado.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: teacher } = await supabase
    .from("teachers")
    .select("id")
    .eq("id", user!.id)
    .maybeSingle();

  if (!teacher) {
    await supabase.auth.signOut();
    return {
      error:
        "Tu cuenta no está registrada como profesor. Contacta al administrador.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

/** Cierra la sesión del profesor y vuelve a la tabla pública. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
