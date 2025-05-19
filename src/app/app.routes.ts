import { Routes } from "@angular/router";
import { UserRegistrationFormComponent } from "./components/user-registration-form/user-registration-form.component";
import { AppComponent } from "./app.component";
import { UserLoginFormComponent } from "./components/user-login-form/user-login-form.component";
import { LandingPageComponent } from "./components/landing-page/landing-page.component";

export const routes: Routes = [
  { path: "", component: AppComponent, pathMatch: "full" },
  { path: "register", component: UserRegistrationFormComponent, pathMatch: "full" },
  { path: "login", component: UserLoginFormComponent, pathMatch: "full" },
  { path: "landing", component: LandingPageComponent, pathMatch: "full" },
];
