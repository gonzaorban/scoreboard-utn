import { createClient } from "@/lib/supabase/server";
import { getCurrentTeacher } from "@/lib/auth";
import { TeachersAdmin } from "@/components/teachers-admin";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gestión de profesores · Marcador",
};

export default async function AdminTeachersPage() {
  // El guard de /admin ya garantiza que hay un profesor aprobado; lo leemos
  // aquí para saber el id propio (no poder darse de baja a uno mismo).
  const current = await getCurrentTeacher();

  const supabase = await createClient();
  const [{ data: pending }, { data: approved }] = await Promise.all([
    supabase
      .from("teachers")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase
      .from("teachers")
      .select("*")
      .eq("status", "approved")
      .order("full_name", { ascending: true }),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">
            Gestión de profesores
          </h1>
          <p className="text-muted-foreground">
            Aprueba o rechaza solicitudes y gestiona quién tiene acceso al panel.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin" className={buttonVariants({ variant: "outline" })}>
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

      <TeachersAdmin
        pending={pending ?? []}
        approved={approved ?? []}
        currentTeacherId={current?.id ?? ""}
      />
    </div>
  );
}
