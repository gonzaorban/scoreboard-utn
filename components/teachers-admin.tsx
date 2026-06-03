"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  approveTeacher,
  rejectTeacher,
  removeTeacher,
} from "@/app/actions/teachers-admin";
import { Button } from "@/components/ui/button";
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
import type { Teacher } from "@/lib/database.types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

/** Botón directo para aprobar una solicitud pendiente. */
function ApproveButton({ teacher }: { teacher: Teacher }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onApprove() {
    startTransition(async () => {
      const result = await approveTeacher(teacher.id);
      if (result.ok) {
        toast.success(`${teacher.full_name} ahora es profesor.`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button size="sm" onClick={onApprove} disabled={isPending}>
      {isPending ? "Aprobando…" : "Aprobar"}
    </Button>
  );
}

/** Diálogo de confirmación para rechazar una solicitud pendiente. */
function RejectDialog({ teacher }: { teacher: Teacher }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await rejectTeacher(teacher.id);
      if (result.ok) {
        toast.success("Solicitud rechazada.");
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
            Rechazar
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">Rechazar solicitud</DialogTitle>
          <DialogDescription>
            ¿Seguro que quieres rechazar la solicitud de{" "}
            <strong>{teacher.full_name}</strong>? Podrá volver a solicitar acceso
            más adelante.
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
            {isPending ? "Rechazando…" : "Sí, rechazar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Diálogo de confirmación para dar de baja a un profesor aprobado. */
function RemoveDialog({ teacher }: { teacher: Teacher }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await removeTeacher(teacher.id);
      if (result.ok) {
        toast.success(`${teacher.full_name} ya no tiene acceso.`);
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
            Dar de baja
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">Dar de baja</DialogTitle>
          <DialogDescription>
            ¿Seguro que quieres revocar el acceso de{" "}
            <strong>{teacher.full_name}</strong>? Dejará de poder otorgar puntos
            y gestionar equipos. El historial de sus cambios se conserva.
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
            {isPending ? "Dando de baja…" : "Sí, dar de baja"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TeachersAdmin({
  pending,
  approved,
  currentTeacherId,
}: {
  pending: Teacher[];
  approved: Teacher[];
  currentTeacherId: string;
}) {
  return (
    <div className="space-y-10">
      {/* Solicitudes pendientes */}
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold">
          Solicitudes pendientes ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
            No hay solicitudes pendientes.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="whitespace-nowrap">Solicitado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">
                      {teacher.full_name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(teacher.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <ApproveButton teacher={teacher} />
                        <RejectDialog teacher={teacher} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Profesores con acceso */}
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold">
          Profesores con acceso ({approved.length})
        </h2>

        {approved.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
            Aún no hay profesores aprobados.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="whitespace-nowrap">Desde</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approved.map((teacher) => {
                  const isSelf = teacher.id === currentTeacherId;
                  return (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">
                        {teacher.full_name}
                        {isSelf && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (tú)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(teacher.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        {isSelf ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="text-muted-foreground"
                          >
                            Dar de baja
                          </Button>
                        ) : (
                          <RemoveDialog teacher={teacher} />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
