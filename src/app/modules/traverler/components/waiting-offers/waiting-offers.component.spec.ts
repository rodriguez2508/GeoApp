import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingOffersComponent } from './waiting-offers.component';

describe('WaitingOffersComponent', () => {
  let component: WaitingOffersComponent;
  let fixture: ComponentFixture<WaitingOffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaitingOffersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WaitingOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
