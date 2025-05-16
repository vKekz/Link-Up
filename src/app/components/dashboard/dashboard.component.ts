import { Component } from '@angular/core';
import { MapOverviewComponent } from "../map-overview/map-overview.component";
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-dashboard',
  imports: [MapOverviewComponent, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
