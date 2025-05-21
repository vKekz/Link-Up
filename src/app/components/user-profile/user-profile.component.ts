import { Component } from "@angular/core";
import { SupabaseService } from "../../../services/supabase.service";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrl: "./user-profile.component.css",
})
export class UserProfileComponent {
  constructor(protected readonly supabaseService: SupabaseService) {}
}
