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
  isSettingsVisible = false;
  isColored = false; // Neue Property für Farb-Toggle

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

  protected openSettings() {
    this.isSettingsVisible = !this.isSettingsVisible;
    const settingsBox = document.getElementById('settingsbox');
    if (settingsBox) {
      if (this.isSettingsVisible) {
        settingsBox.classList.add('visible');
      } else {
        settingsBox.classList.remove('visible');
      }
    }
  }

  protected toggleColor() {
    this.isColored = !this.isColored;
    const sidebarElement = document.getElementById('sidebarBox');
    const settingsBox = document.getElementById('settingsbox');
    const profileBox = document.querySelector('.sidebarProfileBox');
    if (sidebarElement) {
      if (this.isColored) {
        sidebarElement.classList.add('colored-bg');
        sidebarElement.querySelectorAll('*').forEach(child => {
          (child as HTMLElement).classList.add('colored-bg');
        });
      } else {
        sidebarElement.classList.remove('colored-bg');
        sidebarElement.querySelectorAll('*').forEach(child => {
          (child as HTMLElement).classList.remove('colored-bg');
        });
      }
    }
    if (settingsBox) {
      if (this.isColored) {
        settingsBox.classList.add('colored-bg');
        settingsBox.querySelectorAll('*').forEach(child => {
          (child as HTMLElement).classList.add('colored-bg');
        });
      } else {
        settingsBox.classList.remove('colored-bg');
        settingsBox.querySelectorAll('*').forEach(child => {
          (child as HTMLElement).classList.remove('colored-bg');
        });
      }
    }
    if (profileBox) {
      if (this.isColored) {
        (profileBox as HTMLElement).classList.add('colored-bg');
        profileBox.querySelectorAll('*').forEach(child => {
          (child as HTMLElement).classList.add('colored-bg');
        });
      } else {
        (profileBox as HTMLElement).classList.remove('colored-bg');
        profileBox.querySelectorAll('*').forEach(child => {
          (child as HTMLElement).classList.remove('colored-bg');
        });
      }
    }
    // SVG-Icons auf weiß im Darkmode
    const svgs = document.querySelectorAll('#sidebarBox svg, #settingsbox svg, .sidebarProfileBox svg');
    svgs.forEach(svg => {
      if (this.isColored) {
        (svg as SVGElement).setAttribute('stroke', '#fff');
      } else {
        (svg as SVGElement).setAttribute('stroke', '#000');
      }
    });
  }

  
}