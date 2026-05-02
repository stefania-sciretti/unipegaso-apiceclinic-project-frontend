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
import { BtnDirective } from '../../shared/btn.directive';
import { FormControlDirective } from '../../shared/form-control.directive';
import { FormLabelDirective } from '../../shared/form-label.directive';
import { COLOR_ACCENT, COLOR_SECONDARY, COLOR_PRIMARY } from '../../shared/constants/colors.constants';

@Component({
  selector: 'app-appointments',
  imports: [ReactiveFormsModule, DatePipe, NgClass, NgStyle, MatIconModule, TableThComponent, TableTdDirective, BtnDirective, FormControlDirective, FormLabelDirective],
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

  appointments: FitnessAppointment[] = [];
  patients: Patient[]    = [];
  specialists: Specialist[] = [];
  loading            = false;
  filterStatus       = '';
  showApptModal      = false;
  showStatusModal    = false;
  statusEditingId: number | null = null;

  readonly fieldErrors = signal<Record<string, string>>({});

  readonly statuses: AppointmentStatus[] = ['BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

  private readonly statusLabels: Record<string, string> = {
    BOOKED: 'Prenotato', CONFIRMED: 'Confermato',
    COMPLETED: 'Completato', CANCELLED: 'Annullato'
  };

  readonly apptForm: FormGroup   = this.fb.group({
    patientId:   [null, Validators.required],
    specialistId: ['',  Validators.required],
    scheduledAt: ['',   Validators.required],
    serviceType: ['',   Validators.required],
    notes:       ['']
  });
  readonly statusForm: FormGroup = this.fb.group({ status: ['', Validators.required] });

  /**
   * Maps a specialistRole string to a brand hex color.
   * NUTRITIONIST / DIETOLOGIST  → COLOR_ACCENT    (green  #2EE1A0)
   * SPORT_DOCTOR / PHYSIOTHERAPIST → COLOR_SECONDARY (blue #2DB1E6)
   * PERSONAL_TRAINER            → COLOR_PRIMARY   (dark blue #1570B6)
   */
  readonly roleColorMap = computed<Record<string, string>>(() => ({
    NUTRITIONIST:      COLOR_ACCENT,
    DIETOLOGIST:       COLOR_ACCENT,
    SPORT_DOCTOR:      COLOR_SECONDARY,
    PHYSIOTHERAPIST:   COLOR_SECONDARY,
    PERSONAL_TRAINER:  COLOR_PRIMARY,
  }));

  roleBadgeColor(role: string): string {
    return this.roleColorMap()[role] ?? COLOR_PRIMARY;
  }

  constructor() {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.filterStatus = params['status'] ?? '';
      // Single load: fetches appointments + patients + specialists in parallel once.
      this.loadAll();
    });
  }

  /** Single consolidated load: one appointments call + side-data in parallel. */
  loadAll(): void {
    this.loading = true;
    const filters: { [key: string]: string } = this.filterStatus ? { status: this.filterStatus } : {};
    forkJoin({
      appointments: this.appointmentService.getAll(filters),
      patients:     this.patientService.getAll(),
      specialists:  this.specialistService.getAll()
    }).subscribe({
      next: ({ appointments, patients, specialists }) => {
        this.appointments = appointments;
        this.patients     = patients;
        this.specialists  = specialists;
        this.loading      = false;
      },
      error: () => { this.loading = false; }
    });
  }

  /** Lightweight reload after mutations (reuses cached patients/specialists). */
  load(): void {
    this.loading = true;
    const filters: { [key: string]: string } = this.filterStatus ? { status: this.filterStatus } : {};
    this.appointmentService.getAll(filters).subscribe({
      next: (data) => { this.appointments = data; this.loading = false; },
      error: ()    => { this.loading = false; }
    });
  }

  onStatusFilter(e: Event): void {
    this.filterStatus = (e.target as HTMLSelectElement).value;
    this.router.navigate([], {
      queryParams: this.filterStatus ? { status: this.filterStatus } : {},
      replaceUrl: true
    });
    this.load();
  }

  openCreate(): void {
    this.apptForm.reset();
    this.fieldErrors.set({});
    this.showApptModal = true;
  }

  saveAppointment(): void {
    if (this.apptForm.invalid) { this.apptForm.markAllAsTouched(); return; }
    const value = this.apptForm.value;
    const scheduledAt = value.scheduledAt?.length === 16 ? value.scheduledAt + ':00' : value.scheduledAt;
    const body: FitnessAppointmentRequest = {
      patientId:    +value.patientId,
      specialistId: +value.specialistId,
      scheduledAt,
      serviceType: value.serviceType,
      notes:       value.notes || null
    };
    this.appointmentService.create(body).subscribe({
      next: () => { this.alertSvc.show('Appuntamento prenotato!'); this.showApptModal = false; this.load(); },
      error: (err: HttpErrorResponse) => {
        const fieldErrors = (err.error as ApiError)?.fieldErrors;
        if (fieldErrors) this.fieldErrors.set(fieldErrors);
      }
    });
  }

  openStatusModal(appointment: FitnessAppointment): void {
    this.statusEditingId = appointment.id;
    this.statusForm.patchValue({ status: appointment.status });
    this.showStatusModal = true;
  }

  saveStatus(): void {
    if (!this.statusEditingId) return;
    this.appointmentService.updateStatus(this.statusEditingId, this.statusForm.value.status).subscribe({
      next: () => { this.alertSvc.show('Stato aggiornato!'); this.showStatusModal = false; this.load(); }
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

  roleLabel(role: string): string   { return this.roleLabels[role] ?? role; }
  statusLabel(status: string): string { return this.statusLabels[status] ?? status; }
  statusClass(status: string): string {
    const base = 'inline-block px-[0.65rem] py-[0.2rem] rounded-xl text-[0.75rem] font-bold uppercase tracking-[0.5px]';
    const colors: Record<string, string> = {
      booked:    'bg-[#ddeefa] text-[#1a5680]',
      confirmed: 'bg-[#d4f0e0] text-[#1e7a48]',
      completed: 'bg-[#e8f4fd] text-[#112D4E]',
      cancelled: 'bg-[#fde8e8] text-[#d95550]',
    };
    return `${base} ${colors[status.toLowerCase()] ?? 'bg-[#f0f0f0] text-[#555]'}`;
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  fieldError(field: string): string | null {
    return this.fieldErrors()[field] ?? null;
  }
}
