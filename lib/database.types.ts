/**
 * Tipos del esquema de la base de datos.
 *
 * Escritos a mano para reflejar `supabase/migrations/0001_init.sql`.
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

export interface Database {
  public: {
    Tables: {
      teachers: {
        Row: {
          id: string;
          full_name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          name: string;
          points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      score_changes: {
        Row: {
          id: string;
          team_id: string;
          team_name: string;
          old_points: number;
          new_points: number;
          reason: string | null;
          changed_by: string;
          changed_by_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          team_name: string;
          old_points: number;
          new_points: number;
          reason?: string | null;
          changed_by: string;
          changed_by_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          team_name?: string;
          old_points?: number;
          new_points?: number;
          reason?: string | null;
          changed_by?: string;
          changed_by_name?: string;
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
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Atajos útiles
export type Team = Database["public"]["Tables"]["teams"]["Row"];
export type Teacher = Database["public"]["Tables"]["teachers"]["Row"];
export type ScoreChange = Database["public"]["Tables"]["score_changes"]["Row"];
