import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { PostResponse } from '../../../contracts/post/post.response';
import * as L from 'leaflet';

/**
 * Service zum Laden und Verarbeiten von Markern für die Karte
 */
@Injectable({
  providedIn: 'root'
})
export class MapMarkerService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Laden von Markern basierend auf Geokoordinaten
   * @param longitude Längengrad des Zentrums
   * @param latitude Breitengrad des Zentrums
   * @param map Leaflet-Kartenobjekt, auf dem die Marker angezeigt werden sollen
   * @param radius Radius in Kilometern (optional, Standard: 50)
   * @returns Array mit erstellten Markern
   */
  public async loadMarkersFromCoordinates(
    longitude: number,
    latitude: number,
    map: L.Map,
    radius: number = 50
  ): Promise<L.Marker[]> {
    try {
      // Posts aus der Datenbank laden
      const posts = await this.supabaseService.getPostController().posts();
      const markers: L.Marker[] = [];

      console.log(`${posts.length} Posts geladen.`);
      
      // Überprüfen, ob die Posts gültige Geo-Daten haben
      posts.forEach(post => {
        
        if (post.latitude && post.longitude) {
          // Marker-Icon erstellen
          const customIcon = L.icon({
            iconUrl: 'assets/marker-icon-2x.png',
            iconSize: [26, 35],
            iconAnchor: [13, 35],
            popupAnchor: [1, -34],
            shadowUrl: 'assets/marker-shadow.png',
            shadowSize: [41, 41],
          });

          // Marker erstellen und zur Karte hinzufügen
          const marker = L.marker(
            [post.latitude, post.longitude],
            { icon: customIcon }
          ).addTo(map);

          // Popup mit Post-Informationen erstellen
          marker.bindPopup(`
            <div class="marker-popup">
              <h3>${post.title || 'Unbenannter Post'}</h3>
              <p>${post.description || 'Keine Beschreibung'}</p>
              <div class="post-tags">
                ${post.tags ? post.tags.map((tag: string) => `<span class="tag">${tag}</span>`).join(' ') : ''}
              </div>
              <button class="btn-details" data-post-id="${post.id}">
                Details anzeigen
              </button>
            </div>
          `);

          // Marker speichern
          markers.push(marker);
        } else {
          console.warn(`Post ${post.id} hat keine gültigen Geokoordinaten.`);
        }
      });

      return markers;
    } catch (error) {
      console.error("Fehler beim Laden der Marker:", error);
      return [];
    }
  }

  /**
   * Extrahiert Koordinaten aus einem POINT-String im Format POINT(lon lat)
   * @param pointStr String mit Geokoordinaten
   * @returns Object mit longitude und latitude oder null
   */
  public extractCoordinatesFromPoint(pointStr?: string): { longitude: number, latitude: number } | null {
    if (!pointStr || !pointStr.startsWith('POINT(') || !pointStr.endsWith(')')) {
      return null;
    }
    
    try {
      const coordsStr = pointStr.substring(6, pointStr.length - 1);
      const [longitude, latitude] = coordsStr.split(' ').map(parseFloat);
      
      if (isNaN(longitude) || isNaN(latitude)) {
        return null;
      }
      
      return { longitude, latitude };
    } catch (error) {
      console.error("Fehler beim Extrahieren der Koordinaten:", error);
      return null;
    }
  }
}
