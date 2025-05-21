import { Component } from '@angular/core';

@Component({
  selector: 'app-menu-button',
  imports: [],
  templateUrl: './menu-button.component.html',
  styleUrl: './menu-button.component.css'
})
export class MenuButtonComponent {
  isHovered = false;

  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;
  }
}
