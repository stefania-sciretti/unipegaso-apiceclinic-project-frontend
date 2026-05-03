import { Component, inject, signal, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest } from '../../services/auth.service';
import { BookingService, PendingBooking } from '../../services/booking.service';
import { AppointmentService } from '../../services/appointment.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonComponent } from '../../components/ui/button/button.component';

const FISCAL_CODE_PATTERN = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgClass, ButtonComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  private readonly fb             = inject(FormBuilder);
  private readonly auth           = inject(AuthService);
  private readonly router         = inject(Router);
  private readonly bookingSvc     = inject(BookingService);
  private readonly appointmentSvc = inject(AppointmentService);

  readonly error         = signal('');
  readonly loading       = signal(false);
  readonly isRegistering = signal(false);
  readonly showPassword  = signal(false);

  readonly form: FormGroup = this.fb.group({
    username:   ['', Validators.required],
    password:   ['', [Validators.required, Validators.minLength(8)]],
    firstName:  [''],
    lastName:   [''],
    fiscalCode: [''],
    birthDate:  [''],
    email:      [''],
    phone:      ['']
  });

  ngOnInit(): void {
    if (this.auth.isLoggedIn) {
      this.router.navigate(['/homepage']);
    }
  }

  toggleMode(): void {
    this.isRegistering.update(v => !v);
    this.error.set('');
    this.form.reset();

    const registerFields: Record<string, any[]> = {
      firstName:  [Validators.required],
      lastName:   [Validators.required],
      fiscalCode: [Validators.required, Validators.pattern(FISCAL_CODE_PATTERN)],
      birthDate:  [Validators.required],
      email:      [Validators.required, Validators.email]
    };

    if (this.isRegistering()) {
      Object.entries(registerFields).forEach(([name, validators]) => {
        this.form.get(name)!.addValidators(validators);
      });
    } else {
      Object.keys(registerFields).forEach(name => {
        this.form.get(name)!.clearValidators();
      });
    }
    Object.keys(registerFields).forEach(name =>
      this.form.get(name)!.updateValueAndValidity()
    );
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');
    if (this.isRegistering()) {
      this.register();
    } else {
      this.login();
    }
  }

  private login(): void {
    const { username, password } = this.form.value;
    this.auth.login(username, password).subscribe({
      next: (ok) => {
        this.loading.set(false);
        if (ok) {
          const pending = this.bookingSvc.pendingBooking;
          if (pending) {
            this.completePendingBooking(pending);
          } else {
            this.router.navigate(['/homepage']);
          }
        } else {
          this.error.set('Credenziali non valide. Riprova.');
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Credenziali non valide. Riprova.');
      }
    });
  }

  private register(): void {
    const v = this.form.value;
    const request: RegisterRequest = {
      firstName:  v.firstName.trim(),
      lastName:   v.lastName.trim(),
      fiscalCode: v.fiscalCode.trim().toUpperCase(),
      birthDate:  v.birthDate,
      email:      v.email.trim().toLowerCase(),
      phone:      v.phone?.trim() || undefined,
      username:   v.username,
      password:   v.password
    };
    this.auth.register(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.isRegistering.set(false);
        this.form.reset();
        this.error.set('');
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Dati non validi o già esistenti. Riprova.');
      }
    });
  }

  private completePendingBooking(pending: PendingBooking): void {
    const bookingRequest = {
      patientId:    this.auth.currentUser!.id,
      specialistId: pending.specialistId,
      scheduledAt:  pending.scheduledAt,
      serviceType:  pending.serviceType
    };

    if (pending.appointmentType === 'clinical') {
      alert('Prenotazione completata con successo!');
      this.bookingSvc.clearPendingBooking();
      this.router.navigate(['/homepage']);
    } else {
      this.appointmentSvc.create(bookingRequest).subscribe({
        next: () => {
          alert('Prenotazione completata con successo!');
          this.bookingSvc.clearPendingBooking();
          this.router.navigate(['/homepage']);
        },
        error: (err: HttpErrorResponse) => {
          alert('Errore nel completamento della prenotazione: ' + (err.error?.message ?? 'Riprova più tardi'));
          this.router.navigate(['/homepage']);
        }
      });
    }
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }
}
