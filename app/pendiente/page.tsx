import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserStatus } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Solicitud pendiente · Marcador",
};

export default async function PendientePage() {
  const status = await getCurrentUserStatus();
  if (status.state === "anon") redirect("/login");
  if (status.state === "approved") redirect("/admin");

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 text-4xl" aria-hidden>
            🕰️
          </div>
          <CardTitle className="font-heading text-2xl">
            Solicitud pendiente de aprobación
          </CardTitle>
          <CardDescription>
            Hola{status.fullName ? `, ${status.fullName}` : ""}. Tu solicitud de
            acceso como profesor está en revisión. Un profesor debe aprobarla
            antes de que puedas otorgar o restar puntos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-center text-sm text-muted-foreground">
            Mientras tanto, puedes consultar la tabla de posiciones y el
            historial como cualquier visitante.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/" className={buttonVariants({ variant: "default" })}>
              Ver la tabla
            </Link>
            <form action={signOut}>
              <Button variant="outline" type="submit" className="w-full">
                Salir
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
