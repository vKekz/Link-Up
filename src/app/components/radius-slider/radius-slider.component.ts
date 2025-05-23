import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-radius-slider',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './radius-slider.component.html',
  styleUrl: './radius-slider.component.css'
})
export class RadiusSliderComponent implements OnInit {
  currentValue: number = 5;
  
  ngOnInit() {
    const slider = document.getElementById('kmSlider') as HTMLInputElement;
    const circle = document.getElementById('circle');

    this.updateCircle(this.currentValue);
  }

  onSliderInput(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value);
    this.currentValue = value;
    this.updateCircle(value);
  }

  private updateCircle(radius: number) {
    const circle = document.getElementById('circle');
    if (circle) {
      circle.style.width = radius + 'px';
      circle.style.height = radius + 'px';
      circle.style.borderRadius = (radius / 2) + 'px';
    }
  }
}
