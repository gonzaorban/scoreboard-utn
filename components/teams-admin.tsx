"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createTeam, updateTeam, deleteTeam } from "@/app/actions/teams";
import { HOUSE_OPTIONS, getHouse } from "@/lib/houses";
import { cn } from "@/lib/utils";
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
import type { Team } from "@/lib/database.types";

function HouseSelect({
  defaultValue,
}: {
  defaultValue?: string | null;
}) {
  return (
    <select
      name="house"
      defaultValue={defaultValue ?? ""}
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <option value="">Sin casa</option>
      {HOUSE_OPTIONS.map((h) => (
        <option key={h.key} value={h.key}>
          {h.crest} {h.name}
        </option>
      ))}
    </select>
  );
}

/** Diálogo para crear un equipo nuevo. */
function CreateTeamDialog() {
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
              Da de alta una casa para que entre en competición.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Nombre del equipo</Label>
              <Input id="new-name" name="name" required placeholder="Los Inefables" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-house">Casa</Label>
              <HouseSelect />
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

/** Diálogo para editar nombre/casa de un equipo. */
function EditTeamDialog({ team }: { team: Team }) {
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
              Cambia el nombre o la casa. Los puntos se gestionan desde la
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
            <div className="space-y-2">
              <Label htmlFor={`house-${team.id}`}>Casa</Label>
              <HouseSelect defaultValue={team.house} />
            </div>
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
function DeleteTeamDialog({ team }: { team: Team }) {
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

export function TeamsAdmin({ teams }: { teams: Team[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold">
          Equipos ({teams.length})
        </h2>
        <CreateTeamDialog />
      </div>

      {teams.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
          Aún no hay equipos. Crea el primero con “Nuevo equipo”.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipo</TableHead>
                <TableHead className="hidden sm:table-cell">Casa</TableHead>
                <TableHead className="text-right">Puntos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => {
                const house = getHouse(team.house);
                return (
                  <TableRow
                    key={team.id}
                    className={cn(
                      "border-l-4 border-l-transparent",
                      house?.accent,
                    )}
                  >
                    <TableCell className="font-medium">
                      <span className="mr-1.5">{house?.crest ?? "✨"}</span>
                      {team.name}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {house ? (
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-medium",
                            house.badge,
                          )}
                        >
                          {house.name}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold tabular-nums">
                      {team.points}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <EditTeamDialog team={team} />
                        <DeleteTeamDialog team={team} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
