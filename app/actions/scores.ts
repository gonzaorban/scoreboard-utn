"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTeacher } from "@/lib/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Actualiza el puntaje de un equipo y registra el cambio en el historial,
 * de forma atómica, vía la RPC `update_score`. Solo profesores (validado en
 * la action y reforzado por RLS + la propia función).
 */
export async function updateScore(
  teamId: string,
  newPoints: number,
  reason?: string,
): Promise<ActionResult> {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    return { ok: false, error: "No autorizado." };
  }

  if (!Number.isInteger(newPoints)) {
    return { ok: false, error: "El puntaje debe ser un número entero." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_score", {
    p_team_id: teamId,
    p_new_points: newPoints,
    p_reason: reason?.trim() ? reason.trim() : null,
  });

  if (error) {
    return { ok: false, error: "No se pudo guardar el puntaje." };
  }

  revalidatePath("/");
  revalidatePath("/historial");
  revalidatePath("/admin");
  return { ok: true };
}
