import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsFormComponent } from './posts-form.component';

describe('PostsFormComponent', () => {
  let component: PostsFormComponent;
  let fixture: ComponentFixture<PostsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
