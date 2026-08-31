import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialBajasComponent } from './historial-bajas.component';

describe('HistorialBajasComponent', () => {
  let component: HistorialBajasComponent;
  let fixture: ComponentFixture<HistorialBajasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialBajasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialBajasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
