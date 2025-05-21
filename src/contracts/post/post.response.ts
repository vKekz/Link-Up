export interface PostResponse {
    id: string;
    created_at: Date;
    title: string;
    description: string;
    tags: string[];
    open_to_join: boolean;
    creator_id: string;
    location: string;
    geo_location: string;
}