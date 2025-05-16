import { Routes } from "@angular/router";
import { UserRegistrationFormComponent } from "./components/user-registration-form/user-registration-form.component";
import { AppComponent } from "./app.component";
import { UserLoginFormComponent } from "./components/user-login-form/user-login-form.component";

export const routes: Routes = [
  { path: "", component: AppComponent, pathMatch: "full" },
  { path: "register", component: UserRegistrationFormComponent, pathMatch: "full" },
  { path: "login", component: UserLoginFormComponent, pathMatch: "full" },
];
