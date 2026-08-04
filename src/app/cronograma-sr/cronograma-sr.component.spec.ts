import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CronogramaSrComponent } from './cronograma-sr.component';

describe('CronogramaSrComponent', () => {
  let component: CronogramaSrComponent;
  let fixture: ComponentFixture<CronogramaSrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CronogramaSrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CronogramaSrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
