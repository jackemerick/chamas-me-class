// Tipos gerados manualmente baseados no schema SQL
// Apos configurar o Supabase, rodar: npx supabase gen types typescript --local > src/types/database.ts

export type OrgRole = "member" | "admin" | "superadmin";
export type AttendanceStatus = "present" | "absent" | "justified";

export type Database = {
  public: {
    Tables: {
      superadmins: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          primary_color: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          primary_color?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          primary_color?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string | null;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      invites: {
        Row: {
          id: string;
          org_id: string;
          code: string;
          email: string | null;
          token: string | null;
          created_by: string | null;
          used_by: string | null;
          used_at: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          code?: string;
          email?: string | null;
          token?: string | null;
          created_by?: string | null;
          used_by?: string | null;
          used_at?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          used_by?: string | null;
          used_at?: string | null;
        };
        Relationships: [];
      };
      org_members: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: OrgRole;
          invited_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role?: OrgRole;
          invited_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          role?: OrgRole;
          invited_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      classes: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          group_label: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          group_label?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          group_label?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      class_teachers: {
        Row: {
          id: string;
          class_id: string;
          user_id: string;
          added_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          user_id: string;
          added_by?: string | null;
          created_at?: string;
        };
        Update: {
          added_by?: string | null;
        };
        Relationships: [];
      };
      access_requests: {
        Row: {
          id: string;
          class_id: string;
          user_id: string;
          status: "pending" | "approved" | "rejected";
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          user_id: string;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
        };
        Update: {
          status?: "pending" | "approved" | "rejected";
        };
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          class_id: string;
          name: string;
          birthdate: string | null;
          city: string | null;
          responsible_name: string | null;
          responsible_phone: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          name: string;
          birthdate?: string | null;
          city?: string | null;
          responsible_name?: string | null;
          responsible_phone?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          name?: string;
          birthdate?: string | null;
          city?: string | null;
          responsible_name?: string | null;
          responsible_phone?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      meetings: {
        Row: {
          id: string;
          class_id: string;
          date: string;
          theme: string | null;
          recurrence: "none" | "weekly" | "biweekly" | "monthly";
          recurrence_end_date: string | null;
          responsible_user_id: string | null;
          music_url: string | null;
          music_title: string | null;
          notes: string | null;
          concluded: boolean;
          concluded_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          date: string;
          theme?: string | null;
          recurrence?: "none" | "weekly" | "biweekly" | "monthly";
          recurrence_end_date?: string | null;
          responsible_user_id?: string | null;
          music_url?: string | null;
          music_title?: string | null;
          notes?: string | null;
          concluded?: boolean;
          concluded_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          date?: string;
          theme?: string | null;
          recurrence?: "none" | "weekly" | "biweekly" | "monthly";
          recurrence_end_date?: string | null;
          responsible_user_id?: string | null;
          music_url?: string | null;
          music_title?: string | null;
          notes?: string | null;
          concluded?: boolean;
          concluded_at?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      meeting_tasks: {
        Row: {
          id: string;
          meeting_id: string;
          title: string;
          assigned_to: string | null;
          done: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          title: string;
          assigned_to?: string | null;
          done?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          meeting_id?: string;
          title?: string;
          assigned_to?: string | null;
          done?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      attendance: {
        Row: {
          id: string;
          meeting_id: string;
          student_id: string;
          status: AttendanceStatus;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          student_id: string;
          status?: AttendanceStatus;
          recorded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          meeting_id?: string;
          student_id?: string;
          status?: AttendanceStatus;
          recorded_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      point_categories: {
        Row: {
          id: string;
          class_id: string;
          name: string;
          default_value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          name: string;
          default_value?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          name?: string;
          default_value?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      points: {
        Row: {
          id: string;
          student_id: string;
          class_id: string;
          category_id: string | null;
          value: number;
          reason: string | null;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          class_id: string;
          category_id?: string | null;
          value: number;
          reason?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          class_id?: string;
          category_id?: string | null;
          value?: number;
          reason?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      cert_criteria: {
        Row: {
          id: string;
          class_id: string;
          course_id: string | null;
          min_attendance_pct: number;
          min_points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          course_id?: string | null;
          min_attendance_pct?: number;
          min_points?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          course_id?: string | null;
          min_attendance_pct?: number;
          min_points?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      certificates: {
        Row: {
          id: string;
          student_id: string;
          class_id: string;
          course_id: string | null;
          issued_by: string | null;
          issued_at: string;
          pdf_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          class_id: string;
          course_id?: string | null;
          issued_by?: string | null;
          issued_at?: string;
          pdf_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          class_id?: string;
          course_id?: string | null;
          issued_by?: string | null;
          issued_at?: string;
          pdf_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      class_plans: {
        Row: {
          id: string;
          class_id: string;
          title: string;
          description: string | null;
          order_index: number;
          completed: boolean;
          completed_at: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          title: string;
          description?: string | null;
          order_index?: number;
          completed?: boolean;
          completed_at?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          title?: string;
          description?: string | null;
          order_index?: number;
          completed?: boolean;
          completed_at?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_superadmin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      my_org_ids: {
        Args: Record<string, never>;
        Returns: string[];
      };
      my_role_in_org: {
        Args: { p_org_id: string };
        Returns: string;
      };
    };
    Enums: {
      org_role: OrgRole;
      attendance_status: AttendanceStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
