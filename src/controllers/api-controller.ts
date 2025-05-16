import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Represents the controller base class that is used to communicate with the Supabase API.
 */
export abstract class ApiController {
  public readonly supabaseClient: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabaseClient = supabaseClient;
  }
}
