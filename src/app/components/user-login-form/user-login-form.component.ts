import { Component } from "@angular/core";
import { SupabaseService } from "../../../services/supabase.service";

@Component({
  selector: "app-user-login-form",
  imports: [],
  templateUrl: "./user-login-form.component.html",
  styleUrl: "./user-login-form.component.css",
})
export class UserLoginFormComponent {
  constructor(private readonly supabaseService: SupabaseService) {}
}
