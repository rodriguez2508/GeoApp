import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OngoingPageComponent } from './ongoing-page.component';

describe('OngoingPageComponent', () => {
  let component: OngoingPageComponent;
  let fixture: ComponentFixture<OngoingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OngoingPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OngoingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
