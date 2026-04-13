import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  // Simulamos el Router para que la prueba no falle
  const routerMock = { navigate: jasmine.createSpy('navigate') };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  it('debe crearse el guardián', () => {
    const executeGuard = () =>
      TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(executeGuard).toBeTruthy();
  });
});
