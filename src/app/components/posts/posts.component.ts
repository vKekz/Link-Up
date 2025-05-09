import { Component } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';


interface Group {
  name: string;
  creatorName: string;
  creatorAvatar: string;
  memberCount: number;
}

@Component({
  selector: 'app-posts',
  imports: [],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css'
})



export class PostsComponent {

  constructor(protected readonly supabaseService: SupabaseService) {}
    
    event = {
    title: '',
    tags: '',
    street: '',
    description: ''
  };

  groups: Group[] = [
    {
      name: 'Sportgruppe',
      creatorName: 'Max',
      creatorAvatar: 'https://via.placeholder.com/30',
      memberCount: 12
    },
    {
      name: 'Kochfreunde',
      creatorName: 'Anna',
      creatorAvatar: 'https://via.placeholder.com/30',
      memberCount: 8
    }
  ];

  createEvent() {
  const newEvent = { ...this.event };

  // Step 1: Create Event (could also be saved via API later)
  console.log('Event erstellt:', newEvent);

  // Step 2: Create matching group
  const newGroup: Group = {
    name: newEvent.title,
    creatorName: 'Aktueller Benutzer', // Replace with real user data if available
    creatorAvatar: 'https://via.placeholder.com/30',
    memberCount: 1
  };

  this.groups.unshift(newGroup); // add to top of group list

  // Step 3: Notify the user
  alert(`Event "${newEvent.title}" wurde erstellt – Gruppe "${newGroup.name}" wurde ebenfalls angelegt.`);

  // Step 4: Clear form
  this.event = { title: '', tags: '', street: '', description: '' };
}
}
