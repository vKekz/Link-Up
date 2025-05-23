import { Injectable } from "@angular/core";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { environment } from "../environments/environment.production";
import { ControllerNotInitializedException } from "../exceptions/controller-not-initialized.exception";
import { UserController } from "../controllers/user/user.controller";
import { PostController } from "../controllers/post/post.controller";
import { PostController } from "../controllers/post/post.controller";

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
  private readonly postController?: PostController;
  private readonly postController?: PostController;

  constructor() {
    if (this.supabaseClient) {
      return;
    }

    this.supabaseClient = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.userController = new UserController(this.supabaseClient);
    this.postController = new PostController(this.supabaseClient);
    this.postController = new PostController(this.supabaseClient);
  }
  public getUserController(): UserController {
    if (!this.userController) {
      throw new ControllerNotInitializedException(`${UserController.name} not initialized`);
    }

    return this.userController;
  }

  public getPostController(): PostController {
    if (!this.postController) {
      throw new ControllerNotInitializedException(`${PostController.name} not initialized`);
    }

    return this.postController;
  }
  
  public getPostController(): PostController {
    if (!this.postController) {
      throw new ControllerNotInitializedException(`${PostController.name} not initialized`);
    }

    return this.postController;
  }
}
