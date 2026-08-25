import { createClient } from "@/lib/supabase/server";
import { ScoreboardTable } from "@/components/scoreboard-table";
import { SubjectFilter } from "@/components/subject-filter";
import { buttonVariants } from "@/components/ui/button";
import { getSubjectsAndSelection } from "@/lib/subjects-server";
import { subjectLabel, withSubjectParam } from "@/lib/subjects";
import Link from "next/link";
import type { Metadata } from "next";

// Siempre datos frescos al cargar (no usamos realtime; basta con recargar).
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ materia?: string }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { materia } = await searchParams;
  const { selected } = await getSubjectsAndSelection(materia);

  return {
    title: selected ? `Marcador · ${selected.name}` : "Marcador",
  };
}

export default async function HomePage({ searchParams }: PageProps) {
  const { materia } = await searchParams;
  const { subjects, selected } = await getSubjectsAndSelection(materia);

  const supabase = await createClient();
  const { data: teams } = selected
    ? await supabase
        .from("teams")
        .select("*")
        .eq("subject_id", selected.id)
        .order("points", { ascending: false })
        .order("name", { ascending: true })
    : { data: [] };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          {selected ? subjectLabel(selected) : "Sin materias cargadas"}
        </p>
        <h1 className="font-heading text-4xl font-bold text-primary sm:text-5xl">
          La Copa de las Casas
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          El recuento de puntos del torneo. Cada acierto suma para tu equipo;
          cada descuido… resta. Que gane el equipo que mejor domine la materia.
        </p>
      </section>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-semibold">Marcador actual</h2>
        <div className="flex flex-wrap items-center gap-2">
          <SubjectFilter subjects={subjects} selected={selected} />
          <Link
            href={withSubjectParam("/", selected)}
            prefetch={false}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            ↻ Actualizar
          </Link>
        </div>
      </div>

      {selected ? (
        <ScoreboardTable teams={teams ?? []} />
      ) : (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
          <p className="text-lg">Todavía no hay ninguna materia cargada.</p>
          <p className="text-sm">
            El profesorado debe crear una materia para que comience la
            competición.
          </p>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Quieres saber quién dio o quitó puntos?{" "}
        <Link
          href={withSubjectParam("/historial", selected)}
          className="font-medium text-primary underline"
        >
          Consulta el Gran Libro del Historial
        </Link>
        .
      </p>
    </div>
  );
}
