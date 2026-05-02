import { Component, inject, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BookingService, PendingBooking } from '../../services/booking.service';
import { AppointmentService } from '../../services/appointment.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonComponent } from '../../components/ui/button/button.component';

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

  error           = '';
  loading         = false;
  isRegistering   = false;
  showPassword    = false;

  readonly form: FormGroup = this.fb.group({
    username:    ['', Validators.required],
    password:    ['', Validators.required],
    displayName: ['']   // required only when registering; validator added dynamically
  });

  constructor() {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }
  }

  toggleMode(): void {
    this.isRegistering = !this.isRegistering;
    this.error = '';
    this.form.reset();
    const ctrl = this.form.get('displayName')!;
    if (this.isRegistering) {
      ctrl.addValidators(Validators.required);
    } else {
      ctrl.removeValidators(Validators.required);
    }
    ctrl.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error   = '';
    if (this.isRegistering) {
      this.register();
    } else {
      this.login();
    }
  }

  private login(): void {
    const { username, password } = this.form.value;
    this.auth.login(username, password).subscribe({
      next: (ok) => {
        this.loading = false;
        if (ok) {
          const pending = this.bookingSvc.pendingBooking;
          if (pending) {
            this.completePendingBooking(pending);
          } else {
            this.router.navigate(['/dashboard']);
          }
        } else {
          this.error = 'Credenziali non valide. Riprova.';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Credenziali non valide. Riprova.';
      }
    });
  }

  private register(): void {
    const { username, password, displayName } = this.form.value;
    this.auth.register(username, password, displayName).subscribe({
      next: () => {
        this.loading = false;
        alert('Registrazione completata! Effettua il login.');
        this.isRegistering = false;
        this.form.reset();
      },
      error: () => {
        this.loading = false;
        this.error = 'Username già esistente o dati non validi.';
      }
    });
  }

  private completePendingBooking(pending: PendingBooking): void {
    const bookingRequest = {
      patientId:    this.auth.currentUser!.id,
      specialistId: pending.specialistId,
      scheduledAt: pending.scheduledAt,
      serviceType: pending.serviceType
    };

    if (pending.appointmentType === 'clinical') {
      alert('Prenotazione completata con successo!');
      this.bookingSvc.clearPendingBooking();
      this.router.navigate(['/dashboard']);
    } else {
      this.appointmentSvc.create(bookingRequest).subscribe({
        next: () => {
          alert('Prenotazione completata con successo!');
          this.bookingSvc.clearPendingBooking();
          this.router.navigate(['/dashboard']);
        },
        error: (err: HttpErrorResponse) => {
          alert('Errore nel completamento della prenotazione: ' + (err.error?.message ?? 'Riprova più tardi'));
          this.router.navigate(['/dashboard']);
        }
      });
    }
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }
}
