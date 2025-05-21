import { Component } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { PostResponse } from '../../../contracts/post/post.response';
import { NgFor } from '@angular/common';
import { PostComponent } from "../post/post.component";

@Component({
  selector: 'app-posts-form',
  imports: [NgFor, PostComponent],
  templateUrl: './posts-form.component.html',
  styleUrl: './posts-form.component.css'
})
export class PostsFormComponent {
  public shouldShowCreationForm: boolean = false;

  constructor(private readonly subabaseService: SupabaseService) {
  }

  // TODO: Form wenn button, Daten kriegen

  protected toggleForm() {
    this.shouldShowCreationForm = !this.shouldShowCreationForm;
  }

  protected createPost() {
    // Only when authenticated
    this.subabaseService.getPostController().createPost({
        title: "Test",
        tags: ["T"],
        location: "Test",
        open_to_join: true,
    });
  }

  protected getPosts(): PostResponse[] {
    return this.subabaseService.getPostController().posts();
  }

  protected readonly JSON = JSON;
}
