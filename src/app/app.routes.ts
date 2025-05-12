import { Routes } from "@angular/router";
import { UserRegistrationFormComponent } from "./components/user-registration-form/user-registration-form.component";
import { AppComponent } from "./app.component";

export const routes: Routes = [
  { path: "", component: AppComponent, pathMatch: "full" },
  { path: "register", component: UserRegistrationFormComponent, pathMatch: "full" },
];
