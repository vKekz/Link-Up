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
import { ROUTE_DASHBOARD } from "../constants/route.constants";

/**
 * Represents the guard that makes sure that signed-in users cannot log in or register.
 */
@Injectable({
  providedIn: "root",
})
export class SessionGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    const session = this.supabaseService.supabaseClient.auth.getSession();
    session.then(async (session) => {
      if (session.data.session !== null) {
        await this.router.navigate(["/", ROUTE_DASHBOARD]);
        return false;
      }

      return true;
    });

    return true;
  }
}
