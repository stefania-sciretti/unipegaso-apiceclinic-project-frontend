import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { DietPlanService } from '../../services/diet-plan.service';
import { PatientService } from '../../services/patient.service';
import { SpecialistService } from '../../services/specialist.service';
import { AlertService } from '../../services/alert.service';
import { ConfirmModalService } from '../../services/confirm-modal.service';
import { Patient, DietPlan, DietPlanRequest, ApiError } from '../../models/models';
import { TableThComponent, TableColumn } from '../../shared/table-th.component';
import { TableTdDirective } from '../../shared/table-td.directive';
import { BtnDirective } from '../../shared/btn.directive';
import { FormControlDirective } from '../../shared/form-control.directive';
import { FormLabelDirective } from '../../shared/form-label.directive';
import { FormValidationHelper } from '../../shared/form-validation.helper';

@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, TableThComponent, TableTdDirective, BtnDirective, FormControlDirective, FormLabelDirective],
  templateUrl: './nutrition.component.html'
})
export class NutritionComponent implements OnInit {

  readonly tableColumns = signal<TableColumn[]>([
    { label: 'Paziente' },
    { label: 'Titolo' },
    { label: 'Calorie' },
    { label: 'Durata' },
    { label: 'Stato' },
    { label: 'Azioni' }
  ]);
  private readonly dietPlanService   = inject(DietPlanService);
  private readonly patientService    = inject(PatientService);
  private readonly specialistService = inject(SpecialistService);
  private readonly alertSvc          = inject(AlertService);
  private readonly fb                = inject(FormBuilder);
  private readonly confirmSvc        = inject(ConfirmModalService);

  protected readonly alertSignal = this.alertSvc.alert;

  readonly plans          = signal<DietPlan[]>([]);
  readonly patients       = signal<Patient[]>([]);
  readonly nutritionistId = signal(0);
  readonly loading        = signal(false);
  readonly showModal      = signal(false);
  readonly editingId      = signal<number | null>(null);
  readonly filterActive   = signal('');

  readonly filtered = computed(() => {
    const fa = this.filterActive();
    if (fa === 'true')  return this.plans().filter(p => p.active);
    if (fa === 'false') return this.plans().filter(p => !p.active);
    return this.plans();
  });

  readonly fieldErrors = signal<Record<string, string>>({});

  readonly form: FormGroup = this.fb.group({
    patientId:     [null, Validators.required],
    title:         ['',   Validators.required],
    description:   [''],
    calories:      [null],
    durationWeeks: [null],
    active:        [true]
  });

  protected readonly v = new FormValidationHelper(this.form, this.fieldErrors);

  ngOnInit(): void {
    forkJoin({
      plans:       this.dietPlanService.getAll(),
      patients:    this.patientService.getAll(),
      specialists: this.specialistService.getAll('NUTRITIONIST')
    }).subscribe(({ plans, patients, specialists }) => {
      this.plans.set(plans);
      this.patients.set(patients);
      this.nutritionistId.set(specialists[0]?.id ?? 1);
    });
  }

  load(): void {
    this.loading.set(true);
    this.dietPlanService.getAll().subscribe({
      next: (data) => { this.plans.set(data); this.loading.set(false); },
      error: ()    => { this.loading.set(false); }
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ active: true });
    this.fieldErrors.set({});
    this.showModal.set(true);
  }

  openEdit(plan: DietPlan): void {
    this.editingId.set(plan.id);
    this.fieldErrors.set({});
    this.form.patchValue({
      patientId:     plan.patientId,
      title:         plan.title,
      description:   plan.description ?? '',
      calories:      plan.calories,
      durationWeeks: plan.durationWeeks,
      active:        plan.active
    });
    this.showModal.set(true);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.value;
    const body: DietPlanRequest = {
      patientId:     +value.patientId,
      specialistId:  this.nutritionistId(),
      title:         value.title,
      description:   value.description || null,
      calories:      value.calories || null,
      durationWeeks: value.durationWeeks || null,
      active:        value.active ?? true
    };
    const id = this.editingId();
    const req$ = id ? this.dietPlanService.update(id, body) : this.dietPlanService.create(body);
    req$.subscribe({
      next: () => {
        this.alertSvc.show(id ? 'Piano aggiornato!' : 'Piano creato!');
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
    this.confirmSvc.open('Eliminare questo piano dieta?', () => {
      this.dietPlanService.delete(id).subscribe({
        next: () => { this.alertSvc.show('Piano eliminato.'); this.load(); }
      });
    });
  }
}
