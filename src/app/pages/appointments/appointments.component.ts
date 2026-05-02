import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe, NgClass, NgStyle } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { AppointmentService } from '../../services/appointment.service';
import { PatientService } from '../../services/patient.service';
import { SpecialistService } from '../../services/specialist.service';
import { AlertService } from '../../services/alert.service';
import { ConfirmModalService } from '../../services/confirm-modal.service';
import { AppointmentStatus, Patient, FitnessAppointment, FitnessAppointmentRequest, Specialist, ApiError } from '../../models/models';
import { TableThComponent, TableColumn } from '../../shared/table-th.component';
import { TableTdDirective } from '../../shared/table-td.directive';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { FormControlDirective } from '../../shared/form-control.directive';
import { FormLabelDirective } from '../../shared/form-label.directive';
import { COLOR_ACCENT, COLOR_SECONDARY, COLOR_PRIMARY } from '../../shared/constants/colors.constants';
import { FormValidationHelper } from '../../shared/form-validation.helper';
import { StatusBadgePipe } from '../../shared/status-badge.pipe';
import { APPOINTMENT_STATUS_LABELS } from '../../shared/constants/appointment-status.constants';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, NgClass, NgStyle, MatIconModule, TableThComponent, TableTdDirective, ButtonComponent, FormControlDirective, FormLabelDirective, StatusBadgePipe],
  templateUrl: './appointments.component.html'
})
export class AppointmentsComponent implements OnInit {

  readonly tableColumns = signal<TableColumn[]>([
    { label: 'Paziente' },
    { label: 'Data e Ora' },
    { label: 'Specialista' },
    { label: 'Servizio' },
    { label: 'Stato' },
    { label: 'Azioni', extraClass: 'w-[200px] min-w-[200px]' }
  ]);
  private readonly appointmentService = inject(AppointmentService);
  private readonly patientService     = inject(PatientService);
  private readonly specialistService  = inject(SpecialistService);
  private readonly alertSvc           = inject(AlertService);
  private readonly fb                 = inject(FormBuilder);
  private readonly route              = inject(ActivatedRoute);
  private readonly router             = inject(Router);
  private readonly confirmSvc         = inject(ConfirmModalService);

  protected readonly alertSignal = this.alertSvc.alert;

  readonly appointments     = signal<FitnessAppointment[]>([]);
  readonly patients         = signal<Patient[]>([]);
  readonly specialists      = signal<Specialist[]>([]);
  readonly loading          = signal(false);
  readonly filterStatus     = signal('');
  readonly showApptModal    = signal(false);
  readonly showStatusModal  = signal(false);
  readonly statusEditingId  = signal<number | null>(null);

  readonly fieldErrors = signal<Record<string, string>>({});

  readonly statuses: AppointmentStatus[] = ['BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

  readonly apptForm: FormGroup   = this.fb.group({
    patientId:    [null, Validators.required],
    specialistId: ['',   Validators.required],
    scheduledAt:  ['',   Validators.required],
    serviceType:  ['',   Validators.required],
    notes:        ['']
  });
  readonly statusForm: FormGroup = this.fb.group({ status: ['', Validators.required] });

  readonly roleColorMap = computed<Record<string, string>>(() => ({
    NUTRITIONIST:     COLOR_ACCENT,
    DIETOLOGIST:      COLOR_ACCENT,
    SPORT_DOCTOR:     COLOR_SECONDARY,
    PHYSIOTHERAPIST:  COLOR_SECONDARY,
    PERSONAL_TRAINER: COLOR_PRIMARY,
  }));

  protected readonly v = new FormValidationHelper(this.apptForm, this.fieldErrors);

  roleBadgeColor(role: string): string { return this.roleColorMap()[role] ?? COLOR_PRIMARY; }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.filterStatus.set(params['status'] ?? '');
      this.loadAll();
    });
  }

  loadAll(): void {
    this.loading.set(true);
    const filters: Record<string, string> = this.filterStatus() ? { status: this.filterStatus() } : {};
    forkJoin({
      appointments: this.appointmentService.getAll(filters),
      patients:     this.patientService.getAll(),
      specialists:  this.specialistService.getAll()
    }).subscribe({
      next: ({ appointments, patients, specialists }) => {
        this.appointments.set(appointments);
        this.patients.set(patients);
        this.specialists.set(specialists);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  load(): void {
    this.loading.set(true);
    const filters: Record<string, string> = this.filterStatus() ? { status: this.filterStatus() } : {};
    this.appointmentService.getAll(filters).subscribe({
      next: (data) => { this.appointments.set(data); this.loading.set(false); },
      error: ()    => { this.loading.set(false); }
    });
  }

  onStatusFilter(e: Event): void {
    const value = (e.target as HTMLSelectElement).value;
    this.filterStatus.set(value);
    this.router.navigate([], {
      queryParams: value ? { status: value } : {},
      replaceUrl: true
    });
    this.load();
  }

  openCreate(): void {
    this.apptForm.reset();
    this.fieldErrors.set({});
    this.showApptModal.set(true);
  }

  saveAppointment(): void {
    if (this.apptForm.invalid) { this.apptForm.markAllAsTouched(); return; }
    const value = this.apptForm.value;
    const scheduledAt = value.scheduledAt?.length === 16 ? value.scheduledAt + ':00' : value.scheduledAt;
    const body: FitnessAppointmentRequest = {
      patientId:    +value.patientId,
      specialistId: +value.specialistId,
      scheduledAt,
      serviceType:  value.serviceType,
      notes:        value.notes || null
    };
    this.appointmentService.create(body).subscribe({
      next: () => { this.alertSvc.show('Appuntamento prenotato!'); this.showApptModal.set(false); this.load(); },
      error: (err: HttpErrorResponse) => {
        const fieldErrors = (err.error as ApiError)?.fieldErrors;
        if (fieldErrors) this.fieldErrors.set(fieldErrors);
      }
    });
  }

  openStatusModal(appointment: FitnessAppointment): void {
    this.statusEditingId.set(appointment.id);
    this.statusForm.patchValue({ status: appointment.status });
    this.showStatusModal.set(true);
  }

  saveStatus(): void {
    if (!this.statusEditingId()) return;
    this.appointmentService.updateStatus(this.statusEditingId()!, this.statusForm.value.status).subscribe({
      next: () => { this.alertSvc.show('Stato aggiornato!'); this.showStatusModal.set(false); this.load(); }
    });
  }

  cancel(id: number): void {
    this.confirmSvc.open('Annullare questo appuntamento?', () => {
      this.appointmentService.delete(id).subscribe({
        next: () => { this.alertSvc.show('Appuntamento annullato.'); this.load(); }
      });
    });
  }

  canCancel(appointment: FitnessAppointment): boolean {
    return appointment.status === 'BOOKED' || appointment.status === 'CONFIRMED';
  }

  private readonly roleLabels: Record<string, string> = {
    NUTRITIONIST:        'Biologa Nutrizionista',
    PERSONAL_TRAINER:    'Personal Trainer',
    SPORT_DOCTOR:        'Medico dello Sport',
    OSTEOPATH:           'Osteopata',
    SPORTS_NUTRITIONIST: 'Nutrizionista Sportiva',
    DIETOLOGIST:         'Dietologa',
    PHYSIOTHERAPIST:     'Fisioterapista',
  };

  roleLabel(role: string): string    { return this.roleLabels[role] ?? role; }
  statusLabel(status: string): string { return APPOINTMENT_STATUS_LABELS[status] ?? status; }
}
