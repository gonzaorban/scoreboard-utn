"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTeacher } from "@/lib/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Aprueba una solicitud de profesor pendiente. Solo profesores aprobados.
 * La validación real vive en la RPC `approve_teacher` (security definer),
 * reforzada aquí por el guard de la action.
 */
export async function approveTeacher(teacherId: string): Promise<ActionResult> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { ok: false, error: "No autorizado." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_teacher", {
    p_teacher_id: teacherId,
  });

  if (error) return { ok: false, error: "No se pudo aprobar la solicitud." };

  revalidatePath("/admin/profesores");
  return { ok: true };
}

/** Rechaza (borra) una solicitud pendiente. Solo profesores aprobados. */
export async function rejectTeacher(teacherId: string): Promise<ActionResult> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { ok: false, error: "No autorizado." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_teacher", {
    p_teacher_id: teacherId,
  });

  if (error) return { ok: false, error: "No se pudo rechazar la solicitud." };

  revalidatePath("/admin/profesores");
  return { ok: true };
}

/**
 * Da de baja a un profesor aprobado (revoca su acceso). Solo profesores
 * aprobados. La RPC `remove_teacher` impide que uno se dé de baja a sí mismo.
 */
export async function removeTeacher(teacherId: string): Promise<ActionResult> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { ok: false, error: "No autorizado." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("remove_teacher", {
    p_teacher_id: teacherId,
  });

  if (error) return { ok: false, error: "No se pudo dar de baja al profesor." };

  revalidatePath("/admin/profesores");
  return { ok: true };
}
