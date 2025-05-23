import { Routes } from "@angular/router";
import { UserRegistrationFormComponent } from "./components/user-registration-form/user-registration-form.component";
import { UserLoginFormComponent } from "./components/user-login-form/user-login-form.component";
import { MapOverviewComponent } from "./components/map-overview/map-overview.component";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { MenuButtonComponent } from "./components/menu-button/menu-button.component";
import { LandingPageComponent } from "./components/landing-page/landing-page.component";
import { AuthGuard } from "../guards/auth-guard.service";
import { SessionGuard } from "../guards/session.guard";
import { ROUTE_DASHBOARD, ROUTE_HOME, ROUTE_LOGIN, ROUTE_REGISTER, ROUTE_SETTINGS } from "../constants/route.constants";
import { UserSettingsComponent } from "./components/user-settings/user-settings.component";

export const routes: Routes = [
  { path: ROUTE_HOME, component: LandingPageComponent, pathMatch: "full" },
  { path: ROUTE_DASHBOARD, component: DashboardComponent, canActivate: [AuthGuard], pathMatch: "full" },
  { path: ROUTE_SETTINGS, component: UserSettingsComponent, canActivate: [AuthGuard], pathMatch: "full" },
  { path: ROUTE_REGISTER, component: UserRegistrationFormComponent, canActivate: [SessionGuard], pathMatch: "full" },
  { path: ROUTE_LOGIN, component: UserLoginFormComponent, canActivate: [SessionGuard], pathMatch: "full" },
  { path: "menu", component: MenuButtonComponent, pathMatch: "full" },
  { path: "sidebar", component: SidebarComponent, pathMatch: "full" },
  { path: "map", component: MapOverviewComponent, pathMatch: "full" },
];
