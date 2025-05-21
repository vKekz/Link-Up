import { Routes } from "@angular/router";
import { UserRegistrationFormComponent } from "./components/user-registration-form/user-registration-form.component";
import { AppComponent } from "./app.component";
import { UserLoginFormComponent } from "./components/user-login-form/user-login-form.component";
import { MapOverviewComponent } from "./components/map-overview/map-overview.component";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { MenuButtonComponent } from "./components/menu-button/menu-button.component";
import { GroupsComponent } from "./components/groups/groups.component";


export const routes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  { path: "menu", component: MenuButtonComponent, pathMatch: "full" },
  { path: "dashboard", component: DashboardComponent, pathMatch: "full" },
  { path: "groups", component: GroupsComponent, pathMatch: "full" },
  { path: "groups/:id", component: GroupsComponent, pathMatch: "full" }, // Detailansicht einer Gruppe
  { path: "sidebar", component: SidebarComponent, pathMatch: "full"},
  { path: "map", component: MapOverviewComponent, pathMatch: "full" },
  { path: "register", component: UserRegistrationFormComponent, pathMatch: "full" },
  { path: "login", component: UserLoginFormComponent, pathMatch: "full" },
  { path: "profile", redirectTo: "dashboard", pathMatch: "full" }, // Temporäre Weiterleitung, bis Profil-Komponente implementiert ist
  { path: "settings", redirectTo: "dashboard", pathMatch: "full" }, // Temporäre Weiterleitung, bis Einstellungen-Komponente implementiert ist
  { path: "chat", redirectTo: "dashboard", pathMatch: "full" }, // Temporäre Weiterleitung, bis Chat-Komponente implementiert ist
  { path: "posts", redirectTo: "dashboard", pathMatch: "full" }, // Temporäre Weiterleitung, bis Posts-Komponente implementiert ist
  { path: "**", redirectTo: "dashboard" } // Fallback für nicht existierende Routen
];
