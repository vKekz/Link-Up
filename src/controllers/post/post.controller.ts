import { SupabaseClient } from "@supabase/supabase-js";
import { PostResponse } from "../../contracts/post/post.response";
import { ApiController } from "../api-controller";
import { signal, WritableSignal } from "@angular/core";
import { PostRequest } from "../../contracts/post/post.request";
import { UserController } from "../user/user.controller";

export class PostController extends ApiController {
  private readonly POSTS_TABLE_NAME: string = "posts";
  public readonly posts: WritableSignal<PostResponse[]> = signal([]);

  constructor(
    supabaseClient: SupabaseClient,
    private readonly userController: UserController
  ) {
    super(supabaseClient);
    this.loadPosts();
  }


  public async createPost(postRequest: PostRequest & {geo_location?: string}) {
    //replace longitude and latitude with point
    if (postRequest.longitude && postRequest.latitude) {
      postRequest.geo_location = `POINT(${postRequest.longitude} ${postRequest.latitude})`;
      delete postRequest.longitude;
      delete postRequest.latitude;
    }
    const { data, error } = await this.supabaseClient.from(this.POSTS_TABLE_NAME).insert(postRequest).select();

    if (error) {
      console.error("Fehler beim Erstellen des Posts:", error);
      throw error;
    }

    const createdPost = data[0] as PostResponse;
    if (data && createdPost) {
      const profile = await this.userController.getProfileById(createdPost.creator_id);
      if (profile) {
        createdPost.creator_profile = profile;
      }
      this.posts.update((currentPosts) => [...currentPosts, createdPost]);
      return createdPost;
    }

    return null;
  }

  public async deletePost(id: string) {
    const { error } = await this.supabaseClient.from(this.POSTS_TABLE_NAME).delete().eq("id", id);

    if (error) {
      console.error("Fehler beim Löschen des Posts:", error);
      throw error;
    }

    this.posts.update((currentPosts) => currentPosts.filter((post) => post.id !== id));
  }

  public async joinPostChat(postId: string) {
    const userId = this.userController.profileDetails()?.user_id;
    if (!userId) {
      return;
    }

    await this.supabaseClient.from("post_participants").insert({
      post_id: postId,
      user_id: userId,
    });
  }

  public async hasJoinedPostChat(postId: string) {
    const userId = this.userController.profileDetails()?.user_id;
    if (!userId) {
      return false;
    }

    console.log(userId);

    const result = await this.supabaseClient
      .from("post_participants")
      .select()
      .eq("post_id", postId)
      .eq("user_id", userId);
    if (!result.data) {
      return false;
    }

    return result.data?.length > 0;
  }

  /**
   * Lädt Posts mit Geokoordinaten innerhalb eines bestimmten Bereichs
   * @param longitude Längengrad des Zentrums
   * @param latitude Breitengrad des Zentrums
   * @param radius_meters Radius in Metern (optional, Standard: 50)
   */
  public async loadPostsByLocation(
    longitude: number,
    latitude: number,
    radius_meters: number = 500
  ): Promise<PostResponse[]> {
    // PostgreSQL-Funktion ST_DWithin, um Posts innerhalb eines bestimmten Radius zu finden
    // Benötigt PostGIS-Erweiterung in Supabase
    console.log(`Lade Posts in einem Radius von ${radius_meters} Metern um (${longitude}, ${latitude})`);
    const { data, error } = await this.supabaseClient.rpc('nearby_posts', {
      longitude,
      latitude,

      radius_meters,
    });

    if (error) {
      console.error("Fehler beim Laden der Posts nach Standort:", error);
      return [];
    }

    return data as PostResponse[];
  }
  public async loadPostById(id: string): Promise<PostResponse | null> {
    const { data, error } = await this.supabaseClient.from(this.POSTS_TABLE_NAME).select().eq('id', id).single();

    if (error) {
      console.error("Fehler beim Laden des Posts:", error);
      return null;
    }

    return data as PostResponse;


  }
  private async loadPosts() {
    const { data, error } = await this.supabaseClient.from(this.POSTS_TABLE_NAME).select();

    if (error) {
      console.error("Fehler beim Laden der Posts:", error);
      return;
    }

    const posts = data as PostResponse[];
    for (const post of posts) {
      const profile = await this.userController.getProfileById(post.creator_id);
      if (!profile) {
        continue;
      }

      post.creator_profile = profile;
    }

    this.posts.set(posts);
  }

  /**
   * Extrahiert Longitude und Latitude aus einem POINT-String
   * @param pointStr String im Format "POINT(longitude latitude)"
   * @returns Object mit longitude und latitude oder null bei Fehler
   */
  // public static extractCoordinatesFromPoint(pointStr?: string): { longitude: number, latitude: number } | null {
  //   if (!pointStr || !pointStr.startsWith('POINT(') || !pointStr.endsWith(')')) {
  //     return null;
  //   }

  //   try {
  //     const coordsStr = pointStr.substring(6, pointStr.length - 1);
  //     const [longitude, latitude] = coordsStr.split(' ').map(parseFloat);

  //     if (isNaN(longitude) || isNaN(latitude)) {
  //       return null;
  //     }

  //     return { longitude, latitude };
  //   } catch (error) {
  //     console.error("Fehler beim Extrahieren der Koordinaten:", error);
  //     return null;
  //   }
  // }
}
