import Link from "next/link";
import { getCurrentTeacher } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Crest } from "@/components/crest";

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
          <Crest className="size-7 text-primary" />
          <span className="font-heading text-lg font-bold leading-tight text-primary">
            La Copa de las Casas
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
              <Link
                href="/admin/materias"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Materias
              </Link>
              <Link
                href="/admin/profesores"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Profesores
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
