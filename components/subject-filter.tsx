"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { rememberSubject } from "@/app/actions/subject-preference";
import { subjectLabel } from "@/lib/subjects";
import type { Subject } from "@/lib/database.types";

/**
 * Selector de materia. Navega cambiando `?materia=` en la URL, de modo que el
 * filtro queda en el link (compartible, sobrevive al reload) y la página se
 * vuelve a renderizar en el servidor con los datos de esa cursada.
 *
 * Además guarda la elección en una cookie para que las próximas visitas sin
 * parámetros caigan en la materia del alumno y no en el default alfabético.
 *
 * Usa `usePathname()` para ser agnóstico de la ruta: el mismo componente sirve
 * en `/`, `/historial`, `/admin` y `/admin/equipos`.
 */
export function SubjectFilter({
  subjects,
  selected,
}: {
  subjects: Subject[];
  selected: Subject | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Sin materias no hay nada que filtrar: el estado vacío lo muestra la página.
  if (subjects.length === 0) return null;

  function onChange(subjectId: string) {
    startTransition(async () => {
      // Esperamos a que la cookie quede escrita ANTES de navegar: si el usuario
      // cambia el selector dos veces seguidas, el `Set-Cookie` de la primera
      // podría llegar último y dejar recordada la materia equivocada.
      //
      // El resultado se ignora a propósito: si falla, navegamos igual. Filtrar
      // es lo básico, recordar es un extra, y no tiene sentido mostrarle un
      // error sobre una preferencia a quien acaba de cambiar de materia bien.
      await rememberSubject(subjectId);
      router.push(`${pathname}?materia=${subjectId}`);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="materia" className="shrink-0 text-muted-foreground">
        Materia
      </Label>
      <NativeSelect
        id="materia"
        value={selected?.id ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={isPending}
        className="w-auto max-w-full"
      >
        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subjectLabel(subject)}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
