import { Component, AfterViewInit, Output, EventEmitter, signal, OnDestroy, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import * as L from "leaflet";
import { SupabaseService } from "../../../services/supabase.service";
import { PostResponse } from "../../../contracts/post/post.response";
import { PostController } from "../../../controllers/post/post.controller";
import { Router } from "@angular/router";

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
    // { lat: 49.4738333, lng: 8.534333333333333, title: "DHBW Mannheim", description: "Beschreibung Incoming" },
    // { lat: 48.8566, lng: 2.3522, title: "Paris", description: "Capital of France" },
    // { lat: 40.7128, lng: -74.006, title: "New York", description: "The Big Apple" },
  ]);
  private locationMarker: L.LayerGroup | null = null;


  // Service injizieren
  private supabaseService = inject(SupabaseService);



  // Status-Variablen für die Standortverfolgung
  private isLocating = false;
  private locationErrorCount = 0;
  private maxLocationErrors = 3;
  private lastLocationFound = false;
  private hasLocationPermission = false;
  private currentUserLocation: L.LatLng | null = null;

  private radius = signal(5000);

  @Output() markerClicked = new EventEmitter<string>();

  constructor(private readonly router:Router) {
    // Initialisiere den Radius
    // this.radius.set(5000);
    
  }

  ngAfterViewInit(): void {
    console.log("NG after view init");
    this.initMap();
    // this.addMarkers();

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

  private locationControlInstance?: L.Control;
  private postsControlInstance?: L.Control;
  private radiusControlInstance?: L.Control;
  private radiusCircle?: L.Circle;
  private initMap(): void {
    if (this.map) {
      return;
    }

    this.map = L.map("map", {
      center: [49.47457750584654, 8.534245487974458],
      zoom: 12,
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

    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
      minZoom: 0,
      maxZoom: 20,
      attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    // Standort lokalisieren und blauen Punkt anzeigen
    this.locateUser();

    this.addLocationAndPostsButtons();
  }

  private addLocationAndPostsButtons(): void {
    console.log("Add location and posts buttons in Method");
    if (!this.map) return;

    // Entferne alte Controls, falls vorhanden
    if (this.locationControlInstance) {
      this.map.removeControl(this.locationControlInstance);
      this.locationControlInstance = undefined;
    }
    if (this.postsControlInstance) {
      this.map.removeControl(this.postsControlInstance);
      this.postsControlInstance = undefined;
    }

    if (this.radiusControlInstance) {
      this.map.removeControl(this.radiusControlInstance);
      this.radiusControlInstance = undefined;
    }

    const RadiusControl = L.Control.extend({
      options: { position: 'bottomright' },
      onAdd: () => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control radius-button');
        container.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 10px; background-color: white; border-radius: 5px; border: 1px solid #ccc; min-width: 200px;">
            <input id="radius-slider" type="range" min="500" max="30000" value="5000" step="500" style="width: 180px;" />
            <div style="display: flex; justify-content: space-between; width: 180px; font-size: 10px; color: #666;">
              <span>500m</span>
              <span>10km</span>
              <span>20km</span>
              <span>30km</span>
            </div>
            <div id="radius-value" style="font-size: 12px; font-weight: bold; color: #333;">5.0km</div>
          </div>
        `;

        // Prevent map dragging when interacting with the slider
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        return container;
      },
    });

    this.radiusControlInstance = new RadiusControl();

    this.map.addControl(this.radiusControlInstance);

    // Posts-Button
    const PostsControl = L.Control.extend({
      options: { position: 'bottomright' },
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
    this.postsControlInstance = new PostsControl();
    this.map.addControl(this.postsControlInstance);



    document.getElementById('radius-slider')?.addEventListener('input', (e: Event) => {
      const slider = e.target as HTMLInputElement;
      const value = parseInt(slider.value);

      // Update the display value
      const displayElement = document.getElementById('radius-value');
      if (displayElement) {
        if (value >= 1000) {
          displayElement.textContent = `${(value / 1000).toFixed(1)}km`;
        } else {
          displayElement.textContent = `${value}m`;
        }
      }

      // Get the center location for centering the map
      let centerLocation: L.LatLng;

      if (this.radiusCircle) {
        // If radius circle exists, use its center (user's location or default location)
        centerLocation = this.radiusCircle.getLatLng();
      } else {
        // Fallback to default location (DHBW Mannheim)
        centerLocation = L.latLng(49.47457750584654, 8.534245487974458);
      }

      // Update radius circle
      if (this.radiusCircle) {
        this.radiusCircle.setRadius(value);
      }

      // Calculate and set appropriate zoom level based on radius
      const zoomLevel = this.calculateZoomFromRadius(value);
      if (this.map) {
        // Center the map on the location and set zoom
        this.map.setView(centerLocation, zoomLevel);
      }

      console.log('Radius changed to:', value, 'Zoom level:', zoomLevel, 'Centered on:', centerLocation);
    });

    // Prevent map dragging when interacting with the slider
    const sliderElement = document.getElementById('radius-slider');
    if (sliderElement) {
      // Prevent map dragging during slider interactions
      sliderElement.addEventListener('mousedown', (e: Event) => {
        e.stopPropagation();
      });

      sliderElement.addEventListener('touchstart', (e: Event) => {
        e.stopPropagation();
      });

      sliderElement.addEventListener('mousemove', (e: Event) => {
        e.stopPropagation();
      });

      sliderElement.addEventListener('touchmove', (e: Event) => {
        e.stopPropagation();
      });

      sliderElement.addEventListener('mouseup', (e: Event) => {
        e.stopPropagation();
      });

      sliderElement.addEventListener('touchend', (e: Event) => {
        e.stopPropagation();
      });
    }

    // Standort-Button
    const LocationControl = L.Control.extend({
      options: { position: 'bottomright' },
      onAdd: () => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control location-button');
        container.innerHTML = '<a href="#" title="Zeige meinen Standort"><span class="location-icon">📍</span></a>';
        container.onclick = () => {
          console.log('Location button clicked');
          if (this.currentUserLocation) {
            console.log('Centering on stored user location:', this.currentUserLocation);
            this.map?.setView(this.currentUserLocation, this.map.getZoom() || 14);
          } else {
            console.log('No stored user location, calling locateUser()');
            this.locateUser();
          }
          return false;
        };
        return container;
      }
    });
    this.locationControlInstance = new LocationControl();
    this.map.addControl(this.locationControlInstance);


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

    // If we already found location successfully, don't try again
    if (this.lastLocationFound && this.hasLocationPermission) {
      console.log('Location already found, skipping new location request');
      return;
    }

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

    // Standortverfolgung starten ohne kontinuierliche Aktualisierung
    this.isLocating = true;
    this.map.locate({
      setView: true,
      maxZoom: 14,
      watch: false,             // Changed: No continuous watching
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    });

    // Event-Handler für gefundenen Standort
    this.map.on('locationfound', (e: L.LocationEvent) => {
      // Entferne Lade-Animation
      this.hideLocatingAnimation();
      this.lastLocationFound = true;
      this.hasLocationPermission = true; // Mark permission as granted
      this.currentUserLocation = e.latlng; // Store user's location
      this.locationErrorCount = 0;
      this.isLocating = false; // Stop locating

      console.log('Standort gefunden:', e.latlng, 'Genauigkeit:', e.accuracy);

      // Stop any further location watching
      this.map?.stopLocate();

      // Entferne den bestehenden Standortmarker, falls vorhanden
      if (this.locationMarker) {
        this.map?.removeLayer(this.locationMarker);
        this.locationMarker = null;
      }

      // Show radius circle at user's location
      this.showRadiusCircleAtLocation(e.latlng);
    });

    // Event-Handler für Fehler bei der Standortbestimmung
    this.map.on('locationerror', (e: L.ErrorEvent) => {
      this.locationErrorCount++;
      this.isLocating = false;

      console.error(`Standortbestimmung fehlgeschlagen (${this.locationErrorCount}/${this.maxLocationErrors}):`, e.message);

      // Stop location watching
      this.map?.stopLocate();

      // If permission denied or after max errors, show radius at default location
      if (e.message.toLowerCase().includes('permission') ||
        e.message.toLowerCase().includes('denied') ||
        this.locationErrorCount >= this.maxLocationErrors) {

        // Entferne Lade-Animation
        this.hideLocatingAnimation();
        this.hasLocationPermission = false;

        // Show radius circle at default location (DHBW Mannheim)
        const defaultLocation = L.latLng(49.47457750584654, 8.534245487974458);
        this.showRadiusCircleAtLocation(defaultLocation);

        // Set map view to default location
        this.map?.setView(defaultLocation, 12);

        console.log('Permission denied or max errors reached, showing radius at default location');
      } else {
        // For other errors, try again after a short delay
        setTimeout(() => {
          if (this.locationErrorCount < this.maxLocationErrors) {
            this.locateUser();
          }
        }, 3000);
      }
    });
  }

  /**
   * Shows radius circle at the specified location
   * @param location The location to center the radius circle
   */
  private showRadiusCircleAtLocation(location: L.LatLng): void {
    if (!this.map) return;

    // Remove existing location marker
    if (this.locationMarker) {
      this.map.removeLayer(this.locationMarker);
      this.locationMarker = null;
    }

    // Create layer group for location display
    const locGroup = L.layerGroup();

    // Outer radius circle
    const circle = L.circle(location, {
      radius: this.radius(),
      color: 'var(--color-palette-light-teal)',
      fillColor: 'var(--color-palette-light-teal)',
      fillOpacity: 0.15,
      weight: 1
    }).addTo(locGroup);

    this.radiusCircle = circle;

    // Inner location marker (if we have user location)
    if (this.hasLocationPermission) {
      // Small pulsing circle for user location
      const innerCircle = L.circle(location, {
        radius: 15,
        color: 'var(--color-palette-dark-teal)',
        fillColor: 'var(--color-palette-teal)',
        fillOpacity: 0.8,
        weight: 2,
        className: 'location-marker-inner'
      }).addTo(locGroup);
    } else {
      // Static marker for default location
      const defaultMarker = L.circle(location, {
        radius: 25,
        color: '#666',
        fillColor: '#999',
        fillOpacity: 0.6,
        weight: 2
      }).addTo(locGroup);
    }

    // Add layer group to map
    locGroup.addTo(this.map);
    this.locationMarker = locGroup;
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
  public async loadPostsNearLocation(longitude: number, latitude: number, radiusMeters: number = 50000): Promise<void> {

    if (!this.map) return;
    console.log("Lade Posts in der Nähe...");
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
      iconUrl: "assets/marker-icon-2x.png", // Stelle sicher, dass diese Datei existiert oder nutze ein Standard-Icon
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
                // TODO navigate to Posts detail Page
                // this.router.navigate(['/posts', postId]);
                this.router.navigate(['/posts', postId]);


              }
            },
            { once: true }
          );
        }
      }, 0);
    });

    // Marker in markersData speichern
    const updatedMarkers = [...this.markersData(), { lat: latitude, lng: longitude, title: post.title, description: post.description || '' }];
    this.markersData.set(updatedMarkers);

  }

  /**
   * Entfernt alle Post-Marker von der Karte
   */
  private clearPostMarkers(): void {
    if (!this.map) return;

    // Alle Marker entfernen
    // this.postMarkers.forEach(marker => {
    //   this.map?.removeLayer(marker);
    // });
    this.markersData.set([]);
    //remove Markers from map
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map?.removeLayer(layer);
      }
    }
    );

    // Array zurücksetzen
    // this.postMarkers = [];

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

  /**
   * Calculates appropriate zoom level based on radius value
   * Smaller radius = higher zoom (more zoomed in)
   * Larger radius = lower zoom (more zoomed out)
   */
  private calculateZoomFromRadius(radius: number): number {
    // Define zoom mapping based on radius ranges
    // Radius range: 500m to 30000m (30km)
    // Zoom range: 16 (closest) to 8 (furthest)

    if (radius <= 1000) return 16;        // 500m-1km: Very close zoom
    if (radius <= 2000) return 15;        // 1-2km: Close zoom
    if (radius <= 3000) return 14;        // 2-3km: Medium-close zoom
    if (radius <= 5000) return 13;        // 3-5km: Medium zoom
    if (radius <= 8000) return 12;        // 5-8km: Default zoom
    if (radius <= 12000) return 11;       // 8-12km: Medium-far zoom
    return 10;       // 12-18km: Far zoom
  }
}
