import { createClient } from "@/lib/supabase/server";
import { ScoreEditor } from "@/components/score-editor";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Otorgar puntos · Copa de las Casas",
};

export default async function AdminScoresPage() {
  const supabase = await createClient();
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("points", { ascending: false })
    .order("name", { ascending: true });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">
            Otorgar y restar puntos
          </h1>
          <p className="text-muted-foreground">
            Ajusta el marcador de cada casa. Cada cambio queda firmado con tu
            nombre y la hora en el{" "}
            <Link href="/historial" className="underline">
              historial
            </Link>
            .
          </p>
        </div>
        <Link
          href="/admin/equipos"
          className={buttonVariants({ variant: "outline" })}
        >
          Gestionar equipos
        </Link>
      </div>

      <ScoreEditor teams={teams ?? []} />
    </div>
  );
}
