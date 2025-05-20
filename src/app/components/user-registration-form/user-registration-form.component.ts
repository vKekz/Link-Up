import { Component, signal, WritableSignal } from "@angular/core";
import { SupabaseService } from "../../../services/supabase.service";
import { UserRegistrationResponse } from "../../../contracts/user/user-registration.response";

@Component({
  selector: "app-user-registration-form",
  templateUrl: "./user-registration-form.component.html",
  styleUrl: "./user-registration-form.component.css",
})
export class UserRegistrationFormComponent {
  // Use signal to instantly update view
  protected readonly response: WritableSignal<UserRegistrationResponse | undefined>;

  private email?: string;
  private password?: string;

  constructor(protected readonly supabaseService: SupabaseService) {
    this.response = signal(undefined);
  }

  handleMailInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.email = target.value;
  }

  handlePasswordInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.password = target.value;
  }

  async registerUser() {
    if (!this.email || !this.password) {
      return;
    }

    const response = await this.supabaseService.getUserController().signUpUser(this.email, this.password);
    this.response.set(response);
  }

  handleSubmit() {
    return this.registerUser();
  }

  protected readonly JSON = JSON;
}
