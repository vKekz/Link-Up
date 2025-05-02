import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { EnvironmentHandler } from "../environments/handler/environment.handler";
import { NavBarComponent } from "./components/nav-bar/nav-bar.component";
import { ButtonComponent } from "./components/button/button.component";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, NavBarComponent, ButtonComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  constructor() {
    EnvironmentHandler.load();
  }
}
