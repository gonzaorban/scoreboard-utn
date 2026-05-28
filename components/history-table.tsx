import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ScoreChange } from "@/lib/database.types";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Tabla del historial (Gran Libro). Solo lectura. Muestra cada cambio de
 * puntaje: cuándo, qué equipo, de cuánto a cuánto, el delta, el motivo y qué
 * profesor lo realizó.
 */
export function HistoryTable({ changes }: { changes: ScoreChange[] }) {
  if (changes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
        <p className="text-lg">El Gran Libro está en blanco.</p>
        <p className="text-sm">
          Todavía ningún profesor ha otorgado ni restado puntos.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Fecha y hora</TableHead>
            <TableHead>Equipo</TableHead>
            <TableHead className="text-center">Cambio</TableHead>
            <TableHead className="hidden md:table-cell">Motivo</TableHead>
            <TableHead className="whitespace-nowrap">Profesor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {changes.map((change) => {
            const delta = change.new_points - change.old_points;
            const isGain = delta > 0;
            return (
              <TableRow key={change.id}>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatDateTime(change.created_at)}
                </TableCell>
                <TableCell className="font-medium">
                  {change.team_name}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2 font-mono text-sm tabular-nums">
                    <span className="text-muted-foreground">
                      {change.old_points}
                    </span>
                    <span aria-hidden>→</span>
                    <span className="font-semibold">{change.new_points}</span>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-xs font-bold",
                        isGain
                          ? "bg-emerald-600/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-destructive/15 text-destructive",
                      )}
                    >
                      {isGain ? "+" : ""}
                      {delta}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden max-w-xs truncate text-sm text-muted-foreground md:table-cell">
                  {change.reason ?? "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {change.changed_by_name}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
