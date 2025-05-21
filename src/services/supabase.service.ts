import { Injectable } from "@angular/core";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { environment } from "../environments/environment.production";
import { ControllerNotInitializedException } from "../exceptions/controller-not-initialized.exception";
import { UserController } from "../controllers/user/user.controller";
import { GroupController } from "../controllers/group/group.controller";

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
  public readonly supabaseClient?: SupabaseClient;
  private readonly userController?: UserController;
  private readonly groupController?: GroupController;

  constructor() {
    if (this.supabaseClient) {
      return;
    }

    this.supabaseClient = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.userController = new UserController(this.supabaseClient);
    this.groupController = new GroupController(this.supabaseClient);
  }

  public getUserController(): UserController {
    if (!this.userController) {
      throw new ControllerNotInitializedException(`${UserController.name} not initialized`);
    }

    return this.userController;
  }

  public getGroupController(): GroupController {
    if (!this.groupController) {
      throw new ControllerNotInitializedException(`${GroupController.name} not initialized`);
    }

    return this.groupController;
  }
}
