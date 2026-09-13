import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProyectoresSrComponent } from './proyectores-sr.component';

describe('ProyectoresSrComponent', () => {
  let component: ProyectoresSrComponent;
  let fixture: ComponentFixture<ProyectoresSrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProyectoresSrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProyectoresSrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
