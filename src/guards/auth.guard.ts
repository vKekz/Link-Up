import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { SupabaseService } from "../services/supabase.service";
import { of } from "rxjs";

export function authGuard(): CanActivateFn {
  return () => {
    const supabaseService = inject(SupabaseService);
    const session = supabaseService.supabaseClient.auth.getSession();

    session.then((session) => {
      if (session.data.session) {
        return of(true);
      }

      const router = inject(Router);
      router.navigate(["/dashboard"]);

      return of(false);
    });

    return of(false);
  };
}
