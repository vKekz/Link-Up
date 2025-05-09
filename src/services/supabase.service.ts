import { Injectable } from "@angular/core";
import { AuthResponse, createClient, SupabaseClient } from "@supabase/supabase-js";
import { environment } from "../environments/environment.production";
import { GROUP_EVENTS_TABLE } from "../constants/supabase.constants";
import { GroupEvent } from "../interfaces/entities/group-event";
import { Group } from "../interfaces/entities/group";

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

  public createGroupEvent(group: GroupEvent) {
    this.supabaseClient?.from(GROUP_EVENTS_TABLE).insert(group);
  }

  public getGroupEventsByGroup(group: Group): GroupEvent[] {
    // TODO: Get by group id
    const groupId = group.id;
    const selection = this.supabaseClient?.from(GROUP_EVENTS_TABLE).select();
    return [];
  }
}
