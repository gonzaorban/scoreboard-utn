import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Team } from "@/lib/database.types";

const RANK_BADGE = ["🥇", "🥈", "🥉"];

/**
 * Tabla pública del marcador. Solo lectura: muestra el ranking de equipos
 * por puntos. Se reutiliza tanto en la home como (sin medallas) donde haga falta.
 */
export function ScoreboardTable({ teams }: { teams: Team[] }) {
  if (teams.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
        <p className="text-lg">Aún no hay equipos en competición.</p>
        <p className="text-sm">
          El profesorado debe registrar los equipos para que comience la competición.
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
            <TableHead className="text-right">Puntos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team, index) => (
            <TableRow
              key={team.id}
              className={cn(index === 0 && "bg-accent/30")}
            >
              <TableCell className="text-center text-xl">
                {RANK_BADGE[index] ?? (
                  <span className="text-base font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                )}
              </TableCell>
              <TableCell className="font-heading text-base font-semibold">
                {team.members.length > 0 ? (
                  <Tooltip>
                    <TooltipTrigger className="cursor-default bg-transparent p-0 font-heading text-base font-semibold underline decoration-dotted decoration-1 underline-offset-4">
                      {team.name}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="mb-1 font-semibold">Integrantes</p>
                      <ul className="space-y-0.5">
                        {team.members.map((member) => (
                          <li key={member}>{member}</li>
                        ))}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  team.name
                )}
              </TableCell>
              <TableCell className="text-right font-mono text-lg font-bold tabular-nums text-primary">
                {team.points}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
