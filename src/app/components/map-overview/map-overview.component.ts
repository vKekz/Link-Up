import { Component, AfterViewInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

export interface Marker {
  lat: number;
  lng: number;
  title: string;
  description: string;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-overview.component.html',
  styleUrls: ['./map-overview.component.css']
})
export class MapOverviewComponent implements AfterViewInit {
  private map!: L.Map;
  private markersData = signal<Marker[]>([
    { lat: 49.4738333, lng: 8.534333333333333 , title: 'DHBW Mannheim', description: 'Beschreibung Incoming' },
    { lat: 48.8566, lng: 2.3522, title: 'Paris', description: 'Capital of France' },
    { lat: 40.7128, lng: -74.006, title: 'New York', description: 'The Big Apple' }
  ]);
  
  @Output() markerClicked = new EventEmitter<string>();

  ngAfterViewInit(): void {
    this.initMap();
    this.addMarkers();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [51.505, -0.09],
      zoom: 5
    });

    //Limit map to germany
    const germanyBounds = L.latLngBounds(
      L.latLng(47.2701, 5.8663),  // Southwest corner
      L.latLng(55.0992, 15.0419)  // Northeast corner
    );
    
    this.map.setMaxBounds(germanyBounds);
    this.map.on('drag', () => {
      this.map.panInsideBounds(germanyBounds, { animate: true });
    });
    this.map.options.minZoom = 5;
    // this.map.options.maxZoom = 10;


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  private addMarkers(): void {
     const customIcon = L.icon({
       iconUrl: 'assets/marker-icon-2x.png',
       iconSize: [26, 35],
       //iconAnchor half width and height of icon
       iconAnchor: [13, 35],
       popupAnchor: [1, -34],
       shadowUrl: 'assets/marker-shadow.png',
       shadowSize: [41, 41]
     });
  
     this.markersData().forEach(marker => {
       const leafletMarker = L.marker([marker.lat, marker.lng], { icon: customIcon })
         .addTo(this.map);
      
       leafletMarker.bindPopup(`
         <div class="marker-popup">
           <h3>${marker.title}</h3>
           <p>${marker.description}</p>
           <button class="btn-details" data-marker-title="${marker.title}">
             More Details
           </button>
         </div>
       `);
    
       // Handle popup open to register click events on the button
       leafletMarker.on('popupopen', () => {
         setTimeout(() => {
           const popupContent = leafletMarker.getPopup()?.getElement();
           const detailButton = popupContent?.querySelector('.btn-details');
        
           if (detailButton) {
             detailButton.addEventListener('click', () => {
               const title = detailButton.getAttribute('data-marker-title');
               if (title) {
                 this.markerClicked.emit(title);
               }
             }, { once: true });
           }
         }, 0);
       });
     });
  }
  
  public addNewMarker(marker: Marker): void {
    const updatedMarkers = [...this.markersData(), marker];
    this.markersData.set(updatedMarkers);
    
    const customIcon = L.icon({
      iconUrl: 'assets/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'assets/marker-shadow.png',
      shadowSize: [41, 41]
    });
    
    const leafletMarker = L.marker([marker.lat, marker.lng], { icon: customIcon })
      .addTo(this.map);
      
    leafletMarker.bindPopup(`
      <div class="marker-popup">
        <h3>${marker.title}</h3>
        <p>${marker.description}</p>
        <button class="btn-details" data-marker-title="${marker.title}">
          More Details
        </button>
      </div>
    `);
    
    leafletMarker.on('popupopen', () => {
      setTimeout(() => {
        const popupContent = leafletMarker.getPopup()?.getElement();
        const detailButton = popupContent?.querySelector('.btn-details');
        
        if (detailButton) {
          detailButton.addEventListener('click', () => {
            const title = detailButton.getAttribute('data-marker-title');
            if (title) {
              this.markerClicked.emit(title);
            }
          }, { once: true });
        }
      }, 0);
    });
    
    // Fly to the new marker
    this.map.flyTo([marker.lat, marker.lng], 10);
  }
  
  public focusMarker(title: string): void {
    const marker = this.markersData().find(m => m.title === title);
    if (marker) {
      this.map.flyTo([marker.lat, marker.lng], 10);
    }
  }
  
  public getMarkers(): Marker[] {
    return this.markersData();
  }
}