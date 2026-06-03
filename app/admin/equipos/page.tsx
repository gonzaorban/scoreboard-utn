import { createClient } from "@/lib/supabase/server";
import { TeamsAdmin } from "@/components/teams-admin";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gestión de equipos · Marcador",
};

export default async function AdminTeamsPage() {
  const supabase = await createClient();
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("name", { ascending: true });

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
          <Link href="/admin" className={buttonVariants({ variant: "outline" })}>
            Otorgar puntos
          </Link>
          <Link
            href="/admin/profesores"
            className={buttonVariants({ variant: "outline" })}
          >
            Profesores
          </Link>
        </div>
      </div>

      <TeamsAdmin teams={teams ?? []} />
    </div>
  );
}
