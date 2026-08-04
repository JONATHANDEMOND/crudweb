import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquiposBajaComponent } from './equipos-baja.component';

describe('EquiposBajaComponent', () => {
  let component: EquiposBajaComponent;
  let fixture: ComponentFixture<EquiposBajaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquiposBajaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquiposBajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
