import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

/**
 * Cliente Supabase para Server Components, Server Actions y Route Handlers.
 * Lee/escribe la sesión desde las cookies de la petición.
 *
 * En Next.js 16 `cookies()` es asíncrono, por eso esta función es async.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` se llamó desde un Server Component. Se puede ignorar
            // si hay un proxy (proxy.ts) refrescando la sesión del usuario.
          }
        },
      },
    },
  );
}

/**
 * Cliente con la clave service_role — SOLO para el servidor.
 * Salta RLS. Úsalo únicamente para tareas administrativas controladas
 * (p. ej. dar de alta profesores). Nunca lo expongas al cliente.
 */
export async function createServiceClient() {
  const { createClient: createSupabaseClient } = await import(
    "@supabase/supabase-js"
  );

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
