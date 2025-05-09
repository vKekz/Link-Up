import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],  // Füge RouterModule und CommonModule hier hinzu
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  // Hier könntest du die Logik für das Avatar und Benutzername einfügen
  userAvatarUrl = 'https://via.placeholder.com/50';  // Platzhalter-Avatar-URL
  userName = 'John Doe';  // Platzhalter-Name
}
