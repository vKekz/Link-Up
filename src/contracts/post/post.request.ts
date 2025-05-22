export interface PostRequest {
    title?: string;
    tags?: string[];
    location?: string;
    description?: string;
    open_to_join?: boolean;
    creator_id?: string;
    date?: Date;
}