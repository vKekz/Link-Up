import { Component, ViewChild, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { MapOverviewComponent } from "./components/map-overview/map-overview.component";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, MapOverviewComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
  standalone: true,
})
export class AppComponent {
  title = "OpenStreetMap with Angular";
  @ViewChild(MapOverviewComponent) mapComponent!: MapOverviewComponent;

  newMarker = {
    lat: null as number | null,
    lng: null as number | null,
    title: "",
    description: "",
  };

  existingMarkers = signal([{ title: "London" }, { title: "Paris" }, { title: "New York" }]);

  addMarker(): void {
    if (this.newMarker.lat && this.newMarker.lng && this.newMarker.title) {
      this.mapComponent.addNewMarker({
        lat: this.newMarker.lat,
        lng: this.newMarker.lng,
        title: this.newMarker.title,
        description: this.newMarker.description || "No description provided",
      });

      // Add to existing markers list
      this.existingMarkers.update((markers) => [...markers, { title: this.newMarker.title }]);

      // Reset form
      this.newMarker = {
        lat: null,
        lng: null,
        title: "",
        description: "",
      };
    }
  }

  focusMarker(title: string): void {
    this.mapComponent.focusMarker(title);
  }

  handleMarkerClick(title: string): void {
    alert(`You clicked on ${title}!`);
    // You can perform other actions here
    this.focusMarker(title);
  }
}
