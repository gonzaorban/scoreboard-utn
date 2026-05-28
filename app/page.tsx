import { createClient } from "@/lib/supabase/server";
import { ScoreboardTable } from "@/components/scoreboard-table";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

// Siempre datos frescos al cargar (no usamos realtime; basta con recargar).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("points", { ascending: false })
    .order("name", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Ingeniería y Calidad
        </p>
        <h1 className="font-heading text-4xl font-bold text-primary sm:text-5xl">
          La Copa de las Casas
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          El recuento de puntos del torneo. Cada acierto suma para tu casa; cada
          descuido… resta. Que gane la que mejor domine el arte de la ingeniería
          y la calidad.
        </p>
      </section>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold">Marcador actual</h2>
        <Link
          href="/"
          prefetch={false}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          ↻ Actualizar
        </Link>
      </div>

      <ScoreboardTable teams={teams ?? []} />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Quieres saber quién dio o quitó puntos?{" "}
        <Link href="/historial" className="font-medium text-primary underline">
          Consulta el Gran Libro del Historial
        </Link>
        .
      </p>
    </div>
  );
}
