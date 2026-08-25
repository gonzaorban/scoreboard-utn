"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createTeam, updateTeam, deleteTeam } from "@/app/actions/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { NativeSelect } from "@/components/ui/native-select";
import { subjectLabel } from "@/lib/subjects";
import type { Subject, TeamWithSubject } from "@/lib/database.types";

/** Selector de materia para los diálogos de alta y edición. */
function SubjectField({
  id,
  subjects,
  defaultValue,
}: {
  id: string;
  subjects: Subject[];
  defaultValue?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Materia</Label>
      <NativeSelect id={id} name="subject_id" required defaultValue={defaultValue}>
        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subjectLabel(subject)}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}

/** Diálogo para crear un equipo nuevo. */
function CreateTeamDialog({
  subjects,
  defaultSubjectId,
}: {
  subjects: Subject[];
  defaultSubjectId?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createTeam(formData);
      if (result.ok) {
        toast.success("Equipo creado.");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>+ Nuevo equipo</Button>} />
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="font-heading">Nuevo equipo</DialogTitle>
            <DialogDescription>
              Da de alta un equipo para que entre en competición.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Nombre del equipo</Label>
              <Input id="new-name" name="name" required placeholder="Los Inefables" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-points">Puntos iniciales</Label>
              <Input
                id="new-points"
                name="points"
                type="number"
                defaultValue={0}
              />
            </div>
            <SubjectField
              id="new-subject"
              subjects={subjects}
              defaultValue={defaultSubjectId}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creando…" : "Crear equipo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Diálogo para editar nombre de un equipo. */
function EditTeamDialog({
  team,
  subjects,
}: {
  team: TeamWithSubject;
  subjects: Subject[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateTeam(team.id, formData);
      if (result.ok) {
        toast.success("Equipo actualizado.");
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
            <DialogTitle className="font-heading">Editar equipo</DialogTitle>
            <DialogDescription>
              Cambiá el nombre o la materia. Los puntos se gestionan desde la
              sección de puntos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor={`name-${team.id}`}>Nombre del equipo</Label>
              <Input
                id={`name-${team.id}`}
                name="name"
                required
                defaultValue={team.name}
              />
            </div>
            <SubjectField
              id={`subject-${team.id}`}
              subjects={subjects}
              defaultValue={team.subject_id}
            />
          </div>
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

/** Diálogo de confirmación para eliminar un equipo. */
function DeleteTeamDialog({ team }: { team: TeamWithSubject }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await deleteTeam(team.id);
      if (result.ok) {
        toast.success("Equipo eliminado.");
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
          <Button variant="ghost" size="sm" className="text-destructive">
            Eliminar
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">Eliminar equipo</DialogTitle>
          <DialogDescription>
            ¿Seguro que quieres eliminar <strong>{team.name}</strong>? Se
            borrará también su historial de puntos. Esta acción no se puede
            deshacer.
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

export function TeamsAdmin({
  teams,
  subjects,
  selectedSubjectId,
}: {
  teams: TeamWithSubject[];
  subjects: Subject[];
  selectedSubjectId?: string;
}) {
  // Sin materias cargadas no se puede dar de alta un equipo (subject_id es
  // obligatorio), así que guiamos al profesor en vez de mostrar un form roto.
  if (subjects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
        <p className="text-lg">Todavía no hay materias.</p>
        <p className="text-sm">
          Creá una materia antes de dar de alta equipos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold">
          Equipos ({teams.length})
        </h2>
        <CreateTeamDialog
          subjects={subjects}
          defaultSubjectId={selectedSubjectId}
        />
      </div>

      {teams.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
          Aún no hay equipos en esta materia. Crea el primero con “Nuevo equipo”.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipo</TableHead>
                <TableHead className="hidden md:table-cell">Materia</TableHead>
                <TableHead className="text-right">Puntos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {team.subject ? subjectLabel(team.subject) : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold tabular-nums">
                    {team.points}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <EditTeamDialog team={team} subjects={subjects} />
                      <DeleteTeamDialog team={team} />
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
