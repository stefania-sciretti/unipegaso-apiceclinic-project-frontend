import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { AppointmentService } from '../../services/appointment.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture:   ComponentFixture<LoginComponent>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockAuthService        = jasmine.createSpyObj('AuthService', ['login', 'register'],
    { isLoggedIn: false, currentUser: null });
  const mockBookingService     = jasmine.createSpyObj('BookingService', ['clearPendingBooking'],
    { pendingBooking: null });
  const mockAppointmentService = jasmine.createSpyObj('AppointmentService', ['create']);

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockAuthService.login.calls.reset();
    mockAuthService.register.calls.reset();
    mockAuthService.login.and.returnValue(of(false));
    mockAuthService.register.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService,        useValue: mockAuthService },
        { provide: Router,             useValue: mockRouter },
        { provide: BookingService,     useValue: mockBookingService },
        { provide: AppointmentService, useValue: mockAppointmentService }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  // ── isInvalid() ──────────────────────────────────────────────────────────

  it('isInvalid() returns false when field is untouched', () => {
    expect(component.isInvalid('username')).toBeFalse();
  });

  it('isInvalid() returns true when required field is touched and empty', () => {
    component.form.get('username')!.setValue('');
    component.form.get('username')!.markAsTouched();
    expect(component.isInvalid('username')).toBeTrue();
  });

  it('isInvalid() returns false when field is valid and touched', () => {
    component.form.get('username')!.setValue('admin');
    component.form.get('username')!.markAsTouched();
    expect(component.isInvalid('username')).toBeFalse();
  });

  // ── submit() — invalid form ───────────────────────────────────────────────

  it('submit() marks all touched and skips service call when form is invalid', () => {
    component.form.reset();
    component.submit();
    expect(mockAuthService.login).not.toHaveBeenCalled();
    expect(component.form.touched).toBeTrue();
  });

  // ── submit() — valid login ────────────────────────────────────────────────

  it('submit() calls auth.login() when form is valid and not registering', () => {
    mockAuthService.login.and.returnValue(of(true));
    component.form.patchValue({ username: 'admin', password: 'pass123' });
    component.submit();
    expect(mockAuthService.login).toHaveBeenCalledWith('admin', 'pass123');
  });

  it('submit() navigates to /homepage on successful login', () => {
    mockAuthService.login.and.returnValue(of(true));
    component.form.patchValue({ username: 'admin', password: 'pass' });
    component.submit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/homepage']);
  });

  it('submit() sets error message when login returns false', () => {
    mockAuthService.login.and.returnValue(of(false));
    component.form.patchValue({ username: 'admin', password: 'wrong' });
    component.submit();
    expect(component.error()).toBeTruthy();
    expect(component.error()).toContain('valide');
  });

  it('submit() sets error when login observable errors', () => {
    mockAuthService.login.and.returnValue(throwError(() => new Error('Network')));
    component.form.patchValue({ username: 'admin', password: 'pass' });
    component.submit();
    expect(component.error()).toBeTruthy();
    expect(component.loading()).toBeFalse();
  });

  // ── toggleMode() ─────────────────────────────────────────────────────────

  it('toggleMode() switches to registration mode', () => {
    component.toggleMode();
    expect(component.isRegistering()).toBeTrue();
  });

  it('toggleMode() twice returns to login mode', () => {
    component.toggleMode();
    component.toggleMode();
    expect(component.isRegistering()).toBeFalse();
  });

  it('toggleMode() clears the error message', () => {
    component.error.set('Some error');
    component.toggleMode();
    expect(component.error()).toBe('');
  });

  it('toggleMode() to register makes firstName required', () => {
    component.toggleMode(); // now registering
    component.form.get('firstName')!.setValue('');
    component.form.get('firstName')!.markAsTouched();
    expect(component.isInvalid('firstName')).toBeTrue();
  });

  it('toggleMode() to login removes registration validators', () => {
    component.toggleMode(); // to register
    component.toggleMode(); // back to login
    component.form.get('firstName')!.setValue('');
    component.form.get('firstName')!.markAsTouched();
    expect(component.isInvalid('firstName')).toBeFalse();
  });

  // ── submit() — registration ───────────────────────────────────────────────

  it('submit() calls auth.register() when isRegistering is true and form is valid', () => {
    mockAuthService.register.and.returnValue(of({ success: true, message: '', username: 'newuser', email: 'a@b.com', patientId: 1 }));
    component.isRegistering.set(true);
    component.form.patchValue({
      username: 'newuser', password: 'password1',
      firstName: 'Mario', lastName: 'Rossi',
      fiscalCode: 'RSSMRA85T10A562S', birthDate: '1985-12-10',
      email: 'mario@example.com', phone: ''
    });
    component.submit();
    expect(mockAuthService.register).toHaveBeenCalled();
  });

  it('submit() sets error when register errors', () => {
    mockAuthService.register.and.returnValue(throwError(() => new Error()));
    component.isRegistering.set(true);
    component.form.patchValue({
      username: 'newuser', password: 'password1',
      firstName: 'Mario', lastName: 'Rossi',
      fiscalCode: 'RSSMRA85T10A562S', birthDate: '1985-12-10',
      email: 'mario@example.com'
    });
    component.submit();
    expect(component.error()).toBeTruthy();
    expect(component.loading()).toBeFalse();
  });
});
