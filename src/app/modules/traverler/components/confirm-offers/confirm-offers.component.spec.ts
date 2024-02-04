import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmOffersComponent } from './confirm-offers.component';

describe('ConfirmOffersComponent', () => {
  let component: ConfirmOffersComponent;
  let fixture: ComponentFixture<ConfirmOffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmOffersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
