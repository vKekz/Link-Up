import { Component, computed } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { PostResponse } from '../../../contracts/post/post.response';
import { NgClass, NgFor } from '@angular/common';
import { PostComponent } from "../post/post.component";
import { FormsModule } from '@angular/forms';
import { PostRequest } from '../../../contracts/post/post.request';

@Component({
  selector: 'app-posts-form',
  imports: [NgFor, NgClass, PostComponent, FormsModule],
  templateUrl: './posts-form.component.html',
  styleUrl: './posts-form.component.css'
})
export class PostsFormComponent {
  public shouldShowCreationForm: boolean = false;
  public hasTriedSubmit: boolean = false;
  public newPost: PostRequest = {
      title: "",
      date: new Date(Date.now()),
      creator_id: "",
  };
  public tagsInput: string = '';

  constructor(private readonly subabaseService: SupabaseService) {
  }

  protected toggleForm() {
    this.shouldShowCreationForm = !this.shouldShowCreationForm;
  }

  protected async createPost() {
    this.hasTriedSubmit = true;
    if (!this.newPost.title || !this.newPost.location || !this.tagsInput || !this.newPost.date) {
      return;
    }

     await this.subabaseService.getUserController().signInUser("test@test.com", "test@test.com");
      const user = await this.subabaseService.supabaseClient?.auth.getUser();
      const userId = user?.data.user?.id;
      if (!userId) {
        return;
      }

      this.newPost.creator_id = userId;
      let tags = this.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      console.log(this.newPost);

      await this.subabaseService.getPostController().createPost({
        ...this.newPost,
        tags
      });

      this.resetForm();
      this.shouldShowCreationForm = false;
  }

private resetForm() {
    this.newPost = {
      creator_id: "",
      date: new Date(Date.now()),
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
