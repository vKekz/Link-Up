import { Component, ElementRef, ViewChild } from "@angular/core";
import { SupabaseService } from "../../../services/supabase.service";
import { Router } from "@angular/router";
import { ROUTE_MAP } from "../../../constants/route.constants";

@Component({
  selector: "app-user-settings",
  templateUrl: "./user-settings.component.html",
  styleUrl: "./user-settings.component.css",
  standalone: true,
  imports: [],
})
export class UserSettingsComponent {
  @ViewChild("imageInput")
  public imageInput?: ElementRef;

  @ViewChild("nameInput")
  public nameInput?: ElementRef;

  constructor(
    protected readonly supabaseService: SupabaseService,
    private readonly router: Router
  ) {}

  protected async handleSubmit() {
    await this.handleUserNameChange();
    await this.handleImageUpload();
  }

  protected async handleSignOut() {
    await this.supabaseService.getUserController().signOut();
    await this.router.navigate(["/"]);
  }

  protected getProfileDetails() {
    return this.supabaseService.getUserController().profileDetails();
  }

  private async handleUserNameChange() {
    const input = this.nameInput?.nativeElement as HTMLInputElement;
    const name = input.value;

    console.log(name);

    if (!name) {
      return;
    }

    await this.supabaseService.getUserController().changeUserName(name);
  }

  private async handleImageUpload() {
    const input = this.imageInput?.nativeElement as HTMLInputElement;
    const files = input.files;
    if (!files || files.length == 0) {
      return;
    }

    const file = files[0];
    if (file.size == 0) {
      return;
    }

    await this.supabaseService.getUserController().uploadProfileImage(file);
  }

  protected readonly ROUTE_DASHBOARD = ROUTE_MAP;
}
