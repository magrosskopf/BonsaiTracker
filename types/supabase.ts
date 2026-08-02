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
      auth_rate_limit_events: {
        Row: {
          created_at: string
          id: number
          key_hash: string
          scope: string
        }
        Insert: {
          created_at?: string
          id?: number
          key_hash: string
          scope: string
        }
        Update: {
          created_at?: string
          id?: number
          key_hash?: string
          scope?: string
        }
        Relationships: []
      }
      bonsais: {
        Row: {
          acquired_from: string | null
          age: number | null
          created_at: string
          custom_style: string | null
          deleted_at: string | null
          development_stage: Database["public"]["Enums"]["development_stage_enum"]
          fertilizing_notes: string | null
          health_status: Database["public"]["Enums"]["health_status_enum"]
          height_cm: number | null
          id: number
          images: string[]
          indoor_outdoor: Database["public"]["Enums"]["indoor_outdoor_enum"]
          last_repot_date: string | null
          latin_name: string | null
          location: string
          name: string
          next_repot_due: string | null
          nickname: string | null
          notes: string | null
          owned_since: string | null
          pot_color: string | null
          pot_type: string | null
          pruning_notes: string | null
          purchase_price_cents: number | null
          species: string
          style: string
          sun_exposure: Database["public"]["Enums"]["sun_exposure_enum"] | null
          trunk_diameter_mm: number | null
          updated_at: string
          user_id: string
          watering_notes: string | null
          width_cm: number | null
          winter_hardiness:
            | Database["public"]["Enums"]["winter_hardiness_enum"]
            | null
          wiring_notes: string | null
        }
        Insert: {
          acquired_from?: string | null
          age?: number | null
          created_at?: string
          custom_style?: string | null
          deleted_at?: string | null
          development_stage: Database["public"]["Enums"]["development_stage_enum"]
          fertilizing_notes?: string | null
          health_status: Database["public"]["Enums"]["health_status_enum"]
          height_cm?: number | null
          id?: number
          images?: string[]
          indoor_outdoor: Database["public"]["Enums"]["indoor_outdoor_enum"]
          last_repot_date?: string | null
          latin_name?: string | null
          location: string
          name: string
          next_repot_due?: string | null
          nickname?: string | null
          notes?: string | null
          owned_since?: string | null
          pot_color?: string | null
          pot_type?: string | null
          pruning_notes?: string | null
          purchase_price_cents?: number | null
          species: string
          style: string
          sun_exposure?: Database["public"]["Enums"]["sun_exposure_enum"] | null
          trunk_diameter_mm?: number | null
          updated_at?: string
          user_id: string
          watering_notes?: string | null
          width_cm?: number | null
          winter_hardiness?:
            | Database["public"]["Enums"]["winter_hardiness_enum"]
            | null
          wiring_notes?: string | null
        }
        Update: {
          acquired_from?: string | null
          age?: number | null
          created_at?: string
          custom_style?: string | null
          deleted_at?: string | null
          development_stage?: Database["public"]["Enums"]["development_stage_enum"]
          fertilizing_notes?: string | null
          health_status?: Database["public"]["Enums"]["health_status_enum"]
          height_cm?: number | null
          id?: number
          images?: string[]
          indoor_outdoor?: Database["public"]["Enums"]["indoor_outdoor_enum"]
          last_repot_date?: string | null
          latin_name?: string | null
          location?: string
          name?: string
          next_repot_due?: string | null
          nickname?: string | null
          notes?: string | null
          owned_since?: string | null
          pot_color?: string | null
          pot_type?: string | null
          pruning_notes?: string | null
          purchase_price_cents?: number | null
          species?: string
          style?: string
          sun_exposure?: Database["public"]["Enums"]["sun_exposure_enum"] | null
          trunk_diameter_mm?: number | null
          updated_at?: string
          user_id?: string
          watering_notes?: string | null
          width_cm?: number | null
          winter_hardiness?:
            | Database["public"]["Enums"]["winter_hardiness_enum"]
            | null
          wiring_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bonsais_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_reports: {
        Row: {
          created_at: string
          id: number
          note: string | null
          reason: Database["public"]["Enums"]["community_report_reason_enum"]
          reporter_user_id: string
          status: Database["public"]["Enums"]["community_report_status_enum"]
          target_comment_id: number | null
          target_post_id: number | null
          target_type: Database["public"]["Enums"]["community_report_target_type_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          note?: string | null
          reason: Database["public"]["Enums"]["community_report_reason_enum"]
          reporter_user_id: string
          status?: Database["public"]["Enums"]["community_report_status_enum"]
          target_comment_id?: number | null
          target_post_id?: number | null
          target_type: Database["public"]["Enums"]["community_report_target_type_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          note?: string | null
          reason?: Database["public"]["Enums"]["community_report_reason_enum"]
          reporter_user_id?: string
          status?: Database["public"]["Enums"]["community_report_status_enum"]
          target_comment_id?: number | null
          target_post_id?: number | null
          target_type?: Database["public"]["Enums"]["community_report_target_type_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_reports_reporter_user_id_fkey"
            columns: ["reporter_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reports_target_comment_id_fkey"
            columns: ["target_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reports_target_post_id_fkey"
            columns: ["target_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          created_at: string
          id: number
          post_id: number
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          post_id: number
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          post_id?: number
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_entry_references: {
        Row: {
          created_at: string
          id: number
          post_id: number
          sub_entry_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          post_id: number
          sub_entry_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          post_id?: number
          sub_entry_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_entry_references_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_entry_references_sub_entry_id_fkey"
            columns: ["sub_entry_id"]
            isOneToOne: false
            referencedRelation: "sub_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: number
          post_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          post_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          post_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          archived_at: string | null
          bonsai_id: number
          created_at: string
          id: number
          images: string[]
          post_type: Database["public"]["Enums"]["post_type_enum"]
          snapshot_name: string
          snapshot_species: string
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          bonsai_id: number
          created_at?: string
          id?: number
          images?: string[]
          post_type: Database["public"]["Enums"]["post_type_enum"]
          snapshot_name: string
          snapshot_species: string
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          bonsai_id?: number
          created_at?: string
          id?: number
          images?: string[]
          post_type?: Database["public"]["Enums"]["post_type_enum"]
          snapshot_name?: string
          snapshot_species?: string
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_bonsai_id_fkey"
            columns: ["bonsai_id"]
            isOneToOne: false
            referencedRelation: "bonsais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          name: string | null
          profile_image_url: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id: string
          name?: string | null
          profile_image_url?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          name?: string | null
          profile_image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          bonsai_id: number
          completed_at: string | null
          created_at: string
          id: number
          reminder_date: string
          snoozed_until: string | null
          status: Database["public"]["Enums"]["reminder_status_enum"]
          sub_entry_id: number | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bonsai_id: number
          completed_at?: string | null
          created_at?: string
          id?: number
          reminder_date: string
          snoozed_until?: string | null
          status?: Database["public"]["Enums"]["reminder_status_enum"]
          sub_entry_id?: number | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bonsai_id?: number
          completed_at?: string | null
          created_at?: string
          id?: number
          reminder_date?: string
          snoozed_until?: string | null
          status?: Database["public"]["Enums"]["reminder_status_enum"]
          sub_entry_id?: number | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_bonsai_id_user_id_fkey"
            columns: ["bonsai_id", "user_id"]
            isOneToOne: false
            referencedRelation: "bonsais"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "reminders_sub_entry_id_bonsai_id_fkey"
            columns: ["sub_entry_id", "bonsai_id"]
            isOneToOne: false
            referencedRelation: "sub_entries"
            referencedColumns: ["id", "bonsai_id"]
          },
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      signup_allowlist: {
        Row: {
          created_at: string
          email: string
          id: number
          note: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          note?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          note?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      signup_settings: {
        Row: {
          created_at: string
          id: boolean
          max_total_users: number
          signup_enabled: boolean
          updated_at: string
          waitlist_enabled: boolean
        }
        Insert: {
          created_at?: string
          id?: boolean
          max_total_users: number
          signup_enabled?: boolean
          updated_at?: string
          waitlist_enabled?: boolean
        }
        Update: {
          created_at?: string
          id?: boolean
          max_total_users?: number
          signup_enabled?: boolean
          updated_at?: string
          waitlist_enabled?: boolean
        }
        Relationships: []
      }
      sub_entries: {
        Row: {
          bonsai_id: number
          created_at: string
          date: string
          entry_type: Database["public"]["Enums"]["entry_type_enum"]
          health_observation:
            | Database["public"]["Enums"]["health_status_enum"]
            | null
          id: number
          images: string[]
          next_action: string | null
          notes: string | null
          performed_actions: string[]
          reminder_date: string | null
          updated_at: string
        }
        Insert: {
          bonsai_id: number
          created_at?: string
          date: string
          entry_type: Database["public"]["Enums"]["entry_type_enum"]
          health_observation?:
            | Database["public"]["Enums"]["health_status_enum"]
            | null
          id?: number
          images?: string[]
          next_action?: string | null
          notes?: string | null
          performed_actions?: string[]
          reminder_date?: string | null
          updated_at?: string
        }
        Update: {
          bonsai_id?: number
          created_at?: string
          date?: string
          entry_type?: Database["public"]["Enums"]["entry_type_enum"]
          health_observation?:
            | Database["public"]["Enums"]["health_status_enum"]
            | null
          id?: number
          images?: string[]
          next_action?: string | null
          notes?: string | null
          performed_actions?: string[]
          reminder_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_entries_bonsai_id_fkey"
            columns: ["bonsai_id"]
            isOneToOne: false
            referencedRelation: "bonsais"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_requests: {
        Row: {
          created_at: string
          email: string
          id: number
          source_ip: string | null
          status: Database["public"]["Enums"]["waitlist_status_enum"]
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          source_ip?: string | null
          status?: Database["public"]["Enums"]["waitlist_status_enum"]
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          source_ip?: string | null
          status?: Database["public"]["Enums"]["waitlist_status_enum"]
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      append_bonsai_image: {
        Args: {
          p_actor_user_id: string
          p_bonsai_id: number
          p_media_path: string
        }
        Returns: string[]
      }
      approve_waitlist: {
        Args: { p_email: string; p_note?: string }
        Returns: Json
      }
      before_user_created: { Args: { event: Json }; Returns: Json }
      can_access_media: {
        Args: { p_actor_user_id: string; p_media_path: string }
        Returns: boolean
      }
      can_delete_media: {
        Args: { p_actor_user_id: string; p_media_path: string }
        Returns: boolean
      }
      consume_auth_rate_limit: {
        Args: {
          p_key_hash: string
          p_max_hits: number
          p_scope: string
          p_window_seconds: number
        }
        Returns: {
          allowed: boolean
          remaining: number
          retry_after_seconds: number
        }[]
      }
      create_owned_reminder: {
        Args: { p_actor_user_id: string; p_payload: Json }
        Returns: {
          bonsai_id: number
          completed_at: string | null
          created_at: string
          id: number
          reminder_date: string
          snoozed_until: string | null
          status: Database["public"]["Enums"]["reminder_status_enum"]
          sub_entry_id: number | null
          title: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "reminders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_owned_sub_entry: {
        Args: { p_actor_user_id: string; p_images: string[]; p_payload: Json }
        Returns: {
          bonsai_id: number
          created_at: string
          date: string
          entry_type: Database["public"]["Enums"]["entry_type_enum"]
          health_observation:
            | Database["public"]["Enums"]["health_status_enum"]
            | null
          id: number
          images: string[]
          next_action: string | null
          notes: string | null
          performed_actions: string[]
          reminder_date: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "sub_entries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      delete_owned_sub_entry: {
        Args: { p_actor_user_id: string; p_sub_entry_id: number }
        Returns: string[]
      }
      list_owned_bonsais: {
        Args: {
          p_actor_user_id: string
          p_cursor_id?: number
          p_cursor_updated_at?: string
          p_development_stage?: Database["public"]["Enums"]["development_stage_enum"]
          p_health_status?: Database["public"]["Enums"]["health_status_enum"]
          p_indoor_outdoor?: Database["public"]["Enums"]["indoor_outdoor_enum"]
          p_limit?: number
          p_search?: string
          p_species?: string
          p_status?: string
        }
        Returns: {
          acquired_from: string
          age: number
          created_at: string
          custom_style: string
          deleted_at: string
          development_stage: Database["public"]["Enums"]["development_stage_enum"]
          fertilizing_notes: string
          health_status: Database["public"]["Enums"]["health_status_enum"]
          height_cm: number
          id: number
          images: string[]
          indoor_outdoor: Database["public"]["Enums"]["indoor_outdoor_enum"]
          last_repot_date: string
          latin_name: string
          location: string
          name: string
          next_repot_due: string
          nickname: string
          notes: string
          owned_since: string
          pot_color: string
          pot_type: string
          pruning_notes: string
          purchase_price_cents: number
          species: string
          style: string
          sub_entry_count: number
          sun_exposure: Database["public"]["Enums"]["sun_exposure_enum"]
          trunk_diameter_mm: number
          updated_at: string
          user_id: string
          watering_notes: string
          width_cm: number
          winter_hardiness: Database["public"]["Enums"]["winter_hardiness_enum"]
          wiring_notes: string
        }[]
      }
      normalize_signup_email: { Args: { p_email: string }; Returns: string }
      patch_owned_bonsai: {
        Args: {
          p_actor_user_id: string
          p_bonsai_id: number
          p_images_to_add: string[]
          p_images_to_remove: string[]
          p_patch: Json
        }
        Returns: {
          acquired_from: string | null
          age: number | null
          created_at: string
          custom_style: string | null
          deleted_at: string | null
          development_stage: Database["public"]["Enums"]["development_stage_enum"]
          fertilizing_notes: string | null
          health_status: Database["public"]["Enums"]["health_status_enum"]
          height_cm: number | null
          id: number
          images: string[]
          indoor_outdoor: Database["public"]["Enums"]["indoor_outdoor_enum"]
          last_repot_date: string | null
          latin_name: string | null
          location: string
          name: string
          next_repot_due: string | null
          nickname: string | null
          notes: string | null
          owned_since: string | null
          pot_color: string | null
          pot_type: string | null
          pruning_notes: string | null
          purchase_price_cents: number | null
          species: string
          style: string
          sun_exposure: Database["public"]["Enums"]["sun_exposure_enum"] | null
          trunk_diameter_mm: number | null
          updated_at: string
          user_id: string
          watering_notes: string | null
          width_cm: number | null
          winter_hardiness:
            | Database["public"]["Enums"]["winter_hardiness_enum"]
            | null
          wiring_notes: string | null
        }
        SetofOptions: {
          from: "*"
          to: "bonsais"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      patch_owned_sub_entry: {
        Args: {
          p_actor_user_id: string
          p_images_to_add: string[]
          p_images_to_remove: string[]
          p_patch: Json
          p_sub_entry_id: number
        }
        Returns: {
          bonsai_id: number
          created_at: string
          date: string
          entry_type: Database["public"]["Enums"]["entry_type_enum"]
          health_observation:
            | Database["public"]["Enums"]["health_status_enum"]
            | null
          id: number
          images: string[]
          next_action: string | null
          notes: string | null
          performed_actions: string[]
          reminder_date: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "sub_entries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      precheck_signup: {
        Args: { p_email: string }
        Returns: {
          allowed: boolean
          reason: string
          waitlist_enabled: boolean
        }[]
      }
      save_owned_post: {
        Args: {
          p_actor_user_id: string
          p_bonsai_id: number
          p_entry_ids: number[]
          p_images: string[]
          p_post_id: number
          p_post_type: Database["public"]["Enums"]["post_type_enum"]
          p_text: string
        }
        Returns: number
      }
      set_bonsai_archived: {
        Args: {
          p_actor_user_id: string
          p_archived: boolean
          p_bonsai_id: number
        }
        Returns: number
      }
      toggle_post_like: {
        Args: { p_actor_user_id: string; p_post_id: number }
        Returns: {
          like_count: number
          liked: boolean
        }[]
      }
    }
    Enums: {
      community_report_reason_enum:
        | "SPAM"
        | "HARASSMENT"
        | "HATE_OR_EXTREMISM"
        | "SEXUAL_CONTENT"
        | "VIOLENCE_OR_SELF_HARM"
        | "ILLEGAL_CONTENT"
        | "PERSONAL_DATA"
        | "OTHER"
      community_report_status_enum: "OPEN"
      community_report_target_type_enum: "post" | "comment"
      development_stage_enum:
        | "UNBEKANNT"
        | "ROHLING"
        | "IN_GESTALTUNG"
        | "VERFEINERUNG"
        | "REIF"
      entry_type_enum:
        | "GIESSEN"
        | "DUENGEN"
        | "SCHNEIDEN"
        | "DRAHTEN"
        | "UMTOPFEN"
        | "KONTROLLE"
        | "FOTO_UPDATE"
        | "SONSTIGES"
      health_status_enum:
        | "UNBEKANNT"
        | "SEHR_GUT"
        | "GUT"
        | "BEOBACHTEN"
        | "KRITISCH"
      indoor_outdoor_enum: "INDOOR" | "OUTDOOR" | "BEIDES"
      post_type_enum: "SHOWCASE" | "HELP"
      reminder_status_enum: "PENDING" | "DONE" | "SNOOZED" | "CANCELLED"
      sun_exposure_enum: "VOLLE_SONNE" | "HALBSCHATTEN" | "SCHATTEN"
      waitlist_status_enum: "PENDING" | "APPROVED" | "REJECTED"
      winter_hardiness_enum:
        | "NICHT_WINTERHART"
        | "BEDINGT_WINTERHART"
        | "WINTERHART"
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
      community_report_reason_enum: [
        "SPAM",
        "HARASSMENT",
        "HATE_OR_EXTREMISM",
        "SEXUAL_CONTENT",
        "VIOLENCE_OR_SELF_HARM",
        "ILLEGAL_CONTENT",
        "PERSONAL_DATA",
        "OTHER",
      ],
      community_report_status_enum: ["OPEN"],
      community_report_target_type_enum: ["post", "comment"],
      development_stage_enum: [
        "UNBEKANNT",
        "ROHLING",
        "IN_GESTALTUNG",
        "VERFEINERUNG",
        "REIF",
      ],
      entry_type_enum: [
        "GIESSEN",
        "DUENGEN",
        "SCHNEIDEN",
        "DRAHTEN",
        "UMTOPFEN",
        "KONTROLLE",
        "FOTO_UPDATE",
        "SONSTIGES",
      ],
      health_status_enum: [
        "UNBEKANNT",
        "SEHR_GUT",
        "GUT",
        "BEOBACHTEN",
        "KRITISCH",
      ],
      indoor_outdoor_enum: ["INDOOR", "OUTDOOR", "BEIDES"],
      post_type_enum: ["SHOWCASE", "HELP"],
      reminder_status_enum: ["PENDING", "DONE", "SNOOZED", "CANCELLED"],
      sun_exposure_enum: ["VOLLE_SONNE", "HALBSCHATTEN", "SCHATTEN"],
      waitlist_status_enum: ["PENDING", "APPROVED", "REJECTED"],
      winter_hardiness_enum: [
        "NICHT_WINTERHART",
        "BEDINGT_WINTERHART",
        "WINTERHART",
      ],
    },
  },
} as const

