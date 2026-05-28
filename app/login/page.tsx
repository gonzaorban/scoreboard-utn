import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Acceso de profesores · Copa de las Casas",
};

export default async function LoginPage() {
  // Si ya hay sesión de profesor, no tiene sentido mostrar el login.
  const teacher = await getCurrentTeacher();
  if (teacher) redirect("/admin");

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
            Solo el profesorado de{" "}
            <span className="font-semibold">Ingeniería y Calidad</span> puede
            otorgar o restar puntos a las casas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        ¿Solo quieres ver el marcador?{" "}
        <a href="/" className="font-medium text-primary underline">
          Vuelve a la tabla
        </a>
        .
      </p>
    </div>
  );
}
