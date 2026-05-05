import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Report, ReportService } from '../../services/report.service';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { ClinicalAppointmentService } from '../../services/clinical-appointment.service';
import { ClinicalAppointment } from '../../models/models';
import { TableThComponent, TableColumn } from '../../shared/table-th.component';
import { TableTdDirective } from '../../shared/table-td.directive';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { FormControlDirective } from '../../shared/form-control.directive';
import { FormLabelDirective } from '../../shared/form-label.directive';


@Component({
  selector: 'app-reports',
  imports: [ReactiveFormsModule, DatePipe, NgClass, SlicePipe, TableThComponent, TableTdDirective, ButtonComponent, FormControlDirective, FormLabelDirective],
  templateUrl: './reports.component.html'
})
export class ReportsComponent implements OnInit {

  readonly tableColumns = computed<TableColumn[]>(() => [
    ...(this.auth.isAdmin ? [{ label: 'Paziente' }] : []),
    { label: 'Specialista' },
    { label: 'Tipo Visita' },
    { label: 'Data Emissione' },
    { label: 'Diagnosi (sintesi)' },
    { label: 'Azioni', extraClass: 'w-[200px] min-w-[200px]' }
  ]);
  private readonly auth                       = inject(AuthService);
  private readonly reportService              = inject(ReportService);
  private readonly clinicalAppointmentService = inject(ClinicalAppointmentService);
  private readonly alertSvc                   = inject(AlertService);
  private readonly fb                         = inject(FormBuilder);

  protected readonly alertSignal = this.alertSvc.alert;

  reports: Report[]                           = [];
  completedAppointments: ClinicalAppointment[] = [];
  loading          = false;
  showFormModal    = false;
  showDetailModal  = false;
  editingId: number | null = null;
  selectedReport: Report | null = null;

  readonly form: FormGroup = this.fb.group({
    appointmentId: [null, Validators.required],
    diagnosis:     ['',   Validators.required],
    prescription:  [''],
    doctorNotes:   ['']
  });

  protected get isAdmin(): boolean { return this.auth.isAdmin; }

  protected get isSelectedAppointmentUsed(): boolean {
    const selectedId = this.form.get('appointmentId')?.value;
    if (!selectedId) return false;
    return this.completedAppointments.find(a => a.id === +selectedId)?.hasReport ?? false;
  }

  constructor() {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    const patientId = !this.auth.isAdmin ? this.auth.patientId : undefined;
    this.reportService.getAll(patientId).pipe(
      catchError(() => of([]))
    ).subscribe({
      next: (data) => {
        this.reports = data;
        this.loading = false;
      },
      error: () => { this.reports = []; this.loading = false; }
    });
  }

  loadCompletedAppointments(): void {
    this.clinicalAppointmentService.getAll({ status: 'COMPLETED' }).pipe(
      catchError(() => of([]))
    ).subscribe(appointments => {
      this.completedAppointments = appointments;
    });
  }

  openCreate(): void {
    if (!this.auth.isAdmin) return;
    this.editingId = null;
    this.form.reset();
    this.loadCompletedAppointments();
    this.showFormModal = true;
  }

  openEdit(report: Report): void {
    if (!this.auth.isAdmin) return;
    this.editingId     = report.id;
    this.selectedReport = report;
    this.completedAppointments = [];
    this.form.patchValue({
      appointmentId: report.appointmentId,
      diagnosis:     report.diagnosis,
      prescription:  report.prescription ?? '',
      doctorNotes:   report.doctorNotes  ?? ''
    });
    this.showFormModal = true;
  }

  openDetail(report: Report): void { this.selectedReport = report; this.showDetailModal = true; }
  closeFormModal(): void           { this.showFormModal = false; }

  save(): void {
    if (!this.auth.isAdmin) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.isSelectedAppointmentUsed) return;
    const value = this.form.value;
    const body = {
      appointmentId: +value.appointmentId,
      diagnosis:     value.diagnosis,
      prescription:  value.prescription || null,
      doctorNotes:   value.doctorNotes  || null
    };
    const req$ = this.editingId ? this.reportService.update(this.editingId, body) : this.reportService.create(body);
    req$.subscribe({
      next: () => {
        this.alertSvc.show(this.editingId ? 'Referto aggiornato con successo' : 'Referto creato con successo');
        this.closeFormModal();
        this.load();
      },
      error: () => this.alertSvc.show('Errore durante il salvataggio del referto', 'error')
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getVisitTypeBadgeClass(visitType: string): string {
    const base = 'inline-block px-[0.65rem] py-[0.2rem] rounded-xl text-[0.75rem] font-bold uppercase tracking-[0.5px]';
    const t = visitType?.toLowerCase() ?? '';
    if (t.includes('osteopat') || t.includes('riatlet') || t.includes('recupero')) return `${base} bg-orange-50 text-orange-700`;
    if (t.includes('fitness') || t.includes('personal') || t.includes('allenamento') || t.includes('atletica') || t.includes('agonistic')) return `${base} bg-sky-100 text-sky-800`;
    if (t.includes('nutriz') && t.includes('sport')) return `${base} bg-green-100 text-green-800`;
    if (t.includes('nutriz') || t.includes('piano nutriz') || t.includes('composizione')) return `${base} bg-pink-100 text-pink-800`;
    if (t.includes('medico') || t.includes('sport') || t.includes('idone') || t.includes('bia')) return `${base} bg-red-100 text-red-700`;
    return `${base} bg-slate-100 text-slate-600`;
  }
}
