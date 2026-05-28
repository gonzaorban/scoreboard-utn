import Link from "next/link";
import { getCurrentTeacher } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * Cabecera del sitio. Muestra navegación pública y, si hay un profesor
 * autenticado, su nombre + accesos al panel y botón de salir.
 */
export async function SiteHeader() {
  const teacher = await getCurrentTeacher();

  return (
    <header className="border-b border-border/60 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            🪄
          </span>
          <span className="font-heading text-lg font-bold leading-tight text-primary">
            Copa de las Casas
            <span className="block text-[0.7rem] font-normal uppercase tracking-widest text-muted-foreground">
              Ingeniería y Calidad
            </span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1 text-sm">
          <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Tabla
          </Link>
          <Link
            href="/historial"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Historial
          </Link>

          {teacher ? (
            <>
              <Link
                href="/admin"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Puntos
              </Link>
              <Link
                href="/admin/equipos"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Equipos
              </Link>
              <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">
                Prof. {teacher.full_name}
              </span>
              <form action={signOut}>
                <Button variant="outline" size="sm" type="submit">
                  Salir
                </Button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className={buttonVariants({ variant: "default", size: "sm" })}
            >
              Soy profesor
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
