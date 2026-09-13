import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProyectoresEcComponent } from './proyectores-ec.component';

describe('ProyectoresEcComponent', () => {
  let component: ProyectoresEcComponent;
  let fixture: ComponentFixture<ProyectoresEcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProyectoresEcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProyectoresEcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
