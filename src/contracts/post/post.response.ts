import { ProfileResponse } from "../profile/profile.response";

export interface PostResponse {
  id: string;
  title: string;
  tags?: string[];
  location?: string;
  description?: string;
  open_to_join?: boolean;
  creator_id: string;
  created_at?: string;
  longitude?: number;
  latitude?: number;
  date: Date;
  creator_profile: ProfileResponse;
}
