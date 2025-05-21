export interface Group {
  id: number;
  name: string;
  description: string;
  creator_id: string;
  members: string[];
  created_at: string;
  image_url?: string;
  // Zusätzliche Eigenschaften für die verbesserte UI
  member_count?: number;
  last_activity?: string;
  location?: string;
  tags?: string[];
}
