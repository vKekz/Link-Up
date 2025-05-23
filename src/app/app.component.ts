import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { ROUTE_LOGIN, ROUTE_REGISTER } from "../constants/route.constants";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
  standalone: true,
})
export class AppComponent {
  protected isSideBarCompatible() {
    return (
      location.pathname !== "/" &&
      !location.pathname.startsWith(`/${ROUTE_LOGIN}`) &&
      !location.pathname.startsWith(`/${ROUTE_REGISTER}`)
    );
  }
}
