import { createClient } from "@/lib/supabase/server";
import { TeamsAdmin } from "@/components/teams-admin";
import { SubjectFilter } from "@/components/subject-filter";
import { buttonVariants } from "@/components/ui/button";
import { getSubjectsAndSelection } from "@/lib/subjects-server";
import { withSubjectParam } from "@/lib/subjects";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gestión de equipos · Marcador",
};

export default async function AdminTeamsPage({
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
        .select("*, subject:subjects(*)")
        .eq("subject_id", selected.id)
        .order("name", { ascending: true })
    : { data: [] };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">
            Gestión de equipos
          </h1>
          <p className="text-muted-foreground">
            Alta, baja y modificación de los equipos que compiten.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={withSubjectParam("/admin", selected)}
            className={buttonVariants({ variant: "outline" })}
          >
            Otorgar puntos
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

      <TeamsAdmin
        teams={teams ?? []}
        subjects={subjects}
        selectedSubjectId={selected?.id}
      />
    </div>
  );
}
