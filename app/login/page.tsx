import { redirect } from "next/navigation";
import { getCurrentUserStatus } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Acceso de profesores · Marcador",
};

export default async function LoginPage() {
  // Si ya hay sesión, redirigimos según el estado: aprobado al panel,
  // pendiente a la pantalla de espera.
  const status = await getCurrentUserStatus();
  if (status.state === "approved") redirect("/admin");
  if (status.state === "pending") redirect("/pendiente");

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 text-4xl" aria-hidden>
            🏰
          </div>
          <CardTitle className="font-heading text-2xl">
            Sala de Profesores
          </CardTitle>
          <CardDescription>
            Solo el profesorado autorizado puede otorgar o restar puntos a los
            equipos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-primary underline">
          Solicita acceso de profesor
        </Link>
        .
      </p>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        ¿Solo quieres ver el marcador?{" "}
        <Link href="/" className="font-medium text-primary underline">
          Vuelve a la tabla
        </Link>
        .
      </p>
    </div>
  );
}
