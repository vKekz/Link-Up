import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiusSliderComponent } from './radius-slider.component';

describe('RadiusSliderComponent', () => {
  let component: RadiusSliderComponent;
  let fixture: ComponentFixture<RadiusSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiusSliderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiusSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
