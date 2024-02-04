import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateDriverComponent } from './rate-driver.component';

describe('RateDriverComponent', () => {
  let component: RateDriverComponent;
  let fixture: ComponentFixture<RateDriverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateDriverComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RateDriverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
