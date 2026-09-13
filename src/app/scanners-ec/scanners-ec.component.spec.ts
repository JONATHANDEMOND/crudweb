import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScannersEcComponent } from './scanners-ec.component';

describe('ScannersEcComponent', () => {
  let component: ScannersEcComponent;
  let fixture: ComponentFixture<ScannersEcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScannersEcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScannersEcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
