import { SupabaseClient } from "@supabase/supabase-js";
import { PostResponse } from "../../contracts/post/post.response";
import { ApiController } from "../api-controller";
import { signal, WritableSignal } from "@angular/core";
import { PostRequest } from "../../contracts/post/post.request";

export class PostController extends ApiController {
  private readonly POSTS_TABLE_NAME: string = "posts";
  public readonly posts: WritableSignal<PostResponse[]> = signal([]);

  constructor(supabaseClient: SupabaseClient) {
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
    
    if (data && data[0]) {
      this.posts.update((currentPosts) => [...currentPosts, data[0] as PostResponse]);
      return data[0] as PostResponse;
    }
    
    return null;
  }

  public async deletePost(id: string) {
    const { error } = await this.supabaseClient.from(this.POSTS_TABLE_NAME).delete().eq('id', id);
    
    if (error) {
      console.error("Fehler beim Löschen des Posts:", error);
      throw error;
    }

    this.posts.update((currentPosts) => currentPosts.filter(post => post.id !== id));
  }
  
  /**
   * Lädt Posts mit Geokoordinaten innerhalb eines bestimmten Bereichs
   * @param longitude Längengrad des Zentrums
   * @param latitude Breitengrad des Zentrums
   * @param radius_meters Radius in Metern (optional, Standard: 50)
   */
  public async loadPostsByLocation(longitude: number, latitude: number, radius_meters: number = 500): Promise<PostResponse[]> {
    // PostgreSQL-Funktion ST_DWithin, um Posts innerhalb eines bestimmten Radius zu finden
    // Benötigt PostGIS-Erweiterung in Supabase
    const { data, error } = await this.supabaseClient.rpc('find_posts_within_distance', {
      center_lon: longitude,
      center_lat: latitude,
      radius_meters: radius_meters,
    });
    
    if (error) {
      console.error("Fehler beim Laden der Posts nach Standort:", error);
      return [];
    }
    
    return data as PostResponse[];
  }

  private async loadPosts() {
    const { data, error } = await this.supabaseClient.from(this.POSTS_TABLE_NAME).select();
    
    if (error) {
      console.error("Fehler beim Laden der Posts:", error);
      return;
    }
    
    this.posts.set(data as PostResponse[]);
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
