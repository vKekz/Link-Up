import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { Group } from '../../types/group.type';
import { Router } from '@angular/router';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css'
})
export class GroupsComponent implements OnInit {
  // Services einbinden
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  // Daten für die Komponente
  groups: Group[] = [];
  filteredGroups: Group[] = [];
  loading = true;
  error: string | null = null;
  searchQuery: string = '';
  
  // Formular für neue Gruppe
  newGroup = {
    name: '',
    description: '',
    image: ''
  };
  showNewGroupForm = false;
  formSubmitting = false;
  
  // Aktuelle Benutzer-ID (normalerweise von einem Auth-Service)
  private currentUserId: string | null = null;

  ngOnInit(): void {
    // In einer vollständigen App würde dies von einem Auth-Service kommen
    // Für dieses Beispiel setzen wir eine Test-ID oder versuchen sie aus localStorage zu holen
    this.getCurrentUserId().then(userId => {
      console.log("Get current user ID:", userId);
      if (userId) {
        this.currentUserId = userId;
        this.loadUserGroups();
      } else {
        this.error = 'Benutzer ist nicht angemeldet. Bitte melde dich an, um deine Gruppen zu sehen.';
        this.loading = false;
      }
    });
  }

  // Hilfsmethode, um die aktuelle Benutzer-ID zu erhalten
  private async getCurrentUserId(): Promise<string | null> {
    // In einer vollständigen App würde dies von einem Auth-Service kommen
    // Für jetzt versuchen wir, die ID aus dem lokalen Speicher zu holen oder eine Test-ID zu verwenden
    try {
      const { data } = await this.supabaseService.supabaseClient!.auth.getSession();
      return data.session?.user.id || null;
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzer-ID:', error);
      return null;
    }
  }
  // Lädt die Gruppen des aktuellen Benutzers
  async loadUserGroups(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      if (!this.currentUserId) {
        this.error = 'Keine Benutzer-ID verfügbar';
        this.loading = false;
        return;
      }

      const { groups, error } = await this.supabaseService.getGroupController().getUserGroups(this.currentUserId);
      
      if (error) {
        this.error = `Fehler beim Laden der Gruppen: ${error}`;
      } else {
        // Erweitere die Gruppen mit zusätzlichen UI-bezogenen Daten
        this.groups = groups.map(group => ({
          ...group,
          member_count: group.members ? group.members.length : 1,
          tags: this.generateRandomTags(group), // In einer echten App würden diese aus der Datenbank stammen
          location: this.getRandomLocation(), // In einer echten App würde dies aus der Gruppe kommen
          last_activity: this.getRandomRecentDate() // In einer echten App würde dies aus echten Aktivitätsdaten kommen
        }));
        
        // Filtere die Gruppen basierend auf der aktuellen Suche
        this.filterGroups();
      }
    } catch (err) {
      this.error = `Unerwarteter Fehler: ${err instanceof Error ? err.message : String(err)}`;
    } finally {
      this.loading = false;
    }
  }
  
  // Hilfsmethoden für Demo-Daten (in einer echten App würden diese Daten aus der Datenbank kommen)
  private generateRandomTags(group: Group): string[] {
    const allTags = [
      'Sport', 'Kultur', 'Musik', 'Reisen', 'Kochen', 'Sprachen', 'Technologie',
      'Gaming', 'Nachhaltigkeit', 'Politik', 'Bildung', 'Gesundheit'
    ];
    
    // Wähle 0-3 zufällige Tags aus
    const numTags = Math.floor(Math.random() * 4);
    const tags: string[] = [];
    
    // Füge einen Tag basierend auf dem Gruppennamen hinzu, falls möglich
    const nameWords = group.name.toLowerCase().split(' ');
    for (const tag of allTags) {
      if (nameWords.some(word => tag.toLowerCase().includes(word) || word.includes(tag.toLowerCase()))) {
        tags.push(tag);
        break;
      }
    }
    
    // Fülle mit zufälligen Tags auf
    while (tags.length < numTags) {
      const randomTag = allTags[Math.floor(Math.random() * allTags.length)];
      if (!tags.includes(randomTag)) {
        tags.push(randomTag);
      }
    }
    
    return tags;
  }
  
  private getRandomLocation(): string | undefined {
    const locations = [
      'Mannheim', 'Berlin', 'München', 'Hamburg', 'Köln', 
      'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig'
    ];
    
    // 30% Chance, keinen Standort zu haben
    if (Math.random() < 0.3) {
      return undefined;
    }
    
    return locations[Math.floor(Math.random() * locations.length)];
  }
  
  private getRandomRecentDate(): string | undefined {
    // 40% Chance, kein Datum zu haben
    if (Math.random() < 0.4) {
      return undefined;
    }
    
    // Zufälliges Datum in den letzten 30 Tagen
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    return date.toISOString();
  }

  // Neue Gruppe erstellen
  async createGroup(): Promise<void> {
    if (!this.newGroup.name.trim()) {
      this.error = 'Der Gruppenname darf nicht leer sein.';
      return;
    }

    if (!this.currentUserId) {
      this.error = 'Du musst angemeldet sein, um eine Gruppe zu erstellen.';
      return;
    }

    this.formSubmitting = true;
    this.error = null;

    try {
      const { group, error } = await this.supabaseService.getGroupController()
        .createGroup(
          this.newGroup.name,
          this.newGroup.description,
          this.currentUserId
        );
      
      if (error) {
        this.error = `Fehler beim Erstellen der Gruppe: ${error}`;
      } else if (group) {
        // Gruppe zur Liste hinzufügen und Formular zurücksetzen
        this.groups.unshift(group);
        this.resetNewGroupForm();
        this.showNewGroupForm = false;
      }
    } catch (err) {
      this.error = `Unerwarteter Fehler: ${err instanceof Error ? err.message : String(err)}`;
    } finally {
      this.formSubmitting = false;
    }
  }

  // Einer vorhandenen Gruppe beitreten
  async joinGroup(groupId: number): Promise<void> {
    if (!this.currentUserId) {
      this.error = 'Du musst angemeldet sein, um einer Gruppe beizutreten.';
      return;
    }

    try {
      const { success, error } = await this.supabaseService.getGroupController()
        .joinGroup(groupId, this.currentUserId);
      
      if (error) {
        this.error = `Fehler beim Beitreten der Gruppe: ${error}`;
      } else if (success) {
        // Gruppen neu laden, um den aktualisierten Status zu erhalten
        await this.loadUserGroups();
      }
    } catch (err) {
      this.error = `Unerwarteter Fehler: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  // Eine Gruppe verlassen
  async leaveGroup(groupId: number): Promise<void> {
    if (!this.currentUserId) {
      this.error = 'Du musst angemeldet sein, um eine Gruppe zu verlassen.';
      return;
    }

    if (!confirm('Bist du sicher, dass du diese Gruppe verlassen möchtest?')) {
      return;
    }

    try {
      const { success, error } = await this.supabaseService.getGroupController()
        .leaveGroup(groupId, this.currentUserId);
      
      if (error) {
        this.error = `Fehler beim Verlassen der Gruppe: ${error}`;
      } else if (success) {
        // Gruppen neu laden, um den aktualisierten Status zu erhalten
        await this.loadUserGroups();
      }
    } catch (err) {
      this.error = `Unerwarteter Fehler: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  // Zu den Gruppendetails navigieren
  viewGroupDetails(groupId: number): void {
    this.router.navigate(['/groups', groupId]);
  }

  // Formular zum Erstellen einer neuen Gruppe zurücksetzen
  resetNewGroupForm(): void {
    this.newGroup = {
      name: '',
      description: '',
      image: ''
    };
  }

  // Hilfsfunktion zum Ermitteln, ob der aktuelle Benutzer der Ersteller einer Gruppe ist
  isGroupCreator(group: Group): boolean {
    return this.currentUserId === group.creator_id;
  }

  // Hilfsfunktion zur Formatierung des Datums
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Filtert die Gruppen basierend auf der Suchanfrage
  filterGroups(): void {
    if (!this.searchQuery.trim()) {
      this.filteredGroups = [...this.groups];
    } else {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredGroups = this.groups.filter(group => 
        group.name.toLowerCase().includes(query) || 
        (group.description && group.description.toLowerCase().includes(query))
      );
    }
  }
}
