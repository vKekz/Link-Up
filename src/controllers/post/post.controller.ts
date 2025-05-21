import { SupabaseClient } from "@supabase/supabase-js";
import { PostResponse } from "../../contracts/post/post.response";
import { ApiController } from "../api-controller";
import { signal, WritableSignal } from "@angular/core";
import { PostRequest } from "../../contracts/post/post.request";

/**
 * Represents the controller that is used for user posts.
 */ 
export class PostController extends ApiController {
  private readonly POSTS_TABLE_NAME: string = "posts";
  public readonly posts: WritableSignal<PostResponse[]> = signal([]);

  constructor(supabaseClient: SupabaseClient) {
    super(supabaseClient);

    this.loadPosts();
  }

  public async createPost(postRequest: PostRequest) {
    await this.supabaseClient.from(this.POSTS_TABLE_NAME).insert(postRequest);

    // Updating in frontend
    this.posts.update((data) => {
      return [...data, postRequest as PostResponse]
    });
  }

  public async deletePost(id: string) {}

  private async loadPosts() {
    // TODO: Filter
    const response = await this.supabaseClient.from(this.POSTS_TABLE_NAME).select();
    this.posts.set(response.data as PostResponse[]);
  }
}
