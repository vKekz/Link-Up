import { Injectable } from "@angular/core";
import { AuthResponse, createClient, SupabaseClient } from "@supabase/supabase-js";
import { environment } from "../environments/environment.production";
import { Post } from '../interfaces/post.model';

@Injectable({
  providedIn: "root",
})

/**
 * Represents the service that is used for Supabase API communication.
 *
 * See https://supabase.com/docs/reference/javascript/start
 */
export class SupabaseService {
  private readonly supabaseClient?: SupabaseClient;
  private readonly postsTable = 'posts';

  constructor() {
    if (this.supabaseClient) {
      return;
    }

    this.supabaseClient = createClient(environment.supabaseUrl!, environment.supabaseKey!);
  }

  // Example usage for signing up a user.
  public signUpUser(email: string, password: string): Promise<AuthResponse> | undefined {
    return this.supabaseClient?.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: environment.supabaseEmailRedirectTo,
      },
    });
  }

  // --- POSTS CRUD ---

  public async getPosts() {
    return await this.supabaseClient!
      .from(this.postsTable)
      .select('*')
      .order('created_at', { ascending: false });
  }

  public async createPost(post: Post) {
    return await this.supabaseClient!
      .from(this.postsTable)
      .insert([post]);
  }

  public async updatePost(id: string, updatedFields: Partial<Post>) {
    return await this.supabaseClient!
      .from(this.postsTable)
      .update(updatedFields)
      .eq('id', id);
  }

  public async deletePost(id: string) {
    return await this.supabaseClient!
      .from(this.postsTable)
      .delete()
      .eq('id', id);
  }
}


