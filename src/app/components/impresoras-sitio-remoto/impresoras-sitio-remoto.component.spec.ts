import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpresorasSitioRemotoComponent } from './impresoras-sitio-remoto.component';

describe('ImpresorasSitioRemotoComponent', () => {
  let component: ImpresorasSitioRemotoComponent;
  let fixture: ComponentFixture<ImpresorasSitioRemotoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImpresorasSitioRemotoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImpresorasSitioRemotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
