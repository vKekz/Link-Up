export interface PostRequest {
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
}
