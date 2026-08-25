import { createClient } from "@/lib/supabase/server";
import { SubjectsAdmin, type SubjectWithCount } from "@/components/subjects-admin";
import { buttonVariants } from "@/components/ui/button";
import { sortSubjects } from "@/lib/subjects";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gestión de materias · Marcador",
};

export default async function AdminSubjectsPage() {
  const supabase = await createClient();

  // Dos consultas simples en vez de un aggregate embebido: la tabla es chica y
  // el conteo en TS no depende de la forma que devuelva PostgREST.
  const [{ data: subjects }, { data: teams }] = await Promise.all([
    supabase.from("subjects").select("*"),
    supabase.from("teams").select("subject_id"),
  ]);

  const teamCounts = new Map<string, number>();
  for (const team of teams ?? []) {
    teamCounts.set(team.subject_id, (teamCounts.get(team.subject_id) ?? 0) + 1);
  }

  const rows: SubjectWithCount[] = sortSubjects(subjects ?? []).map(
    (subject) => ({
      ...subject,
      teamCount: teamCounts.get(subject.id) ?? 0,
    }),
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">
            Gestión de materias
          </h1>
          <p className="text-muted-foreground">
            Cada materia es una cursada: nombre, año y cuatrimestre. Los equipos
            se asocian a una de ellas.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin"
            className={buttonVariants({ variant: "outline" })}
          >
            Otorgar puntos
          </Link>
          <Link
            href="/admin/equipos"
            className={buttonVariants({ variant: "outline" })}
          >
            Equipos
          </Link>
        </div>
      </div>

      <SubjectsAdmin subjects={rows} />
    </div>
  );
}
