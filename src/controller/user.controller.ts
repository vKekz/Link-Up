import { SupabaseClient } from "@supabase/supabase-js";
import { environment } from "../environments/environment.production";

/**
 * Represents the controller that is used for user authentication.
 */
export class UserController {
  private readonly supabaseClient: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabaseClient = supabaseClient;
  }

  /**
   * Creates a new user using email and password.
   *
   * See https://supabase.com/docs/reference/javascript/auth-signup
   */
  public signUpUser(email: string, password: string) {
    return this.supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: environment.supabaseEmailRedirectTo,
      },
    });
  }

  /**
   * Log in an existing user with an email and password.
   *
   * See https://supabase.com/docs/reference/javascript/auth-signinwithpassword
   */
  public signInUser(email: string, password: string) {
    return this.supabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    });
  }
}
