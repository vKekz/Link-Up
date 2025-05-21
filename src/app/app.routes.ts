import { Routes } from "@angular/router";
import { UserRegistrationFormComponent } from "./components/user-registration-form/user-registration-form.component";
import { AppComponent } from "./app.component";
import { UserLoginFormComponent } from "./components/user-login-form/user-login-form.component";
import { MapOverviewComponent } from "./components/map-overview/map-overview.component";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { MenuButtonComponent } from "./components/menu-button/menu-button.component";


export const routes: Routes = [
  { path: "", component: AppComponent, pathMatch: "full" },
  { path: "menu", component: MenuButtonComponent, pathMatch: "full" },
  { path: "dashboard", component: DashboardComponent, pathMatch: "full" },
  { path: "sidebar", component: SidebarComponent, pathMatch: "full"},
  { path: "map", component: MapOverviewComponent, pathMatch: "full" },
  { path: "register", component: UserRegistrationFormComponent, pathMatch: "full" },
  { path: "login", component: UserLoginFormComponent, pathMatch: "full" },
];
