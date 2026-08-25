"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/app/actions/subjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SUBJECT_TERMS, TERM_LABELS, currentYear } from "@/lib/subjects";
import type { Subject } from "@/lib/database.types";

/** Materia con la cantidad de equipos que tiene asociados. */
export type SubjectWithCount = Subject & { teamCount: number };

/** Campos compartidos por los diálogos de alta y edición. */
function SubjectFields({
  idPrefix,
  subject,
}: {
  idPrefix: string;
  subject?: Subject;
}) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>Nombre de la materia</Label>
        <Input
          id={`${idPrefix}-name`}
          name="name"
          required
          defaultValue={subject?.name}
          placeholder="Agilidad Avanzada"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-year`}>Año de cursado</Label>
        <Input
          id={`${idPrefix}-year`}
          name="year"
          type="number"
          required
          min={2000}
          max={2100}
          defaultValue={subject?.year ?? currentYear()}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-term`}>Cuatrimestre</Label>
        <NativeSelect
          id={`${idPrefix}-term`}
          name="term"
          required
          defaultValue={subject?.term ?? "primer_cuatrimestre"}
        >
          {SUBJECT_TERMS.map((term) => (
            <option key={term} value={term}>
              {TERM_LABELS[term]}
            </option>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
}

/** Diálogo para crear una materia nueva. */
function CreateSubjectDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createSubject(formData);
      if (result.ok) {
        toast.success("Materia creada.");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>+ Nueva materia</Button>} />
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="font-heading">Nueva materia</DialogTitle>
            <DialogDescription>
              Una materia es una cursada: nombre, año y cuatrimestre.
            </DialogDescription>
          </DialogHeader>
          <SubjectFields idPrefix="new-subject" />
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creando…" : "Crear materia"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Diálogo para editar una materia. */
function EditSubjectDialog({ subject }: { subject: Subject }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateSubject(subject.id, formData);
      if (result.ok) {
        toast.success("Materia actualizada.");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            Editar
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="font-heading">Editar materia</DialogTitle>
            <DialogDescription>
              Los equipos asociados siguen perteneciendo a esta cursada.
            </DialogDescription>
          </DialogHeader>
          <SubjectFields idPrefix={`subject-${subject.id}`} subject={subject} />
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando…" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Diálogo de confirmación para eliminar una materia. */
function DeleteSubjectDialog({ subject }: { subject: SubjectWithCount }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const hasTeams = subject.teamCount > 0;

  function onConfirm() {
    startTransition(async () => {
      const result = await deleteSubject(subject.id);
      if (result.ok) {
        toast.success("Materia eliminada.");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            disabled={hasTeams}
            title={
              hasTeams
                ? "La materia tiene equipos. Eliminalos o reasignalos primero."
                : undefined
            }
          >
            Eliminar
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">Eliminar materia</DialogTitle>
          <DialogDescription>
            ¿Seguro que querés eliminar <strong>{subject.name}</strong> (
            {subject.year} · {TERM_LABELS[subject.term]})? Esta acción no se
            puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Eliminando…" : "Sí, eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SubjectsAdmin({ subjects }: { subjects: SubjectWithCount[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold">
          Materias ({subjects.length})
        </h2>
        <CreateSubjectDialog />
      </div>

      {subjects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
          Aún no hay materias. Creá la primera con “Nueva materia”.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Materia</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Cuatrimestre</TableHead>
                <TableHead className="text-right">Equipos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell className="font-mono tabular-nums">
                    {subject.year}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {TERM_LABELS[subject.term]}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {subject.teamCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <EditSubjectDialog subject={subject} />
                      <DeleteSubjectDialog subject={subject} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
