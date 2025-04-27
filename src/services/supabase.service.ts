import { Injectable } from "@angular/core";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { environment } from "../environments/environment.production";

@Injectable({
  providedIn: "root",
})
export class SupabaseService {
  private readonly supabaseClient: SupabaseClient;

  constructor() {
    this.supabaseClient = createClient(environment.supabaseUrl, environment.supabaseKey);
  }
}
