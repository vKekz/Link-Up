import {
  ActivatedRouteSnapshot,
  CanActivate,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { Injectable } from "@angular/core";
import { SupabaseService } from "../services/supabase.service";
import { ROUTE_HOME } from "../constants/route.constants";

/**
 * Represents the guard that makes sure that only signed-in users can view their dashboard.
 */
@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    const session = this.supabaseService.supabaseClient.auth.getSession();
    session.then(async (session) => {
      if (session.data.session !== null) {
        return false;
      }

      await this.router.navigate(["/", ROUTE_HOME]);
      return true;
    });

    return true;
  }
}
