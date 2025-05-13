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

  handleSubmit() {
    this.registerUser();
  }

  registerUser() {
    if (!this.email || !this.password) {
      return;
    }

    console.log(this.supabaseService.getUserController().signUpUser(this.email, this.password));
  }
}
