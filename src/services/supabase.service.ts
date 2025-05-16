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

  public async createGroupEvent(groupEvent: GroupEvent): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error("Supabase client not initialized");
    }

    const { error } = await this.supabaseClient
      .from(GROUP_EVENTS_TABLE)
      .insert(groupEvent);

    if (error) {
      throw new Error(`Failed to create group event: ${error.message}`);
    }
  }

  public async getGroupEventsByGroup(group: Group): Promise<GroupEvent[]> {
    if (!this.supabaseClient) {
      throw new Error("Supabase client not initialized");
    }

   const { data, error } = await this.supabaseClient
      .from(GROUP_EVENTS_TABLE)
      .select('*')
      .eq('group_id', group.id);

    if (error) {
      throw new Error(`Failed to fetch group events: ${error.message}`);
    }

    return data as GroupEvent[];
  }
  
}
