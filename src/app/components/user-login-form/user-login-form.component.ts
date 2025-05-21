import { Component, signal, WritableSignal } from "@angular/core";
import { SupabaseService } from "../../../services/supabase.service";
import { UserLoginResponse } from "../../../contracts/user/user-login.response";
import { Router } from "@angular/router";
import { ROUTE_DASHBOARD } from "../../../constants/route.constants";

@Component({
  selector: "app-user-login-form",
  imports: [],
  templateUrl: "./user-login-form.component.html",
  styleUrl: "./user-login-form.component.css",
})
export class UserLoginFormComponent {
  // Use signal to instantly update view
  protected readonly response: WritableSignal<UserLoginResponse | undefined>;

  protected email?: string;
  protected password?: string;
  protected hasTriedSubmit: boolean = false;

  constructor(
    protected readonly supabaseService: SupabaseService,
    private readonly router: Router
  ) {
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

  async loginUser() {
    if (!this.email || !this.password) {
      return;
    }

    const response = await this.supabaseService.getUserController().signInUser(this.email, this.password);
    if (!response.error) {
      await this.router.navigate(["/", ROUTE_DASHBOARD]);
      return;
    }

    this.response.set(response);
  }

  handleSubmit() {
    this.hasTriedSubmit = true;
    return this.loginUser();
  }
}
