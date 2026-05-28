import { createClient } from "@/lib/supabase/server";
import { TeamsAdmin } from "@/components/teams-admin";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gestión de equipos · Copa de las Casas",
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
            Alta, baja y modificación de las casas que compiten por la Copa.
          </p>
        </div>
        <Link href="/admin" className={buttonVariants({ variant: "outline" })}>
          Otorgar puntos
        </Link>
      </div>

      <TeamsAdmin teams={teams ?? []} />
    </div>
  );
}
