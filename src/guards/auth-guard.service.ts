import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
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

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    const isLoggedIn = await this.supabaseService.getUserController().isLoggedIn();
    return isLoggedIn ? isLoggedIn : this.router.parseUrl(ROUTE_HOME);
  }
}
