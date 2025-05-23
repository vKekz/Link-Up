export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      post_chat: {
        Row: {
          created_at: string
          id: string
          post_id: string | null
          profile_photo: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          post_id?: string | null
          profile_photo?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string | null
          profile_photo?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_chat_post_id_fkey1"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          post_chat_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          post_chat_id: string
          sender_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          post_chat_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_chat_messages_post_chat_id_fkey"
            columns: ["post_chat_id"]
            isOneToOne: false
            referencedRelation: "post_chat"
            referencedColumns: ["id"]
          },
        ]
      }
      post_participants: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_participants_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          created_at: string
          creator_id: string
          date: string | null
          description: string | null
          geo_data: unknown | null
          id: string
          location: string | null
          open_to_join: boolean
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          creator_id?: string
          date?: string | null
          description?: string | null
          geo_data?: unknown | null
          id?: string
          location?: string | null
          open_to_join?: boolean
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          date?: string | null
          description?: string | null
          geo_data?: unknown | null
          id?: string
          location?: string | null
          open_to_join?: boolean
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      user_group_chat_last_seen: {
        Row: {
          last_seen_message_timestamp: string | null
          post_chat_id: string
          user_id: string
        }
        Insert: {
          last_seen_message_timestamp?: string | null
          post_chat_id: string
          user_id: string
        }
        Update: {
          last_seen_message_timestamp?: string | null
          post_chat_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_group_chat_last_seen_post_chat_id_fkey"
            columns: ["post_chat_id"]
            isOneToOne: false
            referencedRelation: "post_chat"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_post_chat_details: {
        Args: { p_post_chat_id: string }
        Returns: {
          title: string
          participant_count: number
          event_date: string
          tags: string[]
        }[]
      }
      get_post_chat_messages: {
        Args: { post_chat_id: string }
        Returns: {
          post_id: string
          message_id: string
          message_created_at: string
          message_content: string
          message_sender_id: string
          profile_name: string
          profile_id: string
          user_email: string
        }[]
      }
      get_unread_message_count: {
        Args: { p_user_id: string; p_post_chat_id: string }
        Returns: number
      }
      get_user_chat_threads: {
        Args: { input_user_id: string }
        Returns: {
          post_id: string
          post_chat_created_at: string
          post_chat_id: string
          chat_photo: string
          title: string
          message: string
          sender_id: string
          message_created_at: string
          sender_email: string
          fullname: string
          profile_id: string
        }[]
      }
      mark_chat_as_seen: {
        Args: { p_user_id: string; p_post_chat_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
