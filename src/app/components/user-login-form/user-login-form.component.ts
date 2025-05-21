import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-user-login-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-login-form.component.html',
  styleUrl: './user-login-form.component.css'
})
export class UserLoginFormComponent {
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  
  loading = false;
  errorMessage: string | null = null;
  
  credentials = {
    email: '',
    password: ''
  };
  
  async login() {
    this.loading = true;
    this.errorMessage = null;
    
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Bitte gib E-Mail und Passwort ein';
      this.loading = false;
      return;
    }
    
    try {
      const { error } = await this.supabaseService.supabaseClient!.auth.signInWithPassword({
        email: this.credentials.email,
        password: this.credentials.password,
      });
      
      if (error) {
        this.errorMessage = error.message || 'Fehler bei der Anmeldung';
      } else {
        // Erfolgreich angemeldet, weiterleiten zum Dashboard
        this.router.navigate(['/dashboard']);
      }
    } catch (err) {
      console.error('Login error:', err);
      this.errorMessage = 'Ein unerwarteter Fehler ist aufgetreten';
    } finally {
      this.loading = false;
    }
  }
  
  // Schnellanmeldung für Demo-Zwecke
  async loginWithDemo() {
    this.credentials.email = 'demo@linkup.de';
    this.credentials.password = 'demo123456';
    await this.login();
  }
}
