import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/lib/auth";

/**
 * Guard del área de profesores. Si no hay un profesor autenticado, redirige
 * al login. (RLS protege igualmente los datos a nivel de base de datos.)
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const teacher = await getCurrentTeacher();
  if (!teacher) redirect("/login");

  return <div className="mx-auto max-w-5xl px-4 py-10">{children}</div>;
}
