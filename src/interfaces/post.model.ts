export interface Post {
  id?: string;
  creator_id: string;
  title: string;
  description: string;
  tags: string[];
  created_at?: string;
  join_policy: 'open' | 'closed' | '18+';
  participants?: string[]; // Optional
}
