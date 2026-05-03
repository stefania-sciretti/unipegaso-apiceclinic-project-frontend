import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentsComponent } from './appointments.component';
import { AppointmentService } from '../../services/appointment.service';
import { PatientService } from '../../services/patient.service';
import { SpecialistService } from '../../services/specialist.service';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { FitnessAppointment } from '../../models/models';

const makeAppt = (overrides: Partial<FitnessAppointment> = {}): FitnessAppointment => ({
  id: 1, patientId: 1, patientFullName: 'Anna Rossi',
  specialistId: 2, specialistFullName: 'Luca Siretta', specialistRole: 'PERSONAL_TRAINER',
  scheduledAt: '2025-06-01T10:00:00', serviceType: 'Personal Training',
  status: 'BOOKED', createdAt: '2024-01-01T00:00:00',
  ...overrides
});

describe('AppointmentsComponent', () => {
  let component: AppointmentsComponent;
  let fixture:   ComponentFixture<AppointmentsComponent>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockAppointmentService = jasmine.createSpyObj('AppointmentService',
    ['getAll', 'create', 'updateStatus', 'delete']);
  const mockPatientService    = jasmine.createSpyObj('PatientService', ['getAll']);
  const mockSpecialistService = jasmine.createSpyObj('SpecialistService', ['getAll']);
  const mockAlertService      = jasmine.createSpyObj('AlertService', ['show'], { alert: () => null });
  const mockAuthService       = { isAdmin: true, patientId: undefined, isLoggedIn: true, user: () => null };

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockAppointmentService.getAll.calls.reset();
    mockAppointmentService.create.calls.reset();
    mockAppointmentService.updateStatus.calls.reset();
    mockAppointmentService.delete.calls.reset();
    mockPatientService.getAll.calls.reset();
    mockSpecialistService.getAll.calls.reset();

    mockAppointmentService.getAll.and.returnValue(of([]));
    mockPatientService.getAll.and.returnValue(of([]));
    mockSpecialistService.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AppointmentsComponent],
      providers: [
        { provide: AppointmentService, useValue: mockAppointmentService },
        { provide: PatientService,    useValue: mockPatientService },
        { provide: SpecialistService, useValue: mockSpecialistService },
        { provide: AlertService,       useValue: mockAlertService },
        { provide: AuthService,        useValue: mockAuthService },
        { provide: ActivatedRoute,     useValue: { queryParams: of({}) } },
        { provide: Router,             useValue: mockRouter }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(AppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('calls getAll on init', () => expect(mockAppointmentService.getAll).toHaveBeenCalled());

  it('loads patients and specialists on init', () => {
    expect(mockPatientService.getAll).toHaveBeenCalled();
    expect(mockSpecialistService.getAll).toHaveBeenCalled();
  });

  it('appointments signal starts empty', () => expect(component.appointments()).toEqual([]));

  // ── canCancel() ──────────────────────────────────────────────────────────

  it('canCancel returns true for BOOKED appointment', () =>
    expect(component.canCancel(makeAppt({ status: 'BOOKED' }))).toBeTrue());

  it('canCancel returns true for CONFIRMED appointment', () =>
    expect(component.canCancel(makeAppt({ status: 'CONFIRMED' }))).toBeTrue());

  it('canCancel returns false for COMPLETED appointment', () =>
    expect(component.canCancel(makeAppt({ status: 'COMPLETED' }))).toBeFalse());

  it('canCancel returns false for CANCELLED appointment', () =>
    expect(component.canCancel(makeAppt({ status: 'CANCELLED' }))).toBeFalse());

  // ── statusLabel() ────────────────────────────────────────────────────────

  it('statusLabel maps BOOKED → Prenotato', () =>
    expect(component.statusLabel('BOOKED')).toBe('Prenotato'));

  it('statusLabel maps CONFIRMED → Confermato', () =>
    expect(component.statusLabel('CONFIRMED')).toBe('Confermato'));

  it('statusLabel maps COMPLETED → Completato', () =>
    expect(component.statusLabel('COMPLETED')).toBe('Completato'));

  it('statusLabel maps CANCELLED → Annullato', () =>
    expect(component.statusLabel('CANCELLED')).toBe('Annullato'));

  it('statusLabel returns raw value for unknown status', () =>
    expect(component.statusLabel('UNKNOWN')).toBe('UNKNOWN'));

  // ── roleLabel() ──────────────────────────────────────────────────────────

  it('roleLabel maps PERSONAL_TRAINER correctly', () =>
    expect(component.roleLabel('PERSONAL_TRAINER')).toBe('Personal Trainer'));

  it('roleLabel returns raw value for unknown role', () =>
    expect(component.roleLabel('UNKNOWN_ROLE')).toBe('UNKNOWN_ROLE'));

  // ── roleBadgeColor() ─────────────────────────────────────────────────────

  it('roleBadgeColor returns a non-empty string for NUTRITIONIST', () => {
    expect(component.roleBadgeColor('NUTRITIONIST')).toBeTruthy();
  });

  it('roleBadgeColor returns primary color for unknown role', () => {
    const unknown = component.roleBadgeColor('UNKNOWN_ROLE');
    const knownFallback = component.roleColorMap()['PERSONAL_TRAINER'];
    // Falls back to COLOR_PRIMARY, same as PERSONAL_TRAINER
    expect(unknown).toBeTruthy();
    expect(unknown).toBe(knownFallback);
  });

  // ── modal state ──────────────────────────────────────────────────────────

  it('openCreate() resets form and shows appointment modal', () => {
    component.apptForm.patchValue({ patientId: 1 });
    component.openCreate();
    expect(component.showApptModal()).toBeTrue();
    expect(component.apptForm.value.patientId).toBeNull();
  });

  it('openStatusModal() sets editingId and shows status modal', () => {
    const appt = makeAppt({ id: 5, status: 'BOOKED' });
    component.openStatusModal(appt);
    expect(component.statusEditingId()).toBe(5);
    expect(component.showStatusModal()).toBeTrue();
  });

  // ── saveAppointment() — invalid form ─────────────────────────────────────

  it('saveAppointment() marks form touched and skips service when form is invalid', () => {
    component.apptForm.reset();
    component.saveAppointment();
    expect(mockAppointmentService.create).not.toHaveBeenCalled();
    expect(component.apptForm.touched).toBeTrue();
  });

  // ── onStatusFilter() ─────────────────────────────────────────────────────

  it('onStatusFilter() updates filterStatus and navigates', () => {
    mockAppointmentService.getAll.and.returnValue(of([]));
    const event = { target: { value: 'CONFIRMED' } } as unknown as Event;
    component.onStatusFilter(event);
    expect(component.filterStatus()).toBe('CONFIRMED');
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
});
