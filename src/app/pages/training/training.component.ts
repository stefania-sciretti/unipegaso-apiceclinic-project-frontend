import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { TrainingPlanService } from '../../services/training-plan.service';
import { PatientService } from '../../services/patient.service';
import { SpecialistService } from '../../services/specialist.service';
import { AlertService } from '../../services/alert.service';
import { ConfirmModalService } from '../../services/confirm-modal.service';
import { Patient, TrainingPlan, TrainingPlanRequest, ApiError } from '../../models/models';
import { TableThComponent, TableColumn } from '../../shared/table-th.component';
import { TableTdDirective } from '../../shared/table-td.directive';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { FormControlDirective } from '../../shared/form-control.directive';
import { FormLabelDirective } from '../../shared/form-label.directive';
import { FormValidationHelper } from '../../shared/form-validation.helper';

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, NgClass, TableThComponent, TableTdDirective, ButtonComponent, FormControlDirective, FormLabelDirective],
  templateUrl: './training.component.html'
})
export class TrainingComponent implements OnInit {

  readonly tableColumns = signal<TableColumn[]>([
    { label: 'Paziente' },
    { label: 'Titolo' },
    { label: 'Durata' },
    { label: 'Sessioni/Sett.' },
    { label: 'Stato' },
    { label: 'Azioni' }
  ]);
  private readonly trainingPlanService = inject(TrainingPlanService);
  private readonly patientService      = inject(PatientService);
  private readonly specialistService   = inject(SpecialistService);
  private readonly alertSvc            = inject(AlertService);
  private readonly fb                  = inject(FormBuilder);
  private readonly confirmSvc          = inject(ConfirmModalService);

  protected readonly alertSignal = this.alertSvc.alert;

  readonly plans             = signal<TrainingPlan[]>([]);
  readonly patients          = signal<Patient[]>([]);
  readonly personalTrainerId = signal(0);
  readonly loading           = signal(false);
  readonly showModal         = signal(false);
  readonly showDetail        = signal(false);
  readonly editingId         = signal<number | null>(null);
  readonly selected          = signal<TrainingPlan | null>(null);
  readonly filterActive      = signal('');
  readonly filterPatientId   = signal('');

  readonly filtered = computed(() => {
    let list = this.plans();
    if (this.filterActive() === 'true')  list = list.filter(p => p.active);
    if (this.filterActive() === 'false') list = list.filter(p => !p.active);
    if (this.filterPatientId()) list = list.filter(p => p.patientId === +this.filterPatientId());
    return list;
  });

  readonly fieldErrors = signal<Record<string, string>>({});

  readonly form: FormGroup = this.fb.group({
    patientId:       [null, Validators.required],
    title:           ['',   Validators.required],
    description:     [''],
    weeks:           [null],
    sessionsPerWeek: [null],
    active:          [true]
  });

  protected readonly v = new FormValidationHelper(this.form, this.fieldErrors);

  ngOnInit(): void {
    forkJoin({
      plans:       this.trainingPlanService.getAll(),
      patients:    this.patientService.getAll(),
      specialists: this.specialistService.getAll('PERSONAL_TRAINER')
    }).subscribe(({ plans, patients, specialists }) => {
      this.plans.set(plans);
      this.patients.set(patients);
      this.personalTrainerId.set(specialists[0]?.id ?? 2);
    });
  }

  load(): void {
    this.loading.set(true);
    this.trainingPlanService.getAll().subscribe({
      next: (data) => { this.plans.set(data); this.loading.set(false); },
      error: ()    => { this.loading.set(false); }
    });
  }

  openDetail(plan: TrainingPlan): void { this.selected.set(plan); this.showDetail.set(true); }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ active: true });
    this.fieldErrors.set({});
    this.showModal.set(true);
  }

  openEdit(plan: TrainingPlan): void {
    this.editingId.set(plan.id);
    this.fieldErrors.set({});
    this.form.patchValue({
      patientId:       plan.patientId,
      title:           plan.title,
      description:     plan.description ?? '',
      weeks:           plan.weeks,
      sessionsPerWeek: plan.sessionsPerWeek,
      active:          plan.active
    });
    this.showModal.set(true);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.value;
    const body: TrainingPlanRequest = {
      patientId:       +value.patientId,
      specialistId:    this.personalTrainerId(),
      title:           value.title,
      description:     value.description || null,
      weeks:           value.weeks || null,
      sessionsPerWeek: value.sessionsPerWeek || null,
      active:          value.active ?? true
    };
    const id = this.editingId();
    const req$ = id ? this.trainingPlanService.update(id, body) : this.trainingPlanService.create(body);
    req$.subscribe({
      next: () => {
        this.alertSvc.show(id ? 'Scheda aggiornata!' : 'Scheda creata!');
        this.showModal.set(false);
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        const fieldErrors = (err.error as ApiError)?.fieldErrors;
        if (fieldErrors) this.fieldErrors.set(fieldErrors);
      }
    });
  }

  delete(id: number): void {
    this.confirmSvc.open('Eliminare questa scheda di allenamento?', () => {
      this.trainingPlanService.delete(id).subscribe({
        next: () => { this.alertSvc.show('Scheda eliminata.'); this.load(); }
      });
    });
  }
}
