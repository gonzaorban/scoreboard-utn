import { redirect } from "next/navigation";
import { getCurrentUserStatus } from "@/lib/auth";
import { RegisterForm } from "@/components/register-form";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Registro de profesores · Marcador",
};

export default async function RegistroPage() {
  // Si ya hay sesión, no tiene sentido mostrar el registro.
  const status = await getCurrentUserStatus();
  if (status.state === "approved") redirect("/admin");
  if (status.state === "pending") redirect("/pendiente");

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 text-4xl" aria-hidden>
            🦉
          </div>
          <CardTitle className="font-heading text-2xl">
            Solicitar acceso de profesor
          </CardTitle>
          <CardDescription>
            Crea tu cuenta para la materia{" "}
            <span className="font-semibold">Ingeniería y Calidad</span>. Tu
            solicitud quedará pendiente hasta que otro profesor la apruebe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-primary underline">
          Inicia sesión
        </Link>
        .
      </p>
    </div>
  );
}
