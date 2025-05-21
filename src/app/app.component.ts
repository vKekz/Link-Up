import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { SupabaseService } from "../services/supabase.service";

@Component({
  selector: "app-root",
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
  standalone: true,
})
export class AppComponent implements OnInit {
  // Services
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  // App state
  title = "Link-Up";
  isLoggedIn = false;
  showUserMenu = false;
  username = "Benutzer";
  userEmail = "user@example.com";
  
  ngOnInit() {
    // Überprüfen Sie, ob ein Benutzer angemeldet ist
    this.checkAuthStatus();
  }

  /**
   * Prüft den Authentifizierungsstatus des Benutzers
   */
  async checkAuthStatus(): Promise<void> {
    try {
      const { data } = await this.supabaseService.supabaseClient!.auth.getSession();
      this.isLoggedIn = !!data.session;
      
      if (this.isLoggedIn && data.session?.user) {
        // Benutzerinformationen abrufen
        this.userEmail = data.session.user.email || '';
        
        // Benutzernamen abrufen (könnte aus einem Profil stammen)
        const { data: userData } = await this.supabaseService.supabaseClient!
          .from('profiles')
          .select('username, full_name')
          .eq('id', data.session.user.id)
          .single();
        
        if (userData) {
          this.username = userData.full_name || userData.username || 'Benutzer';
        }
      }
    } catch (error) {
      console.error('Fehler beim Prüfen des Auth-Status:', error);
      this.isLoggedIn = false;
    }
  }
  
  /**
   * Öffnet/schließt das Benutzermenü
   */
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }
  
  /**
   * Loggt den Benutzer aus
   */
  async logout(): Promise<void> {
    try {
      await this.supabaseService.supabaseClient!.auth.signOut();
      this.isLoggedIn = false;
      this.showUserMenu = false;
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Fehler beim Logout:', error);
    }
  }
  }

