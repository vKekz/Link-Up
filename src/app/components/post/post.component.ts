import { Component, OnInit } from "@angular/core";
import { SupabaseService } from "../../../services/supabase.service";
import { Post } from "../../../interfaces/post.model";

@Component({
  selector: "app-post",
  templateUrl: "./post.component.html",
  standalone: true,
  styleUrls: ["./post.component.css"],
})
export class PostComponent implements OnInit {
  posts: Post[] = [];

  userId = "demo-user-id";
  userAge = 16;
  errorMessage = "";

  constructor(private readonly supabaseService: SupabaseService) {}

  async ngOnInit() {
    const posts = await this.supabaseService.getPostController().getPosts();
    console.log(posts[0].id)
  }

  async addTestPost() {
    const testPost: Post = {
      title: "Testeintrag",
      description: "Dies ist ein automatisch erzeugter Testeintrag",
      tags: ["test", "demo"],
      creator_id: this.userId,
      join_policy: "open",
    };

    // const result = await this.supabaseService.getPostController().createPost(testPost);
    // if (result.error) {
    //   console.error("Fehler beim Einfügen:", result.error);
    //   return;
    // }

    // console.log("Post erfolgreich erstellt:", result.data);
  }
}
