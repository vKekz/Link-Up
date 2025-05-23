import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  constructor(protected readonly router: Router) {}

  isCollapsed = false;

  protected toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    const sidebarElement = document.getElementById('sidebarBox');
    if (sidebarElement) {
      if (this.isCollapsed) {
        sidebarElement.classList.add('collapsed');
      } else {
        sidebarElement.classList.remove('collapsed');
      }
    }
  }
}
