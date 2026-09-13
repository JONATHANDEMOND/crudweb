import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScannersSrComponent } from './scanners-sr.component';

describe('ScannersSrComponent', () => {
  let component: ScannersSrComponent;
  let fixture: ComponentFixture<ScannersSrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScannersSrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScannersSrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
