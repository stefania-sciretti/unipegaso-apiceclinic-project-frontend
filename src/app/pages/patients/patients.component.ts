import { Component, inject, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, merge, startWith, Subject, switchMap, tap, catchError, of } from 'rxjs';
import { Patient, PatientRequest } from '../../models/models';
import { PatientService } from '../../services/patient.service';
import { AlertService } from '../../services/alert.service';
import { ConfirmModalService } from '../../services/confirm-modal.service';
import { TableThComponent, TableColumn } from '../../shared/table-th.component';
import { TableTdDirective } from '../../shared/table-td.directive';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { FormControlDirective } from '../../shared/form-control.directive';
import { FormLabelDirective } from '../../shared/form-label.directive';
import { PaginationComponent } from '../../shared/pagination.component';
import { usePagination } from '../../shared/use-pagination';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, DatePipe, TableThComponent, TableTdDirective, ButtonComponent, FormControlDirective, FormLabelDirective, PaginationComponent],
  templateUrl: './patients.component.html'
})
export class PatientsComponent {

  readonly tableColumns = signal<TableColumn[]>([
    { label: 'Cognome e Nome' },
    { label: 'Codice Fiscale' },
    { label: 'Data di Nascita' },
    { label: 'Email' },
    { label: 'Telefono' },
    { label: 'Azioni' }
  ]);
  private readonly patientService = inject(PatientService);
  private readonly alertSvc       = inject(AlertService);
  private readonly fb             = inject(FormBuilder);
  private readonly confirmSvc     = inject(ConfirmModalService);

  protected readonly alertSignal = this.alertSvc.alert;

  protected readonly loading   = signal(false);
  protected readonly hasError  = signal(false);
  protected readonly showModal = signal(false);
  protected readonly editingId = signal<number | null>(null);

  private readonly search$  = new Subject<string>();
  private readonly reload$  = new Subject<void>();

  protected readonly patients = toSignal(
    merge(
      this.search$.pipe(debounceTime(300)),
      this.reload$.pipe(startWith(undefined))
    ).pipe(
      switchMap(term => {
        const query = typeof term === 'string' ? term : '';
        if (typeof term !== 'string') { this.loading.set(true); }
        this.hasError.set(false);
        const req$ = query ? this.patientService.search(query) : this.patientService.getAll();
        return req$.pipe(
          tap(() => this.loading.set(false)),
          catchError(() => {
            this.loading.set(false);
            this.hasError.set(true);
            return of([]);
          })
        );
      }),
      takeUntilDestroyed()
    ),
    { initialValue: [] as Patient[] }
  );

  /** Paginazione: 30 elementi per pagina, contatore "visualizzati/totale" */
  protected readonly pg = usePagination(this.patients);

  readonly form: FormGroup = this.fb.group({
    firstName:  ['', Validators.required],
    lastName:   ['', Validators.required],
    fiscalCode: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16)]],
    birthDate:  ['', Validators.required],
    email:      ['', [Validators.required, Validators.email]],
    phone:      ['']
  });

  openCreate(): void { this.editingId.set(null); this.form.reset(); this.showModal.set(true); }

  openEdit(patient: Patient): void {
    this.editingId.set(patient.id);
    this.form.patchValue({
      firstName:  patient.firstName,
      lastName:   patient.lastName,
      fiscalCode: patient.fiscalCode,
      birthDate:  patient.birthDate,
      email:      patient.email,
      phone:      patient.phone ?? ''
    });
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.value;
    const body: PatientRequest = {
      firstName:  value.firstName,
      lastName:   value.lastName,
      fiscalCode: value.fiscalCode.toUpperCase(),
      birthDate:  value.birthDate,
      email:      value.email,
      phone:      value.phone || null
    };
    const id = this.editingId();
    const req$ = id ? this.patientService.update(id, body) : this.patientService.create(body);
    req$.subscribe({
      next: () => {
        this.alertSvc.show(id ? 'Paziente aggiornato' : 'Paziente creato');
        this.closeModal();
        this.reload$.next();
      }
    });
  }

  delete(id: number): void {
    this.confirmSvc.open('Eliminare questo paziente?', () => {
      this.patientService.delete(id).subscribe({
        next: () => { this.alertSvc.show('Paziente eliminato'); this.reload$.next(); }
      });
    });
  }

  onSearch(e: Event): void {
    this.search$.next((e.target as HTMLInputElement).value.trim());
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}
