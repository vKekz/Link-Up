import { SupabaseClient } from "@supabase/supabase-js";
import { PostResponse } from "../../contracts/post/post.response";
import { ApiController } from "../api-controller";
import { signal, WritableSignal } from "@angular/core";
import { PostRequest } from "../../contracts/post/post.request";


export class PostController extends ApiController {
  private readonly POSTS_TABLE_NAME: string = "posts";
  public readonly posts: WritableSignal<PostResponse[]> = signal([]);

  constructor(supabaseClient: SupabaseClient) {
    super(supabaseClient);

    this.loadPosts();
  }

  public async createPost(postRequest: PostRequest) {
    await this.supabaseClient.from(this.POSTS_TABLE_NAME).insert(postRequest);

    this.posts.update((data) => {
      return [...data, postRequest as PostResponse]
    });
  }

  public async deletePost(id: string) {
    await this.supabaseClient.from(this.POSTS_TABLE_NAME).delete().eq('id', id);

    this.posts.update((currentPosts) => {
      return currentPosts.filter(post => post.id !== id);
    });
  }

  public async loadPosts() {
    const { data, error } = await this.supabaseClient.from(this.POSTS_TABLE_NAME).select();

    if (error) {
      console.error("Error loading posts:", error);
      return;
    }

    const mappedPosts: PostResponse[] = data.map(item => this.mapSupabasePostToResponse(item));
    this.posts.set(mappedPosts);
  }

  private mapSupabasePostToResponse(rawPost: any): PostResponse {

    return {
      id: rawPost.id,
      title: rawPost.title,
      tags: rawPost.tags || [],
      location: rawPost.location,
      description: rawPost.description,
      creator_id: rawPost.creator_id,
      date: rawPost.date,
      isOpen: rawPost.open_to_join,
      created_at: rawPost.created_at,
      open_to_join: rawPost.open_to_join,
      geo_location: rawPost.geo_location 
    };
  }
  
}
