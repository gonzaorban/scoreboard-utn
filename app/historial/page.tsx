import { createClient } from "@/lib/supabase/server";
import { HistoryTable } from "@/components/history-table";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Historial · Marcador",
};

export default async function HistorialPage() {
  const supabase = await createClient();
  const { data: changes } = await supabase
    .from("score_changes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

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
      </section>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold">
          Movimientos recientes
        </h2>
        <Link
          href="/historial"
          prefetch={false}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          ↻ Actualizar
        </Link>
      </div>

      <HistoryTable changes={changes ?? []} />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/" className="font-medium text-primary underline">
          ← Volver al marcador
        </Link>
      </p>
    </div>
  );
}
