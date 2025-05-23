import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Injectable } from "@angular/core";
import { SupabaseService } from "../services/supabase.service";
import { ROUTE_DASHBOARD } from "../constants/route.constants";

/**
 * Represents the guard that makes sure that signed-in users cannot log in or register again.
 */
@Injectable({
  providedIn: "root",
})
export class SessionGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly router: Router
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    const isLoggedIn = await this.supabaseService.getUserController().isLoggedIn();
    return isLoggedIn ? this.router.parseUrl(ROUTE_DASHBOARD) : true;
  }
}
