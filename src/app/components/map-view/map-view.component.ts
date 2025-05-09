
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css']
})
export class MapViewComponent {  
  openForm = false;

  handleEventCreated(eventData: any) {
    console.log('Event erstellt:', eventData);
    this.openForm = false;
  }
}
