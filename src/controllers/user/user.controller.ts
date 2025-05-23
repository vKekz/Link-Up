﻿import { ApiController } from "../api-controller";
import { UserRegistrationResponse } from "../../contracts/user/user-registration.response";
import { environment } from "../../environments/environment.production";
import { UserLoginResponse } from "../../contracts/user/user-login.response";
import { ProfileResponse } from "../../contracts/profile/profile.response";
import { signal, WritableSignal } from "@angular/core";
import { AuthResponse, SupabaseClient } from "@supabase/supabase-js";
import { ProfileRequest } from "../../contracts/profile/profile.request";
import { ChangeNameResponse } from "../../contracts/profile/change-name.response";
import { UsernameResponse } from "../../contracts/profile/username.response";

/**
 * Represents the controller that is used for user authentication.
 */
export class UserController extends ApiController {
  /**
   * Creates a new user using email and password.
   *
   * See https://supabase.com/docs/reference/javascript/auth-signup
   */
  public async signUpUser(email: string, password: string): Promise<UserRegistrationResponse> {
    const response = await this.supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: environment.supabaseEmailRedirectTo,
      },
    });

    return {
      id: response.data.user?.id,
      error: response.error?.code,
      message: response.error?.message,
    };
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

  public async changeUserName(userName: string) {
    const userId = this.profileDetails()?.user_id;
    if (!userId) {
      return;
    }

    const response = await this.supabaseClient.from("profiles").update({ user_name: userName }).eq("user_id", userId);
    if (response.error) {
      return;
    }

    this.profileDetails.update((response) => {
      return {
        ...response,
        user_name: userName,
      } as ProfileResponse;
    });

    return {
      newName: userName,
    } as ChangeNameResponse;
  }

  public async getUserName(userId: string) {
    const response = await this.supabaseClient.from("profiles").select("user_name").eq("user_id", userId);
    const data = response.data?.at(0);
    if (!data) {
      return null;
    }

    return { userName: data.user_name } as UsernameResponse;
  }

  public async uploadProfileImage(file: File) {
    const userId = this.profileDetails()?.user_id;
    if (!userId) {
      return;
    }

    const hasAvatar = this.profileDetails()?.profileImageUrl !== null;
    if (hasAvatar) {
      await this.supabaseClient.storage.from("profile-avatars.storage").update(`${userId}/avatar.png`, file);
    } else {
      await this.supabaseClient.storage.from("profile-avatars.storage").upload(`${userId}/avatar.png`, file);
    }

    const base64 = await this.imageToBase64(file);
    this.profileDetails.update((response) => {
      return {
        ...response,
        profileImageUrl: base64,
      } as ProfileResponse;
    });
  }

  public async getProfileImageBase64(userId: string) {
    const response = await this.supabaseClient.storage.from("profile-avatars.storage").download(`${userId}/avatar.png`);
    const file = response.data;

    if (!file) {
      return null;
    }

    return this.imageToBase64(file);
  }

  public async isLoggedIn() {
    const session = await this.supabaseClient.auth.getSession();
    return session.data.session !== null;
  }

  private async loadProfileDetails(): Promise<ProfileResponse | null> {
    const user = await this.supabaseClient.auth.getUser();
    if (!user.data.user) {
      return null;
    }

    const response = await this.supabaseClient.from("profiles").select().eq("user_id", user.data.user?.id);
    const foundProfile = response.data?.at(0);
    const profileImageBase64 = await this.getProfileImageBase64(user.data.user.id);

    return {
      user_id: foundProfile.user_id,
      user_name: foundProfile.user_name,
      profileImageUrl: profileImageBase64,
    } as ProfileResponse;
  }

  private async createProfile(response: AuthResponse, name: string) {
    const user = response.data.user;
    if (!user) {
      return;
    }

    const profileRequest: ProfileRequest = {
      user_id: user.id,
      user_name: name,
    };
    await this.supabaseClient.from("profiles").insert(profileRequest);
  }

  private async imageToBase64(file: Blob) {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ""));
    return `data:image/png;base64, ${base64}`;
  }
}
