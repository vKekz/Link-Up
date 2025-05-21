import { Component, Input } from '@angular/core';
import { PostResponse } from '../../../contracts/post/post.response';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-post',
  imports: [],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css'
})
export class PostComponent {
  @Input()
  public post?: PostResponse;

  constructor(private readonly subabaseService: SupabaseService) {

  }

  protected async deletePost() {
    if (!this.post) {
      return;
    }

    const id = this.post.id;
    await this.subabaseService.getPostController().deletePost(id);
  }

  // TODO: Stylen, Backend
}
