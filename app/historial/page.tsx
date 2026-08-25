import { createClient } from "@/lib/supabase/server";
import { HistoryTable } from "@/components/history-table";
import { SubjectFilter } from "@/components/subject-filter";
import { buttonVariants } from "@/components/ui/button";
import { getSubjectsAndSelection } from "@/lib/subjects-server";
import { subjectLabel, withSubjectParam } from "@/lib/subjects";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Historial · Marcador",
};

export default async function HistorialPage({
  searchParams,
}: {
  searchParams: Promise<{ materia?: string }>;
}) {
  const { materia } = await searchParams;
  const { subjects, selected } = await getSubjectsAndSelection(materia);

  const supabase = await createClient();
  const { data: changes } = selected
    ? await supabase
        .from("score_changes")
        .select("*")
        .eq("subject_id", selected.id)
        .order("created_at", { ascending: false })
        .limit(500)
    : { data: [] };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="mb-8 text-center">
        <div className="text-4xl" aria-hidden>
          📜
        </div>
        <h1 className="font-heading text-3xl font-bold text-primary sm:text-4xl">
          El Gran Libro del Historial
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Cada punto otorgado o restado queda registrado para siempre: qué
          profesor lo hizo, cuándo y de cuánto a cuánto cambió el marcador.
        </p>
        {selected ? (
          <p className="mt-3 text-sm uppercase tracking-[0.3em] text-muted-foreground">
            {subjectLabel(selected)}
          </p>
        ) : null}
      </section>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-semibold">
          Movimientos recientes
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <SubjectFilter subjects={subjects} selected={selected} />
          <Link
            href={withSubjectParam("/historial", selected)}
            prefetch={false}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            ↻ Actualizar
          </Link>
        </div>
      </div>

      <HistoryTable changes={changes ?? []} />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          href={withSubjectParam("/", selected)}
          className="font-medium text-primary underline"
        >
          ← Volver al marcador
        </Link>
      </p>
    </div>
  );
}
