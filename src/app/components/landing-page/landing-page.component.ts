import { Component, OnInit, signal, WritableSignal } from "@angular/core";
import { SupabaseService } from "../../../services/supabase.service";
import { ROUTE_MAP, ROUTE_LOGIN, ROUTE_REGISTER } from "../../../constants/route.constants";

@Component({
  selector: "app-landing-page",
  imports: [],
  templateUrl: "./landing-page.component.html",
  styleUrl: "./landing-page.component.css",
})
export class LandingPageComponent implements OnInit {
  protected isLoggedIn: WritableSignal<boolean> = signal(false);

  constructor(private readonly supabaseService: SupabaseService) {}

  async ngOnInit(): Promise<void> {
    this.isLoggedIn.set(await this.supabaseService.getUserController().isLoggedIn());
  }

  protected readonly ROUTE_DASHBOARD = ROUTE_MAP;
  protected readonly ROUTE_LOGIN = ROUTE_LOGIN;
  protected readonly ROUTE_REGISTER = ROUTE_REGISTER;
}
