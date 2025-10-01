export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          comment: string | null
          is_attending: boolean
          meeting_id: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          is_attending?: boolean
          meeting_id?: number
          user_id: string
        }
        Update: {
          comment?: string | null
          is_attending?: boolean
          meeting_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meeting"
            referencedColumns: ["id"]
          },
        ]
      }
      enrolment: {
        Row: {
          class: Database["public"]["Enums"]["class_type"]
          course: string
          end_time: string | null
          id: number
          room: string
          section: string | null
          start_time: string
          user: string
        }
        Insert: {
          class: Database["public"]["Enums"]["class_type"]
          course: string
          end_time?: string | null
          id: number
          room: string
          section?: string | null
          start_time: string
          user: string
        }
        Update: {
          class?: Database["public"]["Enums"]["class_type"]
          course?: string
          end_time?: string | null
          id?: number
          room?: string
          section?: string | null
          start_time?: string
          user?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrolment_room_fkey"
            columns: ["room"]
            isOneToOne: false
            referencedRelation: "room"
            referencedColumns: ["name"]
          },
        ]
      }
      meeting: {
        Row: {
          created_at: string
          creator: string
          description: string | null
          end_time: string | null
          id: number
          room: string | null
          squad_id: number
          start_time: string
        }
        Insert: {
          created_at?: string
          creator: string
          description?: string | null
          end_time?: string | null
          id?: number
          room?: string | null
          squad_id: number
          start_time: string
        }
        Update: {
          created_at?: string
          creator?: string
          description?: string | null
          end_time?: string | null
          id?: number
          room?: string | null
          squad_id?: number
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_room_fkey"
            columns: ["room"]
            isOneToOne: false
            referencedRelation: "room"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "meeting_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squad"
            referencedColumns: ["id"]
          },
        ]
      }
      member: {
        Row: {
          created_at: string
          squad_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          squad_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          squad_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squad"
            referencedColumns: ["id"]
          },
        ]
      }
      message: {
        Row: {
          body: string | null
          created_at: string
          id: number
          is_deleted: boolean
          is_edited: boolean
          sender: string
          squad_id: number
          updated_at: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: number
          is_deleted?: boolean
          is_edited?: boolean
          sender: string
          squad_id: number
          updated_at?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: number
          is_deleted?: boolean
          is_edited?: boolean
          sender?: string
          squad_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squad"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          age: number | null
          bio: string | null
          created_at: string
          degree: string
          first_name: string
          gender: string | null
          ics_link: string
          id: string
          last_name: string
          profile_url: string
          zid: string
        }
        Insert: {
          age?: number | null
          bio?: string | null
          created_at?: string
          degree: string
          first_name: string
          gender?: string | null
          ics_link: string
          id: string
          last_name: string
          profile_url: string
          zid: string
        }
        Update: {
          age?: number | null
          bio?: string | null
          created_at?: string
          degree?: string
          first_name?: string
          gender?: string | null
          ics_link?: string
          id?: string
          last_name?: string
          profile_url?: string
          zid?: string
        }
        Relationships: []
      }
      room: {
        Row: {
          abbr: string
          name: string
        }
        Insert: {
          abbr: string
          name: string
        }
        Update: {
          abbr?: string
          name?: string
        }
        Relationships: []
      }
      squad: {
        Row: {
          course: string
          created_at: string
          creator: string
          description: string | null
          id: number
          name: string
          profile_url: string | null
          status: Database["public"]["Enums"]["squad_type"]
          visibility: Database["public"]["Enums"]["squad_visibility"]
        }
        Insert: {
          course: string
          created_at?: string
          creator: string
          description?: string | null
          id?: number
          name: string
          profile_url?: string | null
          status?: Database["public"]["Enums"]["squad_type"]
          visibility?: Database["public"]["Enums"]["squad_visibility"]
        }
        Update: {
          course?: string
          created_at?: string
          creator?: string
          description?: string | null
          id?: number
          name?: string
          profile_url?: string | null
          status?: Database["public"]["Enums"]["squad_type"]
          visibility?: Database["public"]["Enums"]["squad_visibility"]
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
      class_type: "lec" | "tut" | "lab"
      squad_type: "pending" | "active" | "deleted"
      squad_visibility: "open" | "closed"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      class_type: ["lec", "tut", "lab"],
      squad_type: ["pending", "active", "deleted"],
      squad_visibility: ["open", "closed"],
    },
  },
} as const

