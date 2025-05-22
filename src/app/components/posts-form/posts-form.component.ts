import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { PostResponse } from '../../../contracts/post/post.response';
import { CommonModule } from '@angular/common';
import { PostComponent } from "../post/post.component";
import { PostRequest } from '../../../contracts/post/post.request';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

// Schnittstelle für die Adressvorschläge
interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

@Component({
  selector: 'app-posts-form',
  standalone: true,
  imports: [CommonModule, PostComponent, FormsModule],
  templateUrl: './posts-form.component.html',
  styleUrl: './posts-form.component.css'
})

export class PostsFormComponent implements OnInit, OnDestroy {
  public shouldShowCreationForm: boolean = false;
  public newPost: PostRequest = {};
  public tagsInput: string = '';
  
  // Adresssuche
  public addressSuggestions: AddressSuggestion[] = [];
  public isSearching: boolean = false;
  public selectedAddress: AddressSuggestion | null = null;
  
  // RxJS
  private searchTerms = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  constructor(
    private readonly subabaseService: SupabaseService,
    private readonly http: HttpClient
  ) {}
  
  ngOnInit(): void {
    // Adresssuche mit Debouncing einrichten
    this.searchTerms.pipe(
      takeUntil(this.destroy$),
      debounceTime(400), // 400ms warten nach Eingabe
      distinctUntilChanged() // Nur wenn sich der Text geändert hat
    ).subscribe(term => {
      this.performAddressSearch(term);
    });
  }
  
  ngOnDestroy(): void {
    // RxJS Subscriptions aufräumen
    this.destroy$.next();
    this.destroy$.complete();
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
      this.newPost.latitude = this.selectedAddress ? parseFloat(this.selectedAddress.lat) : undefined;
      this.newPost.longitude = this.selectedAddress ? parseFloat(this.selectedAddress.lon) : undefined;
      
      // Ausgabe der Geokoordinaten vor dem Speichern
      if (this.newPost.latitude && this.newPost.longitude) {
        console.log(`Post wird erstellt mit Geokoordinaten: Lat ${this.newPost.latitude}, Lng ${this.newPost.longitude}`);
      } else {
        console.log('Post wird ohne Geokoordinaten erstellt');
      }
      
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
      open_to_join: false,
      latitude: undefined,
      longitude: undefined
    };
    this.tagsInput = '';
    this.selectedAddress = null;
  }

  protected getPosts(): PostResponse[] {
    return this.subabaseService.getPostController().posts();
  }
  protected readonly JSON = JSON;
    /**
   * Gibt den Suchbegriff an das RxJS Subject weiter
   * @param searchText Der Suchtext für die Adresse
   */
  public searchAddress(searchText: string): void {
    this.searchTerms.next(searchText);
  }
  
  /**
   * Führt die tatsächliche Adresssuche durch
   * @param searchText Der Suchtext für die Adresse
   */
  private performAddressSearch(searchText: string): void {
    // Wenn der Suchtext leer ist oder weniger als 3 Zeichen hat, zeige keine Vorschläge
    if (!searchText || searchText.length < 3) {
      this.addressSuggestions = [];
      return;
    }
    
    // Suchstatus setzen
    this.isSearching = true;
    
    // Nominatim API für die Adresssuche verwenden (OpenStreetMap)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchText)}&format=json&addressdetails=1&limit=5`;
    
    this.http.get<AddressSuggestion[]>(url).subscribe({
      next: (results) => {
        this.addressSuggestions = results;
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Fehler bei der Adresssuche:', error);
        this.addressSuggestions = [];
        this.isSearching = false;
      }
    });
  }
    /**
   * Wählt einen Adressvorschlag aus und setzt ihn als Standort
   * @param suggestion Der ausgewählte Adressvorschlag
   */
  public selectAddress(suggestion: AddressSuggestion): void {
    this.selectedAddress = suggestion;
    this.newPost.location = suggestion.display_name;
    
    // Koordinaten speichern
    this.newPost.latitude = parseFloat(suggestion.lat);
    this.newPost.longitude = parseFloat(suggestion.lon);
    
    console.log(`Adresse ausgewählt: ${suggestion.display_name}`);
    console.log(`Geokoordinaten: Lat ${this.newPost.latitude}, Lng ${this.newPost.longitude}`);
    
    this.addressSuggestions = []; // Vorschläge ausblenden
  }
}
