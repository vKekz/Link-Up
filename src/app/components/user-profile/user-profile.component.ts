import { Component, ElementRef, ViewChild } from "@angular/core";
import { SupabaseService } from "../../../services/supabase.service";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrl: "./user-profile.component.css",
  standalone: true,
})
export class UserProfileComponent {
  @ViewChild("imageInput")
  public imageInput?: ElementRef;

  @ViewChild("nameInput")
  public nameInput?: ElementRef;

  constructor(protected readonly supabaseService: SupabaseService) {}

  protected async handleSubmit() {
    await this.handleUserNameChange();
    await this.handleImageUpload();
  }

  protected getProfileDetails() {
    return this.supabaseService.getUserController().profileDetails();
  }

  private async handleUserNameChange() {
    const input = this.nameInput?.nativeElement as HTMLInputElement;
    const name = input.value;

    if (!name) {
      return;
    }

    await this.supabaseService.getUserController().changeUserName(name);
  }

  private async handleImageUpload() {
    const input = this.imageInput?.nativeElement as HTMLInputElement;
    const files = input.files;
    if (!files) {
      return;
    }

    const file = files[0];
    if (file.size == 0) {
      return;
    }

    await this.supabaseService.getUserController().uploadProfileImage(file);
  }
}
