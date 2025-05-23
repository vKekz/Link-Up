import { MapOverviewComponent } from "./components/map-overview/map-overview.component";
import { MenuButtonComponent } from "./components/menu-button/menu-button.component";
import { LandingPageComponent } from "./components/landing-page/landing-page.component";
import { AuthGuard } from "../guards/auth-guard.service";
import { SessionGuard } from "../guards/session.guard";
import {
  ROUTE_GROUP_CHAT,
  ROUTE_HOME,
  ROUTE_LOGIN,
  ROUTE_MAP,
  ROUTE_REGISTER,
  ROUTE_SETTINGS,
} from "../constants/route.constants";
import { UserSettingsComponent } from "./components/user-settings/user-settings.component";
import { GroupChatComponent } from "./components/group-chat/group-chat.component";
import { Routes } from "@angular/router";
import { UserRegistrationFormComponent } from "./components/user-registration-form/user-registration-form.component";
import { UserLoginFormComponent } from "./components/user-login-form/user-login-form.component";

export const routes: Routes = [
  { path: ROUTE_HOME, component: LandingPageComponent, pathMatch: "full" },
  { path: ROUTE_MAP, component: MapOverviewComponent, canActivate: [AuthGuard], pathMatch: "full" },
  { path: ROUTE_GROUP_CHAT, component: GroupChatComponent, canActivate: [AuthGuard], pathMatch: "full" },
  { path: ROUTE_SETTINGS, component: UserSettingsComponent, canActivate: [AuthGuard], pathMatch: "full" },
  { path: "posts", component: UserSettingsComponent, canActivate: [AuthGuard], pathMatch: "full" },
  { path: ROUTE_REGISTER, component: UserRegistrationFormComponent, canActivate: [SessionGuard], pathMatch: "full" },
  { path: ROUTE_LOGIN, component: UserLoginFormComponent, canActivate: [SessionGuard], pathMatch: "full" },
  { path: "menu", component: MenuButtonComponent, pathMatch: "full" },
];
