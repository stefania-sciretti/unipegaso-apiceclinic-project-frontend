import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { GlycemiaComponent } from './glycemia.component';
import { GlycemiaService } from '../../services/glycemia.service';
import { PatientService } from '../../services/patient.service';
import { SpecialistService } from '../../services/specialist.service';
import { AlertService } from '../../services/alert.service';
import { GlycemiaMeasurement } from '../../models/models';

const makeMeasurement = (overrides: Partial<GlycemiaMeasurement> = {}): GlycemiaMeasurement => ({
  id: 1,
  patientId: 1,
  patientFirstName: 'Anna',
  patientLastName: 'Rossi',
  specialistId: 2,
  specialistFullName: 'Dr. Smith',
  measuredAt: '2024-06-01T09:00:00',
  valueMgDl: 95,
  context: 'A_DIGIUNO',
  classification: 'NORMALE',
  notes: undefined,
  createdAt: '2024-06-01T09:00:00',
  ...overrides
});

describe('GlycemiaComponent', () => {
  let component: GlycemiaComponent;
  let fixture:   ComponentFixture<GlycemiaComponent>;

  const mockGlycemiaService   = jasmine.createSpyObj('GlycemiaService',
    ['getAll', 'create', 'update', 'delete', 'getClassificationRules']);
  const mockPatientService    = jasmine.createSpyObj('PatientService', ['getAll']);
  const mockSpecialistService = jasmine.createSpyObj('SpecialistService', ['getAll']);
  const mockAlertService      = jasmine.createSpyObj('AlertService', ['show'], { alert: () => null });

  beforeEach(async () => {
    mockGlycemiaService.getAll.calls.reset();
    mockGlycemiaService.create.calls.reset();
    mockGlycemiaService.update.calls.reset();
    mockGlycemiaService.delete.calls.reset();
    mockPatientService.getAll.calls.reset();
    mockSpecialistService.getAll.calls.reset();

    mockGlycemiaService.getAll.and.returnValue(of([]));
    mockGlycemiaService.getClassificationRules.and.returnValue(of({ contexts: [] }));
    mockPatientService.getAll.and.returnValue(of([]));
    mockSpecialistService.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [GlycemiaComponent],
      providers: [
        { provide: GlycemiaService,   useValue: mockGlycemiaService },
        { provide: PatientService,    useValue: mockPatientService },
        { provide: SpecialistService, useValue: mockSpecialistService },
        { provide: AlertService,      useValue: mockAlertService }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(GlycemiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('calls getAll() on init', () => expect(mockGlycemiaService.getAll).toHaveBeenCalled());

  it('calls getClassificationRules() on init', () =>
    expect(mockGlycemiaService.getClassificationRules).toHaveBeenCalled());

  // ── filteredMeasurements computed ────────────────────────────────────────

  it('filteredMeasurements returns all when search is empty', () => {
    const data = [makeMeasurement(), makeMeasurement({ id: 2, patientLastName: 'Bianchi' })];
    mockGlycemiaService.getAll.and.returnValue(of(data));
    component.load();
    expect(component.filteredMeasurements().length).toBe(2);
  });

  it('filteredMeasurements filters by patient last + first name (case-insensitive)', () => {
    const data = [
      makeMeasurement({ patientLastName: 'Rossi', patientFirstName: 'Anna' }),
      makeMeasurement({ id: 2, patientLastName: 'Bianchi', patientFirstName: 'Mario' })
    ];
    mockGlycemiaService.getAll.and.returnValue(of(data));
    component.load();
    component.searchQuery.set('rossi');
    expect(component.filteredMeasurements().length).toBe(1);
    expect(component.filteredMeasurements()[0].patientLastName).toBe('Rossi');
  });

  it('filteredMeasurements returns empty when search matches nothing', () => {
    const data = [makeMeasurement()];
    mockGlycemiaService.getAll.and.returnValue(of(data));
    component.load();
    component.searchQuery.set('zzznomatch');
    expect(component.filteredMeasurements().length).toBe(0);
  });

  // ── contextLabel() ───────────────────────────────────────────────────────

  it('contextLabel() returns Italian label for A_DIGIUNO', () => {
    expect(component.contextLabel('A_DIGIUNO')).toBe('A digiuno');
  });

  it('contextLabel() returns Italian label for POST_PASTO_1H', () => {
    expect(component.contextLabel('POST_PASTO_1H')).toBe('Post-pasto 1h');
  });

  it('contextLabel() returns Italian label for POST_PASTO_2H', () => {
    expect(component.contextLabel('POST_PASTO_2H')).toBe('Post-pasto 2h');
  });

  it('contextLabel() returns Italian label for RANDOM', () => {
    expect(component.contextLabel('RANDOM')).toBe('Casuale');
  });

  it('contextLabel() returns raw value for unknown context', () => {
    expect(component.contextLabel('UNKNOWN')).toBe('UNKNOWN');
  });

  // ── patientName() ────────────────────────────────────────────────────────

  it('patientName() uses measurement own name when available', () => {
    const m = makeMeasurement({ patientFirstName: 'Luigi', patientLastName: 'Neri' });
    expect(component.patientName(m)).toBe('Neri Luigi');
  });

  it('patientName() falls back to patients list when measurement has no name', () => {
    const m = makeMeasurement({ patientFirstName: '', patientLastName: '' });
    component.patients.set([{ id: 1, firstName: 'Carlo', lastName: 'Verdi' } as any]);
    expect(component.patientName(m)).toBe('Carlo Verdi');
  });

  it('patientName() returns em-dash when patient not found in list', () => {
    const m = makeMeasurement({ patientFirstName: '', patientLastName: '', patientId: 99 });
    component.patients.set([]);
    expect(component.patientName(m)).toBe('–');
  });

  // ── modal state signals ──────────────────────────────────────────────────

  it('openCreate() resets editingId and shows modal', () => {
    component.editingId.set(5);
    component.openCreate();
    expect(component.editingId()).toBeNull();
    expect(component.showModal()).toBeTrue();
  });

  it('openEdit() sets editingId and shows modal', () => {
    const m = makeMeasurement({ id: 7 });
    component.openEdit(m);
    expect(component.editingId()).toBe(7);
    expect(component.showModal()).toBeTrue();
  });

  it('closeModal() hides the modal', () => {
    component.showModal.set(true);
    component.closeModal();
    expect(component.showModal()).toBeFalse();
  });

  // ── save() — invalid form ────────────────────────────────────────────────

  it('save() marks form touched and does not call service when form is invalid', () => {
    component.form.reset();
    component.save();
    expect(mockGlycemiaService.create).not.toHaveBeenCalled();
    expect(mockGlycemiaService.update).not.toHaveBeenCalled();
    expect(component.form.touched).toBeTrue();
  });

  // ── save() — valid create ────────────────────────────────────────────────

  it('save() calls create() when editingId is null and form is valid', () => {
    mockGlycemiaService.create.and.returnValue(of(makeMeasurement()));
    mockGlycemiaService.getAll.and.returnValue(of([]));
    component.editingId.set(null);
    component.form.setValue({
      patientId:  1,
      measuredAt: '2024-06-01T09:00',
      valueMgDl:  95,
      context:    'A_DIGIUNO',
      notes:      ''
    });
    component.save();
    expect(mockGlycemiaService.create).toHaveBeenCalledTimes(1);
    expect(mockGlycemiaService.update).not.toHaveBeenCalled();
  });

  // ── save() — valid update ────────────────────────────────────────────────

  it('save() calls update() when editingId is set and form is valid', () => {
    mockGlycemiaService.update.and.returnValue(of(makeMeasurement()));
    mockGlycemiaService.getAll.and.returnValue(of([]));
    component.editingId.set(1);
    component.form.setValue({
      patientId:  1,
      measuredAt: '2024-06-01T09:00',
      valueMgDl:  110,
      context:    'POST_PASTO_1H',
      notes:      'Nota test'
    });
    component.save();
    expect(mockGlycemiaService.update).toHaveBeenCalledWith(1, jasmine.any(Object));
    expect(mockGlycemiaService.create).not.toHaveBeenCalled();
  });
});
