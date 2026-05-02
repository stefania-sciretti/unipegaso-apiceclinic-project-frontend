import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { GlycemiaService } from '../../services/glycemia.service';
import { PatientService } from '../../services/patient.service';
import { SpecialistService } from '../../services/specialist.service';
import { AlertService } from '../../services/alert.service';
import { ConfirmModalService } from '../../services/confirm-modal.service';
import { Patient, GlycemiaContext, GlycemiaMeasurement, GlycemiaMeasurementRequest, GlycemiaContextRule, ApiError } from '../../models/models';
import { TableThComponent, TableColumn } from '../../shared/table-th.component';
import { TableTdDirective } from '../../shared/table-td.directive';
import { BtnDirective } from '../../shared/btn.directive';
import { FormControlDirective } from '../../shared/form-control.directive';
import { FormLabelDirective } from '../../shared/form-label.directive';

@Component({
  selector: 'app-glycemia',
  imports: [ReactiveFormsModule, DatePipe, NgClass, TableThComponent, TableTdDirective, BtnDirective, FormControlDirective, FormLabelDirective],
  templateUrl: './glycemia.component.html'
})
export class GlycemiaComponent implements OnInit {

  readonly tableColumns = signal<TableColumn[]>([
    { label: 'Paziente' },
    { label: 'Data/Ora' },
    { label: 'Valore (mg/dL)' },
    { label: 'Contesto' },
    { label: 'Classificazione' },
    { label: 'Note' },
    { label: 'Azioni' }
  ]);
  private readonly glycemiaService = inject(GlycemiaService);
  private readonly patientService  = inject(PatientService);
  private readonly specialistService = inject(SpecialistService);
  private readonly alertSvc        = inject(AlertService);
  private readonly fb              = inject(FormBuilder);
  private readonly confirmSvc      = inject(ConfirmModalService);

  protected readonly alertSignal = this.alertSvc.alert;

  readonly measurements         = signal<GlycemiaMeasurement[]>([]);
  readonly searchQuery          = signal('');
  readonly filteredMeasurements = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return q ? this.measurements().filter(m =>
      `${m.patientLastName} ${m.patientFirstName}`.toLowerCase().includes(q)
    ) : this.measurements();
  });

  patients: Patient[] = [];
  nutritionistId = 0;
  loading        = false;
  showModal      = false;
  editingId: number | null = null;

  readonly fieldErrors = signal<Record<string, string>>({});
  readonly classificationRules = signal<GlycemiaContextRule[]>([]);

  readonly contexts: { value: GlycemiaContext; label: string }[] = [
    { value: 'A_DIGIUNO',      label: 'A digiuno'      },
    { value: 'POST_PASTO_1H', label: 'Post-pasto 1h'  },
    { value: 'POST_PASTO_2H', label: 'Post-pasto 2h'  },
    { value: 'RANDOM',       label: 'Casuale'         }
  ];

  form!: FormGroup;

  constructor() {}

  ngOnInit(): void {
    this.buildForm();
    this.load();
    this.glycemiaService.getClassificationRules().subscribe({
      next: ({ contexts }) => this.classificationRules.set(contexts)
    });
  }

  load(): void {
    this.loading = true;
    forkJoin({
      measurements: this.glycemiaService.getAll(),
      patients:     this.patientService.getAll(),
      specialists:  this.specialistService.getAll('NUTRITIONIST')
    }).subscribe({
      next: ({ measurements, patients, specialists }) => {
        this.measurements.set(measurements);
        this.patients       = patients;
        this.nutritionistId = specialists[0]?.id ?? 1;
        this.loading        = false;
      },
      error: () => { this.loading = false; }
    });
  }

  buildForm(): void {
    const now      = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    this.form = this.fb.group({
      patientId:  [null,       Validators.required],
      measuredAt: [localIso,   Validators.required],
      valueMgDl:  [null,       [Validators.required, Validators.min(20), Validators.max(600)]],
      context:    ['A_DIGIUNO',  Validators.required],
      notes:      ['']
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.fieldErrors.set({});
    this.buildForm();
    this.showModal = true;
  }

  openEdit(measurement: GlycemiaMeasurement): void {
    this.editingId = measurement.id;
    this.fieldErrors.set({});
    this.form.patchValue({
      patientId:  measurement.patientId,
      measuredAt: measurement.measuredAt.slice(0, 16),
      valueMgDl:  measurement.valueMgDl,
      context:    measurement.context,
      notes:      measurement.notes ?? ''
    });
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.value;
    const body: GlycemiaMeasurementRequest = {
      patientId:  +value.patientId,
      specialistId: this.nutritionistId,
      measuredAt: value.measuredAt,
      valueMgDl:  +value.valueMgDl,
      context:    value.context,
      notes:      value.notes || null
    };
    const req$ = this.editingId ? this.glycemiaService.update(this.editingId, body) : this.glycemiaService.create(body);
    req$.subscribe({
      next: () => {
        this.alertSvc.show(this.editingId ? 'Misurazione aggiornata' : 'Misurazione registrata');
        this.closeModal();
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        const fieldErrors = (err.error as ApiError)?.fieldErrors;
        if (fieldErrors) this.fieldErrors.set(fieldErrors);
      }
    });
  }

  delete(id: number): void {
    this.confirmSvc.open('Eliminare questa misurazione?', () => {
      this.glycemiaService.delete(id).subscribe({
        next: () => { this.alertSvc.show('Misurazione eliminata'); this.load(); }
      });
    });
  }

  patientName(m: GlycemiaMeasurement): string {
    if (m.patientFirstName || m.patientLastName)
      return `${m.patientLastName} ${m.patientFirstName}`.trim();
    const p = this.patients.find(pt => pt.id === m.patientId);
    return p ? `${p.firstName} ${p.lastName}` : '–';
  }

  contextLabel(context: string): string {
    return this.contexts.find(c => c.value === context)?.label ?? context;
  }

  badgeClass(classification: string): string {
    const map: Record<string, string> = {
      NORMALE:    'badge-success',
      ATTENZIONE: 'badge-warning',
      ELEVATA:    'badge-danger',
    };
    return map[classification] ?? '';
  }

  classColor(classification: string): string {
    const base = 'inline-block px-[0.65rem] py-[0.2rem] rounded-xl text-[0.75rem] font-bold uppercase tracking-[0.5px]';
    const map: Record<string, string> = {
      NORMALE:    'bg-[#d4f0e0] text-[#1e7a48]',
      ATTENZIONE: 'bg-[#fef3cd] text-[#856404]',
      ELEVATA:    'bg-[#fde8e8] text-[#d95550]',
    };
    return `${base} ${map[classification] ?? 'bg-[#f0f0f0] text-[#555]'}`;
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  fieldError(field: string): string | null {
    return this.fieldErrors()[field] ?? null;
  }
}
