import { Component, AfterViewInit, Output, EventEmitter, signal, OnDestroy, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import * as L from "leaflet";
import { SupabaseService } from "../../../services/supabase.service";
import { PostResponse } from "../../../contracts/post/post.response";
import { PostController } from "../../../controllers/post/post.controller";

export interface Marker {
  lat: number;
  lng: number;
  title: string;
  description: string;
}

@Component({
  selector: "app-map",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./map-overview.component.html",
  styleUrls: ["./map-overview.component.css"],
})
export class MapOverviewComponent implements AfterViewInit, OnDestroy {
  private map?: L.Map;
  private markersData = signal<Marker[]>([
    { lat: 49.4738333, lng: 8.534333333333333, title: "DHBW Mannheim", description: "Beschreibung Incoming" },
    { lat: 48.8566, lng: 2.3522, title: "Paris", description: "Capital of France" },
    { lat: 40.7128, lng: -74.006, title: "New York", description: "The Big Apple" },
  ]);
  private locationMarker: L.LayerGroup | null = null;
  private postMarkers: L.Marker[] = [];
  
  // Service injizieren
  private supabaseService = inject(SupabaseService);
  
  
  
  // Status-Variablen für die Standortverfolgung
  private isLocating = false;
  private locationErrorCount = 0;
  private maxLocationErrors = 3;
  private lastLocationFound = false;

  @Output() markerClicked = new EventEmitter<string>();

  ngAfterViewInit(): void {
    console.log("NG after view init");
    this.initMap();
    this.addMarkers();

    // Zusätzliche Map-Resize-Behandlung für verschiedene Fälle
    setTimeout(() => {
      this.resizeMap();
    }, 200);

    // Bei Änderung der Fenstergröße Map neu berechnen
    window.addEventListener("resize", () => {
      this.resizeMap();
    });
  }
  
  ngOnDestroy(): void {
    console.log("NG on destroy");
    // Event-Listener für Fenstergröße entfernen
    window.removeEventListener('resize', this.resizeMap);
    
    if (this.map) {
      // Standortverfolgung stoppen
      this.map.stopLocate();
      this.map.off();
      this.map.remove();
    }
  }

  private initMap(): void {
    if (this.map) {
      return;
    }
    
    this.map = L.map("map", {
      center: [51.505, -0.09],
      zoom: 5,
    });
    
    // Wichtig: Karte invalidieren, damit sie sich an das Container-Element anpasst
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 100);

    //Limit map to germany
    const germanyBounds = L.latLngBounds(
      L.latLng(47.2701, 5.8663), // Southwest corner
      L.latLng(55.0992, 15.0419) // Northeast corner
    );

    this.map.setMaxBounds(germanyBounds);
    this.map.on("drag", () => {
      this.map?.panInsideBounds(germanyBounds, { animate: true });
    });
    this.map.options.minZoom = 5;
    // this.map.options.maxZoom = 10;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    // Standort lokalisieren und blauen Punkt anzeigen
    this.locateUser();

    // Standort-Button zur Karte hinzufügen
  }

  private addMarkers(): void {
    const customIcon = L.icon({
      iconUrl: "assets/marker-icon-2x.png",
      iconSize: [26, 35],
      //iconAnchor half width and height of icon
      iconAnchor: [13, 35],
      popupAnchor: [1, -34],
      shadowUrl: "assets/marker-shadow.png",
      shadowSize: [41, 41],
    });

    this.markersData().forEach((marker) => {
      const leafletMarker = L.marker([marker.lat, marker.lng], { icon: customIcon }).addTo(this.map!);

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
      leafletMarker.on("popupopen", () => {
        setTimeout(() => {
          const popupContent = leafletMarker.getPopup()?.getElement();
          const detailButton = popupContent?.querySelector(".btn-details");

          if (detailButton) {
            detailButton.addEventListener(
              "click",
              () => {
                const title = detailButton.getAttribute("data-marker-title");
                if (title) {
                  this.markerClicked.emit(title);
                }
              },
              { once: true }
            );
          }
        }, 0);
      });
    });
  }

  public addNewMarker(marker: Marker): void {
    const updatedMarkers = [...this.markersData(), marker];
    this.markersData.set(updatedMarkers);

    const customIcon = L.icon({
      iconUrl: "assets/marker-icon.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: "assets/marker-shadow.png",
      shadowSize: [41, 41],
    });

    const leafletMarker = L.marker([marker.lat, marker.lng], { icon: customIcon }).addTo(this.map!);

    leafletMarker.bindPopup(`
      <div class="marker-popup">
        <h3>${marker.title}</h3>
        <p>${marker.description}</p>
        <button class="btn-details" data-marker-title="${marker.title}">
          More Details
        </button>
      </div>
    `);

    leafletMarker.on("popupopen", () => {
      setTimeout(() => {
        const popupContent = leafletMarker.getPopup()?.getElement();
        const detailButton = popupContent?.querySelector(".btn-details");

        if (detailButton) {
          detailButton.addEventListener(
            "click",
            () => {
              const title = detailButton.getAttribute("data-marker-title");
              if (title) {
                this.markerClicked.emit(title);
              }
            },
            { once: true }
          );
        }
      }, 0);
    });

    // Fly to the new marker
    this.map?.flyTo([marker.lat, marker.lng], 10);
  }

  public focusMarker(title: string): void {
    const marker = this.markersData().find((m) => m.title === title);
    if (marker) {
      this.map?.flyTo([marker.lat, marker.lng], 10);
    }
  }
  
  public getMarkers(): Marker[] {
    return this.markersData();
  }
  
  // Benutzerstandort lokalisieren und anzeigen
  private locateUser(): void {
    if (!this.map) return;

    // Entferne eventuelle bestehende Lokalisierungs-Event-Handler
    this.map.off('locationfound');
    this.map.off('locationerror');

    // Entferne den bestehenden Standortmarker, falls vorhanden
    if (this.locationMarker) {
      this.map.removeLayer(this.locationMarker);
      this.locationMarker = null;
    }

    // Zeige Lade-Animation an
    this.showLocatingAnimation();

    // Standortverfolgung starten mit verbesserten Optionen
    this.isLocating = true;
    this.map.locate({ 
      setView: true, 
      maxZoom: 16, 
      watch: true,              // Kontinuierliche Aktualisierung
      enableHighAccuracy: true, // Hochpräzise Standortbestimmung aktivieren
      timeout: 10000,           // Mittlerer Timeout (10 Sekunden) pro Versuch
      maximumAge: 5000,         // Akzeptiere Standortdaten, die nicht älter als 5 Sekunden sind
    });

    // Event-Handler für gefundenen Standort
    this.map.on('locationfound', (e: L.LocationEvent) => {
      // Entferne Lade-Animation
      this.hideLocatingAnimation();
      this.lastLocationFound = true;
      this.locationErrorCount = 0;
      
      console.log('Standort gefunden:', e.latlng, 'Genauigkeit:', e.accuracy);
      
      // Entferne den bestehenden Standortmarker, falls vorhanden
      if (this.locationMarker) {
        this.map?.removeLayer(this.locationMarker);
        this.locationMarker = null;
      }

      // Radius für die Genauigkeit (accuracy) - mit sinnvoller Obergrenze
      const radius = Math.min(e.accuracy, 500); // Begrenze den Radius auf 500 Meter
      
      // LayerGroup für beide Kreise erstellen
      const locGroup = L.layerGroup();
      
      // Äußerer, transparenter Genauigkeitskreis
      L.circle(e.latlng, {
        radius: radius,
        color: 'var(--color-palette-light-teal)',
        fillColor: 'var(--color-palette-light-teal)',
        fillOpacity: 0.15,
        weight: 1
      }).addTo(locGroup);
      
      // Pulsierende Animation für den inneren Standortkreis
      const innerRadius = Math.min(radius * 0.15, 15); // Kleinerer Kreis, max 15 Meter
      
      // Innerer, dunklerer Standortkreis
      const innerCircle = L.circle(e.latlng, {
        radius: innerRadius,
        color: 'var(--color-palette-dark-teal)',
        fillColor: 'var(--color-palette-teal)',
        fillOpacity: 0.8,
        weight: 2,
        className: 'location-marker-inner' // Klasse für CSS-Animation
      }).addTo(locGroup);
      
      // LayerGroup zur Karte hinzufügen und als locationMarker speichern
      locGroup.addTo(this.map!);
      this.locationMarker = locGroup;
      
      // Update der Location Button-Anzeige, um zu zeigen, dass Standort aktiv ist
      this.updateLocationButtonState(true);
    });
    
    // Event-Handler für Fehler bei der Standortbestimmung
    this.map.on('locationerror', (e: L.ErrorEvent) => {
      this.locationErrorCount++;
      
      console.error(`Standortbestimmung fehlgeschlagen (${this.locationErrorCount}/${this.maxLocationErrors}):`, e.message);
      
      // Nur wenn wir noch keinen Standort hatten oder nach mehreren Fehlern zeigen wir eine Meldung an
      if (!this.lastLocationFound || this.locationErrorCount >= this.maxLocationErrors) {
        // Entferne Lade-Animation
        this.hideLocatingAnimation();
        
        // Visuelle Rückmeldung auf der Karte
        this.showLocationErrorMessage();
        
        // Bei mehrfachen Fehlern: Stoppe die Standortverfolgung kurz und versuche es dann erneut
        if (this.isLocating) {
          if (this.map) {
            this.map.stopLocate();
          }
          this.isLocating = false;
          
          // Versuche es nach einer Pause erneut
          setTimeout(() => {
            if (this.locationErrorCount >= this.maxLocationErrors) {
              this.locationErrorCount = 0;
            }
            this.locateUser();
          }, 5000); // Kürzere Wartezeit für bessere Benutzererfahrung
        }
        
        // Update der Location Button-Anzeige
        this.updateLocationButtonState(false);
      }
    });
  }
  
  // Hilfsmethode: Zeigt eine Ladeanimation für die Standortsuche an
  private showLocatingAnimation(): void {
    const container = L.DomUtil.get('map');
    if (!container) return;
    
    // Entferne vorhandene Animation falls vorhanden
    this.hideLocatingAnimation();
    
    // Erstelle das Lade-Element
    const loadingElement = L.DomUtil.create('div', 'location-loading-animation');
    loadingElement.id = 'locationLoadingAnimation';
    loadingElement.innerHTML = `
      <div class="location-spinner">
        <div class="spinner"></div>
        <p>Suche Standort...</p>
      </div>
    `;
    
    container.appendChild(loadingElement);
  }
  
  // Hilfsmethode: Entfernt die Ladeanimation
  private hideLocatingAnimation(): void {
    const container = L.DomUtil.get('map');
    const loadingElement = document.getElementById('locationLoadingAnimation');
    if (container && loadingElement && container.contains(loadingElement)) {
      container.removeChild(loadingElement);
    }
  }
  
  // Hilfsmethode: Zeigt eine Fehlermeldung bei Standortproblemen an
  private showLocationErrorMessage(): void {
    const container = L.DomUtil.get('map');
    if (!container) return;
    
    // Entferne vorhandene Fehlermeldung falls vorhanden
    const existingError = document.getElementById('locationErrorMessage');
    if (existingError && container.contains(existingError)) {
      container.removeChild(existingError);
    }
    
    // Erstelle die Fehlermeldung
    const errorMsg = L.DomUtil.create('div', 'location-error-message');
    errorMsg.id = 'locationErrorMessage';
    errorMsg.innerHTML = `
      <div class="error-container">
        <strong>Standortbestimmung nicht möglich</strong>
        <p>Bitte überprüfe, ob die Standortdienste aktiviert sind und du der Anwendung Zugriff erlaubt hast.</p>
      </div>
    `;
    
    container.appendChild(errorMsg);
    
    // Entferne die Nachricht nach 5 Sekunden
    setTimeout(() => {
      if (container.contains(errorMsg)) {
        container.removeChild(errorMsg);
      }
    }, 5000);
  }
  
  // Hilfsmethode: Aktualisiert den Zustand des Standort-Buttons
  private updateLocationButtonState(active: boolean): void {
    const locationButton = document.querySelector('.location-button a');
    if (locationButton) {
      if (active) {
        locationButton.classList.add('active');
      } else {
        locationButton.classList.remove('active');
      }
    }
  

  // Button zum Zentrieren auf Benutzerstandort  private addLocationButton(): void {
    if (!this.map) return;

    // Erstelle einen benutzerdefinierten Steuerungsbutton
    const locationControl = L.Control.extend({
      options: {
        position: 'bottomright'
      },

      onAdd: () => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control location-button');
        container.innerHTML = '<a href="#" title="Zeige meinen Standort"><span class="location-icon">📍</span></a>';
        
        container.onclick = () => {
          this.locateUser();
          return false;
        };
        
        return container;
      }
    });

    // Button zur Karte hinzufügen
    this.map.addControl(new locationControl());
    
    // Button zum Laden von Posts in der Nähe hinzufügen
    const loadPostsControl = L.Control.extend({
      options: {
        position: 'bottomright'
      },
      
      onAdd: () => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control posts-button');
        container.innerHTML = '<a href="#" title="Posts in der Umgebung laden"><span class="posts-icon">📋</span></a>';
        
        container.onclick = () => {
          if (this.map) {
            const center = this.map.getCenter();
            this.loadPostsNearLocation(center.lng, center.lat);
          }
          return false;
        };
        
        return container;
      }
    });
    
    // Button zur Karte hinzufügen
    this.map.addControl(new loadPostsControl());
  }
  
  /**
   * Lädt Posts aus Supabase basierend auf Standort und zeigt sie als Marker an
   * @param longitude Längengrad
   * @param latitude Breitengrad
   * @param radiusMeters Radius in Metern (optional)
   */
  public async loadPostsNearLocation(longitude: number, latitude: number, radiusMeters: number = 50): Promise<void> {
    if (!this.map) return;
    
    try {
      // Lade-Anzeige darstellen
      this.showLoadingAnimation("Lade Posts...");
      
      // Posts in der Nähe laden
      const posts = await this.supabaseService.getPostController().loadPostsByLocation(longitude, latitude, radiusMeters);
      
      console.log(`${posts.length} Posts in der Nähe gefunden.`);
      
      // Bestehende Post-Marker entfernen
      this.clearPostMarkers();
      
      // Neue Marker für jeden Post hinzufügen
      posts.forEach(post => this.addPostMarker(post));
      
      // Lade-Anzeige entfernen
      this.hideLoadingAnimation();
      
    } catch (error) {
      console.error("Fehler beim Laden der Posts:", error);
      this.hideLoadingAnimation();
      
      // Visuelle Fehlermeldung anzeigen
      if (this.map) {
        const errorMsg = L.DomUtil.create('div', 'location-error-message');
        errorMsg.id = 'postsErrorMessage';
        errorMsg.innerHTML = `
          <div class="error-container">
            <strong>Fehler beim Laden der Posts</strong>
            <p>Die Posts konnten nicht geladen werden. Bitte versuchen Sie es später erneut.</p>
          </div>
        `;
        
        const container = L.DomUtil.get('map');
        if (container) {
          container.appendChild(errorMsg);
          
          // Nach 5 Sekunden ausblenden
          setTimeout(() => {
            if (container.contains(errorMsg)) {
              container.removeChild(errorMsg);
            }
          }, 5000);
        }
      }
    }
  }
  
  /**
   * Fügt einen Marker für einen Post hinzu
   * @param post Der Post mit Geokoordinaten
   */
  private addPostMarker(post: PostResponse): void {
    if (!this.map) return;
    
    
    
    // Marker-Icon anpassen
    const postIcon = L.icon({
      iconUrl: "assets/post-marker.png", // Stelle sicher, dass diese Datei existiert oder nutze ein Standard-Icon
      iconSize: [26, 35],
      iconAnchor: [13, 35],
      popupAnchor: [1, -34],
      shadowUrl: "assets/marker-shadow.png",
      shadowSize: [41, 41],
    });
    
    // Fallback auf Standard-Icon
    const icon = postIcon.options.iconUrl ? postIcon : new L.Icon.Default();
    const latitude = post.latitude || 0;
    const longitude = post.longitude || 0;
    // Marker erstellen und zur Karte hinzufügen
    const marker = L.marker(
      [latitude, longitude], 
      { icon: icon }
    ).addTo(this.map);
    
    // Popup mit Informationen erstellen
    marker.bindPopup(`
      <div class="marker-popup post-marker">
        <h3>${post.title}</h3>
        <p>${post.description || 'Keine Beschreibung'}</p>
        <div class="post-tags">
          ${post.tags ? post.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ') : ''}
        </div>
        <button class="btn-details" data-post-id="${post.id}">
          Details anzeigen
        </button>
      </div>
    `);
    
    // Event-Handler für das Popup
    marker.on("popupopen", () => {
      setTimeout(() => {
        const popupContent = marker.getPopup()?.getElement();
        const detailButton = popupContent?.querySelector(".btn-details");
        
        if (detailButton) {
          detailButton.addEventListener(
            "click",
            () => {
              const postId = detailButton.getAttribute("data-post-id");
              if (postId) {
                // Event für Postdetails emittieren
                this.markerClicked.emit(post.title);
                console.log(`Post-Details angefordert für ID: ${postId}`);
                // Hier könnten Sie zu einer Detailansicht navigieren
              }
            },
            { once: true }
          );
        }
      }, 0);
    });
    
    // Marker speichern, um sie später entfernen zu können
    this.postMarkers.push(marker);
  }
  
  /**
   * Entfernt alle Post-Marker von der Karte
   */
  private clearPostMarkers(): void {
    if (!this.map) return;
    
    // Alle Marker entfernen
    this.postMarkers.forEach(marker => {
      this.map?.removeLayer(marker);
    });
    
    // Array zurücksetzen
    this.postMarkers = [];
  }
  
  /**
   * Zeigt eine Ladeanimation für das Laden von Posts an
   */
  private showLoadingAnimation(message: string = "Lädt..."): void {
    const container = L.DomUtil.get('map');
    if (!container) return;
    
    // Entferne vorhandene Animation falls vorhanden
    this.hideLoadingAnimation();
    
    // Erstelle das Lade-Element
    const loadingElement = L.DomUtil.create('div', 'posts-loading-animation');
    loadingElement.id = 'postsLoadingAnimation';
    loadingElement.innerHTML = `
      <div class="location-spinner">
        <div class="spinner"></div>
        <p>${message}</p>
      </div>
    `;
    
    container.appendChild(loadingElement);
  }
  
  /**
   * Entfernt die Ladeanimation
   */
  private hideLoadingAnimation(): void {
    const container = L.DomUtil.get('map');
    const loadingElement = document.getElementById('postsLoadingAnimation');
    if (container && loadingElement && container.contains(loadingElement)) {
      container.removeChild(loadingElement);
    }
  }

  private resizeMap(): void {
    if (this.map) {
      this.map.invalidateSize();
    }
  }
}
