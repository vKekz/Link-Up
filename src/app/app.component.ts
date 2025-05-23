import { Component, ViewChild, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { MapOverviewComponent } from "./components/map-overview/map-overview.component";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, MapOverviewComponent, SidebarComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
  standalone: true,
})
export class AppComponent {
  title = "OpenStreetMap with Angular";
  @ViewChild(MapOverviewComponent) mapComponent!: MapOverviewComponent;


}
