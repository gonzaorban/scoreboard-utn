/**
 * Tipos del esquema de la base de datos.
 *
 * Escritos a mano para reflejar `supabase/migrations/` (0001 → 0004).
 * Puedes regenerarlos automáticamente desde tu proyecto con:
 *   npx supabase gen types typescript --project-id <ref> --schema public > lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Estado de aprobación de un profesor. Ver migración 0003. */
export type TeacherStatus = "pending" | "approved";

/**
 * Cuatrimestre de cursado de una materia. Enum real de Postgres
 * (`public.subject_term`). Ver migración 0004.
 */
export type SubjectTerm =
  | "primer_cuatrimestre"
  | "segundo_cuatrimestre"
  | "anual";

export interface Database {
  public: {
    Tables: {
      teachers: {
        Row: {
          id: string;
          full_name: string;
          status: TeacherStatus;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          status?: TeacherStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          status?: TeacherStatus;
          created_at?: string;
        };
        Relationships: [];
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          year: number;
          term: SubjectTerm;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          year: number;
          term: SubjectTerm;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          year?: number;
          term?: SubjectTerm;
          created_at?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          name: string;
          points: number;
          subject_id: string;
          created_at: string;
          updated_at: string;
        };
        // `subject_id` es obligatorio: NOT NULL sin default (migración 0004).
        Insert: {
          id?: string;
          name: string;
          points?: number;
          subject_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          points?: number;
          subject_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        // Declarada para que supabase-js infiera los embeds
        // `select("*, subject:subjects(*)")`.
        Relationships: [
          {
            foreignKeyName: "teams_subject_id_fkey";
            columns: ["subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id"];
          },
        ];
      };
      score_changes: {
        Row: {
          id: string;
          team_id: string;
          team_name: string;
          old_points: number;
          new_points: number;
          reason: string | null;
          changed_by: string | null;
          changed_by_name: string;
          subject_id: string | null;
          subject_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          team_name: string;
          old_points: number;
          new_points: number;
          reason?: string | null;
          changed_by?: string | null;
          changed_by_name: string;
          subject_id?: string | null;
          subject_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          team_name?: string;
          old_points?: number;
          new_points?: number;
          reason?: string | null;
          changed_by?: string | null;
          changed_by_name?: string;
          subject_id?: string | null;
          subject_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_teacher: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      update_score: {
        Args: {
          p_team_id: string;
          p_new_points: number;
          p_reason?: string | null;
        };
        Returns: undefined;
      };
      approve_teacher: {
        Args: { p_teacher_id: string };
        Returns: undefined;
      };
      reject_teacher: {
        Args: { p_teacher_id: string };
        Returns: undefined;
      };
      remove_teacher: {
        Args: { p_teacher_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      subject_term: SubjectTerm;
    };
    CompositeTypes: Record<string, never>;
  };
}

// Atajos útiles
export type Subject = Database["public"]["Tables"]["subjects"]["Row"];
export type Team = Database["public"]["Tables"]["teams"]["Row"];
/** Equipo con su materia embebida (select `*, subject:subjects(*)`). */
export type TeamWithSubject = Team & { subject: Subject | null };
export type Teacher = Database["public"]["Tables"]["teachers"]["Row"];
export type ScoreChange = Database["public"]["Tables"]["score_changes"]["Row"];
