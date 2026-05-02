import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ReportsComponent } from './reports.component';
import { ReportService } from '../../services/report.service';
import { ClinicalAppointmentService } from '../../services/clinical-appointment.service';
import { AlertService } from '../../services/alert.service';
import { Report } from '../../services/report.service';

const makeReport = (overrides: Partial<Report> = {}): Report => ({
  id: 1, appointmentId: 1,
  patientFullName: 'Anna Rossi', specialistFullName: 'Laura Smith',
  visitType: 'Visita Nutrizionistica',
  scheduledAt: '2026-06-01T10:00:00',
  issuedDate: '2026-06-01',
  diagnosis: 'Tutto nella norma',
  createdAt: '2024-01-01T00:00:00',
  ...overrides
});

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture:   ComponentFixture<ReportsComponent>;

  const mockReportService = jasmine.createSpyObj('ReportService', ['getAll', 'create', 'update']);
  const mockApptService   = jasmine.createSpyObj('ClinicalAppointmentService', ['getAll']);
  const mockAlertService  = jasmine.createSpyObj('AlertService', ['show'], { alert: () => null });

  beforeEach(async () => {
    mockReportService.getAll.calls.reset();
    mockReportService.create.calls.reset();
    mockReportService.update.calls.reset();
    mockApptService.getAll.calls.reset();

    mockReportService.getAll.and.returnValue(of([]));
    mockApptService.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ReportsComponent],
      providers: [
        { provide: ReportService,              useValue: mockReportService },
        { provide: ClinicalAppointmentService, useValue: mockApptService },
        { provide: AlertService,               useValue: mockAlertService }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('calls ReportService.getAll() on init', () =>
    expect(mockReportService.getAll).toHaveBeenCalled());

  it('falls back to mock data when API returns empty array', () => {
    mockReportService.getAll.and.returnValue(of([]));
    component.load();
    // MOCK_REPORTS is the private constant; just assert it is non-empty
    expect(component.reports.length).toBeGreaterThan(0);
  });

  it('uses API data when API returns non-empty array', () => {
    const apiReport = makeReport();
    mockReportService.getAll.and.returnValue(of([apiReport]));
    component.load();
    expect(component.reports).toEqual([apiReport]);
  });

  // ── modal state ──────────────────────────────────────────────────────────

  it('openCreate() clears editingId, resets form, and shows modal', () => {
    component.editingId = 5;
    component.form.patchValue({ diagnosis: 'Old diagnosis' });
    component.openCreate();
    expect(component.editingId).toBeNull();
    expect(component.showFormModal).toBeTrue();
  });

  it('openEdit() populates form with report data and shows modal', () => {
    const report = makeReport({ id: 3, diagnosis: 'Diagnosi test' });
    component.openEdit(report);
    expect(component.editingId).toBe(3);
    expect(component.form.value.diagnosis).toBe('Diagnosi test');
    expect(component.showFormModal).toBeTrue();
  });

  it('openDetail() sets selectedReport and shows detail modal', () => {
    const report = makeReport({ id: 2 });
    component.openDetail(report);
    expect(component.selectedReport).toBe(report);
    expect(component.showDetailModal).toBeTrue();
  });

  it('closeFormModal() hides the form modal', () => {
    component.showFormModal = true;
    component.closeFormModal();
    expect(component.showFormModal).toBeFalse();
  });

  // ── isInvalid() ──────────────────────────────────────────────────────────

  it('isInvalid() returns false when field is untouched', () => {
    expect(component.isInvalid('diagnosis')).toBeFalse();
  });

  it('isInvalid() returns true when required field is touched and empty', () => {
    component.form.get('diagnosis')!.setValue('');
    component.form.get('diagnosis')!.markAsTouched();
    expect(component.isInvalid('diagnosis')).toBeTrue();
  });

  // ── save() — invalid form ────────────────────────────────────────────────

  it('save() marks form touched and skips service when invalid', () => {
    component.form.reset();
    component.save();
    expect(mockReportService.create).not.toHaveBeenCalled();
    expect(mockReportService.update).not.toHaveBeenCalled();
    expect(component.form.touched).toBeTrue();
  });

  // ── save() — create ──────────────────────────────────────────────────────

  it('save() calls create() when editingId is null and form is valid', () => {
    mockReportService.create.and.returnValue(of(makeReport()));
    mockReportService.getAll.and.returnValue(of([]));
    component.editingId = null;
    component.form.patchValue({ appointmentId: 1, diagnosis: 'Normal' });
    component.save();
    expect(mockReportService.create).toHaveBeenCalledTimes(1);
    expect(mockReportService.update).not.toHaveBeenCalled();
  });

  // ── save() — update ──────────────────────────────────────────────────────

  it('save() calls update() when editingId is set and form is valid', () => {
    mockReportService.update.and.returnValue(of(makeReport()));
    mockReportService.getAll.and.returnValue(of([]));
    component.editingId = 1;
    component.form.patchValue({ appointmentId: 1, diagnosis: 'Updated diagnosis' });
    component.save();
    expect(mockReportService.update).toHaveBeenCalledWith(1, jasmine.any(Object));
    expect(mockReportService.create).not.toHaveBeenCalled();
  });

  // ── getVisitTypeBadgeClass() ─────────────────────────────────────────────

  describe('getVisitTypeBadgeClass()', () => {
    it('returns orange classes for osteopathic visits', () => {
      expect(component.getVisitTypeBadgeClass('Seduta Osteopatica'))
        .toContain('bg-orange-50');
    });

    it('returns sky classes for fitness visits', () => {
      expect(component.getVisitTypeBadgeClass('Valutazione Fitness'))
        .toContain('bg-sky-100');
    });

    it('returns green classes for sports nutrition visits', () => {
      expect(component.getVisitTypeBadgeClass('Consulenza Nutrizionale Sportiva'))
        .toContain('bg-green-100');
    });

    it('returns pink classes for nutrition visits', () => {
      expect(component.getVisitTypeBadgeClass('Visita Nutrizionistica'))
        .toContain('bg-pink-100');
    });

    it('returns red classes for medical/sport visits', () => {
      expect(component.getVisitTypeBadgeClass('Visita Medico-Sportiva'))
        .toContain('bg-red-100');
    });

    it('returns slate fallback for unknown visit types', () => {
      expect(component.getVisitTypeBadgeClass('Unknown Type'))
        .toContain('bg-slate-100');
    });
  });
});
