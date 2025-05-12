import { Injectable } from "@angular/core";
import { AuthResponse, createClient, SupabaseClient } from "@supabase/supabase-js";
import { environment } from "../environments/environment.production";

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

  constructor() {
    if (this.supabaseClient) {
      return;
    }

    this.supabaseClient = createClient(environment.supabaseUrl, environment.supabaseKey);
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
}
