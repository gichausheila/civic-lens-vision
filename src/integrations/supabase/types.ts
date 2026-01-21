export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      counties: {
        Row: {
          area_sq_km: number | null
          capital: string | null
          code: number
          created_at: string
          id: string
          name: string
          population: number | null
          region: string | null
        }
        Insert: {
          area_sq_km?: number | null
          capital?: string | null
          code: number
          created_at?: string
          id?: string
          name: string
          population?: number | null
          region?: string | null
        }
        Update: {
          area_sq_km?: number | null
          capital?: string | null
          code?: number
          created_at?: string
          id?: string
          name?: string
          population?: number | null
          region?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          county_id: string | null
          created_at: string
          email: string | null
          id: string
          leader_id: string | null
          message: string
          name: string | null
          status: string | null
          subject: string
        }
        Insert: {
          county_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          leader_id?: string | null
          message: string
          name?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          county_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          leader_id?: string | null
          message?: string
          name?: string | null
          status?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_county_id_fkey"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "counties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "leaders"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_rate_limits: {
        Row: {
          id: string
          identifier: string
          submitted_at: string
        }
        Insert: {
          id?: string
          identifier: string
          submitted_at?: string
        }
        Update: {
          id?: string
          identifier?: string
          submitted_at?: string
        }
        Relationships: []
      }
      leaders: {
        Row: {
          achievements: Json | null
          bio: string | null
          controversial_statements: Json | null
          county_id: string | null
          created_at: string
          id: string
          impeachment_date: string | null
          impeachment_reasons: Json | null
          impeachment_timeline: Json | null
          is_impeached: boolean | null
          is_national: boolean | null
          manifesto: Json | null
          manifesto_available: boolean | null
          manifesto_promises: Json | null
          manifesto_source: string | null
          manifesto_summary: string | null
          name: string
          official_documents: Json | null
          party: string | null
          photo_url: string | null
          position: string
          updated_at: string
        }
        Insert: {
          achievements?: Json | null
          bio?: string | null
          controversial_statements?: Json | null
          county_id?: string | null
          created_at?: string
          id?: string
          impeachment_date?: string | null
          impeachment_reasons?: Json | null
          impeachment_timeline?: Json | null
          is_impeached?: boolean | null
          is_national?: boolean | null
          manifesto?: Json | null
          manifesto_available?: boolean | null
          manifesto_promises?: Json | null
          manifesto_source?: string | null
          manifesto_summary?: string | null
          name: string
          official_documents?: Json | null
          party?: string | null
          photo_url?: string | null
          position: string
          updated_at?: string
        }
        Update: {
          achievements?: Json | null
          bio?: string | null
          controversial_statements?: Json | null
          county_id?: string | null
          created_at?: string
          id?: string
          impeachment_date?: string | null
          impeachment_reasons?: Json | null
          impeachment_timeline?: Json | null
          is_impeached?: boolean | null
          is_national?: boolean | null
          manifesto?: Json | null
          manifesto_available?: boolean | null
          manifesto_promises?: Json | null
          manifesto_source?: string | null
          manifesto_summary?: string | null
          name?: string
          official_documents?: Json | null
          party?: string | null
          photo_url?: string | null
          position?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaders_county_id_fkey"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "counties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      survey_votes: {
        Row: {
          created_at: string
          id: string
          option_index: number
          survey_id: string
          voter_identifier: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_index: number
          survey_id: string
          voter_identifier: string
        }
        Update: {
          created_at?: string
          id?: string
          option_index?: number
          survey_id?: string
          voter_identifier?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_votes_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          options: Json
          question: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json
          question: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json
          question?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_feedback_rate_limit: {
        Args: { _identifier: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
