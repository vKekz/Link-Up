import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { Post } from '../../../interfaces/post.model';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  posts: Post[] = [];

  newPost: Post = {
    title: 'Testeintrag',
    description: 'Dies ist ein Testeintrag aus Angular',
    tags: ['test', 'angular'],
    creator_id: 'demo-user-id',
    join_policy: 'open'
  };

  userId = 'demo-user-id';
  userAge = 16;
  errorMessage = '';

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  async loadPosts() {
    try {
      const result = await this.supabaseService.getPosts();
      if (result.error) {
        console.error('Fehler beim Laden:', result.error);
        this.errorMessage = 'Beiträge konnten nicht geladen werden.';
        return;
      }
      this.posts = result.data || [];
    } catch (err) {
      console.error('Unerwarteter Fehler:', err);
      this.errorMessage = 'Ein unerwarteter Fehler ist aufgetreten.';
    }
  }

  async addTestPost() {
    const testPost: Post = {
      title: 'Testeintrag',
      description: 'Dies ist ein automatisch erzeugter Testeintrag',
      tags: ['test', 'demo'],
      creator_id: this.userId,
      join_policy: 'open'
    };

    const result = await this.supabaseService.createPost(testPost);
    if (result.error) {
      console.error('Fehler beim Einfügen:', result.error);
      return;
    }

    console.log('Post erfolgreich erstellt:', result.data);
    await this.loadPosts(); // aktualisiere die Liste
  }

}
