import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

/**
 * Refresca la sesión de Supabase en cada petición y propaga las cookies.
 * Se invoca desde el `proxy.ts` raíz (antes "middleware" en Next < 16).
 *
 * No redirige a invitados: las páginas públicas (/, /historial) funcionan sin
 * sesión. La protección de /admin se hace en su layout (guard) y en RLS.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: getClaims revalida el token y dispara el refresco de cookies.
  // No metas lógica entre createServerClient y esta llamada.
  // Usamos getClaims() (recomendado con el nuevo formato de claves
  // sb_publishable_*, valida el JWT localmente) en vez de getUser().
  await supabase.auth.getClaims();

  return supabaseResponse;
}
