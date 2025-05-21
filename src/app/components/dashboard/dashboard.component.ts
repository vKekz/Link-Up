import { Component, signal } from '@angular/core';
import { MapOverviewComponent } from "../map-overview/map-overview.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MapOverviewComponent, SidebarComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  // Signal für den aktuell ausgewählten Marker
  selectedMarker = signal<string | null>(null);
  
  // Handler für Marker-Klick-Events
  handleMarkerClick(markerTitle: string): void {
    this.selectedMarker.set(markerTitle);
    console.log(`Dashboard: Marker ausgewählt: ${markerTitle}`);
    // Hier könnte später die Detailansicht für den ausgewählten Marker geladen werden
  }
}
