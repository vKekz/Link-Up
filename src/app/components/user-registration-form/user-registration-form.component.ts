import { Component } from "@angular/core";
import { SupabaseService } from "../../../services/supabase.service";

@Component({
  selector: "app-user-registration-form",
  imports: [],
  templateUrl: "./user-registration-form.component.html",
  standalone: true,
  styleUrl: "./user-registration-form.component.css",
})
export class UserRegistrationFormComponent {
  private email?: string;
  private password?: string;

  constructor(protected readonly supabaseService: SupabaseService) {}

  handleMailInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.email = target.value;
    console.log(this.email);
  }

  handlePasswordInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.password = target.value;
  }

  registerUser() {}
}
