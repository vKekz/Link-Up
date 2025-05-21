import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  // Signal für aktiven Menüpunkt
  activeMenu = signal<string>('dashboard');

  // Methode zum Setzen des aktiven Menüpunkts
  setActiveMenu(menuItem: string): void {
    this.activeMenu.set(menuItem);
  }
}
