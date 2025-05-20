import { Injectable } from "@angular/core";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { environment } from "../environments/environment.production";
import { ControllerNotInitializedException } from "../exceptions/controller-not-initialized.exception";
import { UserController } from "../controllers/user/user.controller";

@Injectable({
  providedIn: "root",
})
/**
 * Represents the service that is used for Supabase API communication.
 *
 * See https://supabase.com/docs/reference/javascript/start
 *
 * @remarks With the following comment some issues were resolved: https://github.com/supabase/supabase-js/issues/936#issuecomment-2691252604
 */
export class SupabaseService {
  private readonly CLIENT_SESSION_KEY: string = "client";

  public readonly supabaseClient?: SupabaseClient;
  private readonly userController?: UserController;

  constructor() {
    if (this.supabaseClient) {
      return;
    }

    const cachedClient = sessionStorage.getItem(this.CLIENT_SESSION_KEY);
    if (cachedClient) {
      this.supabaseClient = JSON.parse(cachedClient) as SupabaseClient;
    } else {
      this.supabaseClient = createClient(environment.supabaseUrl, environment.supabaseKey);
    }

    this.userController = new UserController(this.supabaseClient);

    // Only save client if not cached
    if (!cachedClient) {
      sessionStorage.setItem(this.CLIENT_SESSION_KEY, JSON.stringify(this.supabaseClient));
    }
  }

  public getUserController(): UserController {
    if (!this.userController) {
      throw new ControllerNotInitializedException(`${UserController.name} not initialized`);
    }

    return this.userController;
  }
}
