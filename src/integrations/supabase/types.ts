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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      consent_records: {
        Row: {
          consent_timestamp: string
          id: string
          ip_address: unknown | null
          memora_enabled: boolean
          stay_id: string | null
          two_factor_verified: boolean
          user_id: string
        }
        Insert: {
          consent_timestamp?: string
          id?: string
          ip_address?: unknown | null
          memora_enabled?: boolean
          stay_id?: string | null
          two_factor_verified?: boolean
          user_id: string
        }
        Update: {
          consent_timestamp?: string
          id?: string
          ip_address?: unknown | null
          memora_enabled?: boolean
          stay_id?: string | null
          two_factor_verified?: boolean
          user_id?: string
        }
        Relationships: []
      }
      custom_experiences: {
        Row: {
          created_at: string
          experience_date: string | null
          experience_time: string | null
          id: string
          image_url: string | null
          message: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experience_date?: string | null
          experience_time?: string | null
          id?: string
          image_url?: string | null
          message?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          experience_date?: string | null
          experience_time?: string | null
          id?: string
          image_url?: string | null
          message?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      liked_recommendations: {
        Row: {
          category: string
          created_at: string
          description: string | null
          duration: string | null
          id: string
          image_url: string | null
          location: string | null
          rating: number | null
          recommendation_id: string
          title: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          rating?: number | null
          recommendation_id: string
          title: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          rating?: number | null
          recommendation_id?: string
          title?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      memory_capsule_entries: {
        Row: {
          created_at: string | null
          experience_id: string
          experience_timestamp: string | null
          experience_title: string
          id: string
          location: string | null
          note: string | null
          photos: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          experience_id: string
          experience_timestamp?: string | null
          experience_title: string
          id?: string
          location?: string | null
          note?: string | null
          photos?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          experience_id?: string
          experience_timestamp?: string | null
          experience_title?: string
          id?: string
          location?: string | null
          note?: string | null
          photos?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      privacy_preferences: {
        Row: {
          created_at: string
          id: string
          stay_id: string | null
          tier: Database["public"]["Enums"]["privacy_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          stay_id?: string | null
          tier?: Database["public"]["Enums"]["privacy_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          stay_id?: string | null
          tier?: Database["public"]["Enums"]["privacy_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bonvoy_points: number | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bonvoy_points?: number | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bonvoy_points?: number | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          activity_types: string[]
          completed_at: string
          dining_preferences: string[]
          id: string
          interests: string[]
          travel_style: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_types?: string[]
          completed_at?: string
          dining_preferences?: string[]
          id?: string
          interests?: string[]
          travel_style?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_types?: string[]
          completed_at?: string
          dining_preferences?: string[]
          id?: string
          interests?: string[]
          travel_style?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      viewed_recommendations: {
        Row: {
          created_at: string | null
          decision: string
          id: string
          recommendation_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          decision: string
          id?: string
          recommendation_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          decision?: string
          id?: string
          recommendation_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      privacy_tier: "private" | "share_with_staff" | "share_with_partners"
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
      privacy_tier: ["private", "share_with_staff", "share_with_partners"],
    },
  },
} as const
