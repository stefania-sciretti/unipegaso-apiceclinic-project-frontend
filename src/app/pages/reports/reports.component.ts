import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Report, ReportService } from '../../services/report.service';
import { AlertService } from '../../services/alert.service';
import { ClinicalAppointmentService } from '../../services/clinical-appointment.service';
import { ClinicalAppointment } from '../../models/models';
import { TableThComponent, TableColumn } from '../../shared/table-th.component';
import { TableTdDirective } from '../../shared/table-td.directive';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { FormControlDirective } from '../../shared/form-control.directive';
import { FormLabelDirective } from '../../shared/form-label.directive';

const MOCK_REPORTS: Report[] = [
  {
    id: 1, appointmentId: 3,
    patientFullName: 'Anna Francis', specialistFullName: 'Mihai Lavretti',
    visitType: 'Seduta Osteopatica', scheduledAt: '2025-04-07T10:00:00', issuedDate: '2025-04-07',
    diagnosis: 'Contrattura muscolare cervicale con limitazione funzionale della rotazione. Blocco vertebrale C4-C5.',
    prescription: 'Manipolazione osteopatica eseguita in seduta. Si consigliano 3 sedute di follow-up a cadenza settimanale.',
    doctorNotes: 'Esercizi posturali da eseguire due volte al giorno. Evitare posture viziate alla scrivania.',
    createdAt: '2025-04-07T11:30:00'
  },
  {
    id: 2, appointmentId: 5,
    patientFullName: 'Alessandru Davini', specialistFullName: 'Luca Siretta',
    visitType: 'Valutazione Fitness', scheduledAt: '2025-04-12T09:00:00', issuedDate: '2025-04-12',
    diagnosis: 'Buon livello di fitness generale. Lieve debolezza del core e della catena posteriore.',
    prescription: 'Piano di allenamento personalizzato assegnato – 3 sedute/settimana con focus su rinforzo core e mobilità.',
    doctorNotes: 'Rivalutazione prevista tra 6 settimane. Progressione dei carichi graduale.',
    createdAt: '2025-04-12T10:45:00'
  },
  {
    id: 3, appointmentId: 8,
    patientFullName: 'Elena Debuo', specialistFullName: 'Simona Ruberti',
    visitType: 'Visita Nutrizionistica', scheduledAt: '2025-04-15T11:00:00', issuedDate: '2025-04-15',
    diagnosis: 'Sovrappeso lieve (BMI 27.3). Alimentazione sbilanciata con eccesso di carboidrati raffinati e deficit proteico.',
    prescription: 'Piano nutrizionale personalizzato con 1.600 kcal/die. Aumento dell\'apporto proteico a 1.4g/kg. Riduzione degli zuccheri semplici.',
    doctorNotes: 'Analisi BIA eseguita. Massa grassa 32%. Controllo mensile con pesata e rivalutazione BIA.',
    createdAt: '2025-04-15T12:20:00'
  },
  {
    id: 4, appointmentId: 12,
    patientFullName: 'Marco Lavecri', specialistFullName: 'Sandro Scrigoni',
    visitType: 'Visita Medico-Sportiva', scheduledAt: '2025-04-17T09:30:00', issuedDate: '2025-04-17',
    diagnosis: 'Idoneità sportiva non agonistica confermata. ECG nella norma. PA 118/75 mmHg. Lieve rigidità della fascia ileotibiale destra.',
    prescription: 'Certificato di idoneità sportiva rilasciato. Stretching mirato alla fascia ileotibiale consigliato prima e dopo l\'allenamento.',
    doctorNotes: 'Nessuna controindicazione all\'attività fisica. Controllo annuale consigliato.',
    createdAt: '2025-04-17T10:50:00'
  },
  {
    id: 5, appointmentId: 15,
    patientFullName: 'Erica Guella', specialistFullName: 'Cristiana Maratti',
    visitType: 'Consulenza Nutrizionale Sportiva', scheduledAt: '2025-04-20T14:00:00', issuedDate: '2025-04-20',
    diagnosis: 'Atleta agonista con carenza di carboidrati nel pre-gara. Apporto calorico totale inadeguato rispetto al carico di allenamento.',
    prescription: 'Piano alimentare periodizzato: +300 kcal nei giorni di allenamento intenso. Supplementazione con maltodestrine nel pre-gara. Idratazione: 35 ml/kg/die.',
    doctorNotes: 'Monitorare le prestazioni nelle prossime 4 settimane. Rivalutare timing dei pasti e recupero post-allenamento.',
    createdAt: '2025-04-20T15:15:00'
  },
  {
    id: 6, appointmentId: 18,
    patientFullName: 'Nadia Pietri', specialistFullName: 'Mihai Lavretti',
    visitType: 'Riatletizzazione e Recupero Funzionale', scheduledAt: '2025-04-22T10:30:00', issuedDate: '2025-04-22',
    diagnosis: 'Esito di distorsione alla caviglia sinistra (grado II). Riduzione del ROM in dorsiflessione. Forza del tibiale anteriore ridotta.',
    prescription: 'Programma di riatletizzazione in 3 fasi: propriocezione, rinforzo muscolare, ritorno al gesto atletico. Durata stimata 6 settimane.',
    doctorNotes: 'Evitare corsa su terreni irregolari per 2 settimane. Bendaggio funzionale consigliato durante l\'attività.',
    createdAt: '2025-04-22T11:45:00'
  }
];

@Component({
  selector: 'app-reports',
  imports: [ReactiveFormsModule, DatePipe, NgClass, SlicePipe, TableThComponent, TableTdDirective, ButtonComponent, FormControlDirective, FormLabelDirective],
  templateUrl: './reports.component.html'
})
export class ReportsComponent implements OnInit {

  readonly tableColumns = signal<TableColumn[]>([
    { label: 'Paziente' },
    { label: 'Specialista' },
    { label: 'Tipo Visita' },
    { label: 'Data Emissione' },
    { label: 'Diagnosi (sintesi)' },
    { label: 'Azioni', extraClass: 'w-[200px] min-w-[200px]' }
  ]);
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

  constructor() {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.reportService.getAll().pipe(
      catchError(() => of(MOCK_REPORTS))
    ).subscribe({
      next: (data) => {
        this.reports = data.length > 0 ? data : MOCK_REPORTS;
        this.loading = false;
      },
      error: () => { this.reports = MOCK_REPORTS; this.loading = false; }
    });
  }

  loadCompletedAppointments(): void {
    this.clinicalAppointmentService.getAll({ status: 'COMPLETED' }).pipe(
      catchError(() => of([]))
    ).subscribe(appointments => {
      this.completedAppointments = appointments.filter(a => !a.hasReport);
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset();
    this.loadCompletedAppointments();
    this.showFormModal = true;
  }

  openEdit(report: Report): void {
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
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
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
