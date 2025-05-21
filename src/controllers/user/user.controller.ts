import { ApiController } from "../api-controller";
import { UserRegistrationResponse } from "../../contracts/user/user-registration.response";
import { environment } from "../../environments/environment.production";
import { UserLoginResponse } from "../../contracts/user/user-login.response";
import { ProfileResponse } from "../../contracts/user/profile.response";
import { signal, WritableSignal } from "@angular/core";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Represents the controller that is used for user authentication.
 */
export class UserController extends ApiController {
  public readonly profileDetails: WritableSignal<ProfileResponse | null> = signal(null);

  constructor(supabaseClient: SupabaseClient) {
    super(supabaseClient);

    this.getProfileDetails().then((response) => {
      this.profileDetails.set(response);
    });
  }

  /**
   * Creates a new user using email and password.
   *
   * See https://supabase.com/docs/reference/javascript/auth-signup
   */
  public async signUpUser(name: string, email: string, password: string): Promise<UserRegistrationResponse> {
    const response = await this.supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: environment.supabaseEmailRedirectTo,
      },
    });

    await this.supabaseClient.from("profiles").insert({
      user_id: response.data.user?.id,
      full_name: name,
    } as ProfileResponse);

    return {
      id: response.data.user?.id,
      error: response.error?.code,
      message: response.error?.message,
    } as UserRegistrationResponse;
  }

  /**
   * Log in an existing user with an email and password.
   *
   * See https://supabase.com/docs/reference/javascript/auth-signinwithpassword
   */
  public async signInUser(email: string, password: string): Promise<UserLoginResponse> {
    const response = await this.supabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    });

    return {
      id: response.data.user?.id,
      error: response.error?.code,
      message: response.error?.message,
    } as UserLoginResponse;
  }

  public async signOut() {
    await this.supabaseClient.auth.signOut();
  }

  public async getProfileDetails(): Promise<ProfileResponse | null> {
    const user = await this.supabaseClient.auth.getUser();
    if (!user.data.user) {
      return null;
    }

    const response = await this.supabaseClient.from("profiles").select().eq("user_id", user.data.user?.id);
    const foundProfile = response.data?.at(0);

    return {
      user_id: foundProfile.user_id,
      full_name: foundProfile.full_name,
    } as ProfileResponse;
  }
}
