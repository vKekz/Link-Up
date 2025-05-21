import { Component, inject, signal } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from "../../../services/supabase.service";

@Component({
  selector: "app-user-registration-form",
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./user-registration-form.component.html",
  standalone: true,
  styleUrl: "./user-registration-form.component.css",
})
export class UserRegistrationFormComponent {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  
  // Form Model
  user = {
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: ''
  };
  
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  response = signal<any>(null);
  
  /**
   * Registriert einen neuen Benutzer
   */
  async register() {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;
    
    // Validierung
    if (!this.user.email || !this.user.password) {
      this.errorMessage = 'Bitte gib E-Mail und Passwort ein';
      this.loading = false;
      return;
    }
    
    if (this.user.password !== this.user.confirmPassword) {
      this.errorMessage = 'Die Passwörter stimmen nicht überein';
      this.loading = false;
      return;
    }
    
    if (this.user.password.length < 6) {
      this.errorMessage = 'Das Passwort muss mindestens 6 Zeichen lang sein';
      this.loading = false;
      return;
    }
    
    try {
      // Benutzer registrieren
      const { data, error } = await this.supabaseService.supabaseClient!.auth.signUp({
        email: this.user.email,
        password: this.user.password,
        options: {
          data: {
            full_name: this.user.fullName,
            username: this.user.username || null
          }
        }
      });
      
      if (error) {
        this.errorMessage = error.message || 'Fehler bei der Registrierung';
      } else {
        // Profil erstellen
        if (data?.user) {
          const { error: profileError } = await this.supabaseService.supabaseClient!
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                username: this.user.username || null,
                full_name: this.user.fullName || null,
                updated_at: new Date()
              }
            ]);
          
          if (profileError) {
            console.error('Fehler beim Erstellen des Profils:', profileError);
          }
        }
        
        this.successMessage = 'Registrierung erfolgreich! Bitte überprüfe deine E-Mails, um deine Adresse zu bestätigen.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      this.errorMessage = 'Ein unerwarteter Fehler ist aufgetreten';
    } finally {
      this.loading = false;
    }
  }

  async registerUser() {
    if (!this.user.email || !this.user.password) {
      return;
    }

    const response = await this.supabaseService.getUserController().signUpUser(this.user.email, this.user.password);
    this.response.set(response);
  }

  handleSubmit() {
    return this.registerUser();
  }

  protected readonly JSON = JSON;
}
