import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { EnvironmentHandler } from "../environments/handler/environment.handler";
import { NavBarComponent } from "./components/nav-bar/nav-bar.component";
import { MapOverviewComponent } from "./components/map-overview/map-overview.component";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, NavBarComponent, MapOverviewComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  constructor() {
    EnvironmentHandler.load();
  }
}
