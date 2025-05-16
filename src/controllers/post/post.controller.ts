import { ApiController } from "../api-controller";
import { Post } from "../../models/post.model";

export class PostController extends ApiController {
  private readonly postsTable = "posts";

  public async getPosts(): Promise<Post[]> {
    const response = await this.supabaseClient.from(this.postsTable).select().order("created_at", { ascending: false });
    return response.data as Post[];
  }

  public async createPost(post: Post) {
    return this.supabaseClient.from(this.postsTable).insert([post]);
  }

  public async updatePost(id: string, updatedFields: Partial<Post>) {
    return this.supabaseClient.from(this.postsTable).update(updatedFields).eq("id", id);
  }

  public async deletePost(id: string) {
    return this.supabaseClient.from(this.postsTable).delete().eq("id", id);
  }
}
