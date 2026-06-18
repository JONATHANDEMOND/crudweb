import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioCentralComponent } from './formulario-central.component';

describe('FormularioCentralComponent', () => {
  let component: FormularioCentralComponent;
  let fixture: ComponentFixture<FormularioCentralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioCentralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioCentralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
