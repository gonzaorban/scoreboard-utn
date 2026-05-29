"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateScore } from "@/app/actions/scores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Team } from "@/lib/database.types";

const QUICK_STEPS = [-10, -5, +5, +10];

function TeamCard({ team }: { team: Team }) {
  const [points, setPoints] = useState<number>(team.points);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const dirty = points !== team.points;

  function bump(step: number) {
    setPoints((p) => p + step);
  }

  function save() {
    startTransition(async () => {
      const result = await updateScore(team.id, points, reason);
      if (result.ok) {
        toast.success(`Puntaje de ${team.name} actualizado a ${points}.`);
        setReason("");
      } else {
        toast.error(result.error);
        setPoints(team.points); // revertir input al valor real
      }
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between font-heading text-lg">
          <span>{team.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="w-28 font-mono text-lg font-bold tabular-nums"
            aria-label={`Puntos de ${team.name}`}
          />
          <div className="flex flex-wrap gap-1">
            {QUICK_STEPS.map((step) => (
              <Button
                key={step}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => bump(step)}
              >
                {step > 0 ? `+${step}` : step}
              </Button>
            ))}
          </div>
        </div>

        <Input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo (opcional): p. ej. ‘gran defensa de la calidad’"
          maxLength={140}
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {dirty
              ? `Cambio: ${team.points} → ${points}`
              : "Sin cambios pendientes"}
          </span>
          <Button onClick={save} disabled={!dirty || isPending} size="sm">
            {isPending ? "Guardando…" : "Guardar puntaje"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ScoreEditor({ teams }: { teams: Team[] }) {
  if (teams.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
        <p className="text-lg">No hay equipos todavía.</p>
        <p className="text-sm">
          Crea equipos en la sección{" "}
          <a href="/admin/equipos" className="font-medium text-primary underline">
            Equipos
          </a>{" "}
          para empezar a otorgar puntos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}
