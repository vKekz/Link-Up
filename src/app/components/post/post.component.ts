import { Component, Input } from "@angular/core";
import { PostResponse } from "../../../contracts/post/post.response";
import { SupabaseService } from "../../../services/supabase.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-post",
  imports: [CommonModule],
  templateUrl: "./post.component.html",
  styleUrl: "./post.component.css",
})
export class PostComponent {
  @Input()
  public post?: PostResponse;

  protected randomBackgroundUrl: string = "";

  constructor(private readonly subabaseService: SupabaseService) {
    this.setRandomBackground();
  }

  protected async deletePost() {
    if (!this.post) {
      return;
    }

    const id = this.post.id;
    await this.subabaseService.getPostController().deletePost(id);
  }

  private setRandomBackground(): void {
    const min = 1;
    const max = 10;
    const randomIndex = Math.floor(Math.random() * (max - min + 1)) + min;
    this.randomBackgroundUrl = `../../../assets/event-backgrounds/background${randomIndex}.jpg`;
  }

  get eventStatusText(): string {
    return this.post?.open_to_join ? "Öffentlich beiträtbar" : "Geschlossen";
  }

  get eventStatusClass(): string {
    return this.post?.open_to_join ? "status-open" : "status-closed";
  }
}
