import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getHouse } from "@/lib/houses";
import { cn } from "@/lib/utils";
import type { Team } from "@/lib/database.types";

const RANK_BADGE = ["🥇", "🥈", "🥉"];

/**
 * Tabla pública del marcador. Solo lectura: muestra el ranking de equipos/casas
 * por puntos. Se reutiliza tanto en la home como (sin medallas) donde haga falta.
 */
export function ScoreboardTable({ teams }: { teams: Team[] }) {
  if (teams.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
        <p className="text-lg">Aún no hay casas en competición.</p>
        <p className="text-sm">
          El profesorado debe registrar los equipos para que comience la Copa.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-center">Puesto</TableHead>
            <TableHead>Equipo</TableHead>
            <TableHead className="hidden sm:table-cell">Casa</TableHead>
            <TableHead className="text-right">Puntos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team, index) => {
            const house = getHouse(team.house);
            return (
              <TableRow
                key={team.id}
                className={cn(
                  "border-l-4 border-l-transparent",
                  house?.accent,
                  index === 0 && "bg-accent/30",
                )}
              >
                <TableCell className="text-center text-xl">
                  {RANK_BADGE[index] ?? (
                    <span className="text-base font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                  )}
                </TableCell>
                <TableCell className="font-heading text-base font-semibold">
                  <span className="mr-1.5">{house?.crest ?? "✨"}</span>
                  {team.name}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {house ? (
                    <span
                      className={cn(
                        "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                        house.badge,
                      )}
                    >
                      {house.name}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono text-lg font-bold tabular-nums text-primary">
                  {team.points}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
