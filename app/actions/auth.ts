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

  // Verificamos el estado del usuario: debe tener una solicitud de profesor.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: teacher } = await supabase
    .from("teachers")
    .select("status")
    .eq("id", user!.id)
    .maybeSingle();

  if (!teacher) {
    // Tiene credenciales válidas pero nunca solicitó ser profesor.
    await supabase.auth.signOut();
    return {
      error:
        "Tu cuenta no está registrada como profesor. Regístrate para solicitar acceso.",
    };
  }

  revalidatePath("/", "layout");

  // Pendiente de aprobación: mantenemos la sesión pero lo enviamos a la
  // pantalla de espera (no al panel). Aprobado: acceso completo al panel.
  if (teacher.status === "pending") {
    redirect("/pendiente");
  }

  redirect("/admin");
}

/**
 * Auto-registro de un aspirante a profesor. Crea la cuenta de auth y una
 * solicitud `pending` en `teachers`. Queda a la espera de que un profesor
 * aprobado la apruebe. Pensada para usarse con useActionState desde /registro.
 *
 * Requiere que la confirmación de email esté desactivada en Supabase
 * (Authentication → Providers → Email), para que el signUp deje sesión activa.
 */
export async function signUp(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName) {
    return { error: "Indica tu nombre completo." };
  }
  if (!email || !password) {
    return { error: "Indica tu email y contraseña." };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return { error: "No se pudo crear la cuenta. ¿Quizás el email ya existe?" };
  }

  const user = data.user;
  if (!user) {
    // Ocurre si la confirmación de email sigue activa: no hay sesión todavía.
    return {
      error:
        "No se pudo iniciar la sesión tras el registro. Revisa la configuración de email en Supabase.",
    };
  }

  // Creamos la solicitud pendiente. La política RLS solo permite insertar la
  // propia fila con status='pending', así que esto es seguro desde el cliente anon.
  const { error: insertError } = await supabase
    .from("teachers")
    .insert({ id: user.id, full_name: fullName, status: "pending" });

  if (insertError) {
    return {
      error: "Tu cuenta se creó pero no pudimos registrar la solicitud. Intenta iniciar sesión.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/pendiente");
}

/** Cierra la sesión del profesor y vuelve a la tabla pública. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
