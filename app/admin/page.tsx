import { createClient } from "@/lib/supabase/server";
import { ScoreEditor } from "@/components/score-editor";
import { SubjectFilter } from "@/components/subject-filter";
import { buttonVariants } from "@/components/ui/button";
import { getSubjectsAndSelection } from "@/lib/subjects-server";
import { withSubjectParam } from "@/lib/subjects";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Otorgar puntos · Marcador",
};

export default async function AdminScoresPage({
  searchParams,
}: {
  searchParams: Promise<{ materia?: string }>;
}) {
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
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">
            Otorgar y restar puntos
          </h1>
          <p className="text-muted-foreground">
            Ajusta el marcador de cada equipo. Cada cambio queda firmado con tu
            nombre y la hora en el{" "}
            <Link
              href={withSubjectParam("/historial", selected)}
              className="underline"
            >
              historial
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={withSubjectParam("/admin/equipos", selected)}
            className={buttonVariants({ variant: "outline" })}
          >
            Gestionar equipos
          </Link>
          <Link
            href="/admin/materias"
            className={buttonVariants({ variant: "outline" })}
          >
            Materias
          </Link>
          <Link
            href="/admin/profesores"
            className={buttonVariants({ variant: "outline" })}
          >
            Profesores
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <SubjectFilter subjects={subjects} selected={selected} />
      </div>

      {selected ? (
        <ScoreEditor teams={teams ?? []} />
      ) : (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
          <p className="text-lg">Todavía no hay materias.</p>
          <p className="text-sm">
            Creá una materia en{" "}
            <Link href="/admin/materias" className="underline">
              Gestión de materias
            </Link>{" "}
            para empezar.
          </p>
        </div>
      )}
    </div>
  );
}
