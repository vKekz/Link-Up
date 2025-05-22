import { Component } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { PostResponse } from '../../../contracts/post/post.response';
import { NgFor } from '@angular/common';
import { PostComponent } from "../post/post.component";
import { PostRequest } from '../../../contracts/post/post.request';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-posts-form',
  imports: [NgFor, PostComponent, FormsModule],
  templateUrl: './posts-form.component.html',
  styleUrl: './posts-form.component.css'
})
export class PostsFormComponent {
  public shouldShowCreationForm: boolean = false;
  public newPost: PostRequest = {};
  public tagsInput: string = ''

  constructor(private readonly subabaseService: SupabaseService) {
  }

  protected toggleForm() {
    this.shouldShowCreationForm = !this.shouldShowCreationForm;
  }

  protected async createPost() {
     await this.subabaseService.getUserController().signInUser("test@test.com", "test@test.com");
      const user = await this.subabaseService.supabaseClient?.auth.getUser();
      const userId = user?.data.user?.id;

      this.newPost.creator_id = userId;

      this.newPost.tags = this.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      await this.subabaseService.getPostController().createPost(this.newPost);
      this.resetForm();
      this.shouldShowCreationForm = false;
  }

private resetForm() {
    this.newPost = {
      title: '',
      tags: [],
      location: '',
      description: '',
      open_to_join: false
    };
    this.tagsInput = '';
  }

  protected getPosts(): PostResponse[] {
    return this.subabaseService.getPostController().posts();
  }

  protected readonly JSON = JSON;
}
