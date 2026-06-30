import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpresorasEdificioCentralComponent } from './impresoras-edificio-central.component';

describe('ImpresorasEdificioCentralComponent', () => {
  let component: ImpresorasEdificioCentralComponent;
  let fixture: ComponentFixture<ImpresorasEdificioCentralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImpresorasEdificioCentralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImpresorasEdificioCentralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
