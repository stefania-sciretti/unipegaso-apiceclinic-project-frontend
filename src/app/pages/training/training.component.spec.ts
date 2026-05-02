import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TrainingComponent } from './training.component';
import { TrainingPlanService } from '../../services/training-plan.service';
import { PatientService } from '../../services/patient.service';
import { SpecialistService } from '../../services/specialist.service';
import { AlertService } from '../../services/alert.service';
import { TrainingPlan } from '../../models/models';

const makePlan = (overrides: Partial<TrainingPlan> = {}): TrainingPlan => ({
  id: 1, patientId: 1, patientFullName: 'Anna Rossi',
  specialistId: 2, specialistFullName: 'Luca Siretta',
  title: 'Forza 8 settimane',
  weeks: 8, sessionsPerWeek: 3, active: true,
  createdAt: '2024-01-01T00:00:00',
  ...overrides
});

describe('TrainingComponent', () => {
  let component: TrainingComponent;
  let fixture:   ComponentFixture<TrainingComponent>;

  const mockTrainingService   = jasmine.createSpyObj('TrainingPlanService', ['getAll', 'create', 'update', 'delete']);
  const mockPatientService    = jasmine.createSpyObj('PatientService', ['getAll']);
  const mockSpecialistService = jasmine.createSpyObj('SpecialistService', ['getAll']);
  const mockAlertService      = jasmine.createSpyObj('AlertService', ['show'], { alert: () => null });

  beforeEach(async () => {
    mockTrainingService.getAll.calls.reset();
    mockTrainingService.create.calls.reset();
    mockTrainingService.update.calls.reset();
    mockTrainingService.delete.calls.reset();
    mockPatientService.getAll.calls.reset();
    mockSpecialistService.getAll.calls.reset();

    mockTrainingService.getAll.and.returnValue(of([]));
    mockPatientService.getAll.and.returnValue(of([]));
    mockSpecialistService.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [TrainingComponent],
      providers: [
        { provide: TrainingPlanService, useValue: mockTrainingService },
        { provide: PatientService,      useValue: mockPatientService },
        { provide: SpecialistService,   useValue: mockSpecialistService },
        { provide: AlertService,        useValue: mockAlertService }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(TrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('calls TrainingPlanService.getAll() on init', () =>
    expect(mockTrainingService.getAll).toHaveBeenCalled());

  // ── filtered computed — active toggle ────────────────────────────────────

  it('filtered returns all plans when no filter is set', () => {
    component.plans.set([makePlan({ active: true }), makePlan({ id: 2, active: false })]);
    component.filterActive.set('');
    expect(component.filtered().length).toBe(2);
  });

  it('filtered returns only active plans when filterActive is "true"', () => {
    component.plans.set([makePlan({ active: true }), makePlan({ id: 2, active: false })]);
    component.filterActive.set('true');
    const result = component.filtered();
    expect(result.length).toBe(1);
    expect(result[0].active).toBeTrue();
  });

  it('filtered returns only inactive plans when filterActive is "false"', () => {
    component.plans.set([makePlan({ active: true }), makePlan({ id: 2, active: false })]);
    component.filterActive.set('false');
    const result = component.filtered();
    expect(result.length).toBe(1);
    expect(result[0].active).toBeFalse();
  });

  // ── filtered computed — patient filter ───────────────────────────────────

  it('filtered filters by patientId when filterPatientId is set', () => {
    component.plans.set([
      makePlan({ id: 1, patientId: 1 }),
      makePlan({ id: 2, patientId: 2 })
    ]);
    component.filterPatientId.set('2');
    expect(component.filtered().length).toBe(1);
    expect(component.filtered()[0].patientId).toBe(2);
  });

  it('filtered combines active and patientId filters', () => {
    component.plans.set([
      makePlan({ id: 1, patientId: 1, active: true }),
      makePlan({ id: 2, patientId: 1, active: false }),
      makePlan({ id: 3, patientId: 2, active: true }),
    ]);
    component.filterActive.set('true');
    component.filterPatientId.set('1');
    expect(component.filtered().length).toBe(1);
    expect(component.filtered()[0].id).toBe(1);
  });

  // ── modal state ──────────────────────────────────────────────────────────

  it('openCreate() clears editingId and shows modal', () => {
    component.editingId.set(9);
    component.openCreate();
    expect(component.editingId()).toBeNull();
    expect(component.showModal()).toBeTrue();
  });

  it('openEdit() sets editingId and shows modal', () => {
    component.openEdit(makePlan({ id: 3 }));
    expect(component.editingId()).toBe(3);
    expect(component.showModal()).toBeTrue();
  });

  it('openDetail() sets selected plan and shows detail panel', () => {
    const plan = makePlan({ id: 4 });
    component.openDetail(plan);
    expect(component.selected()).toBe(plan);
    expect(component.showDetail()).toBeTrue();
  });

  // ── save() — invalid form ────────────────────────────────────────────────

  it('save() marks form touched and skips service call when invalid', () => {
    component.form.reset();
    component.save();
    expect(mockTrainingService.create).not.toHaveBeenCalled();
    expect(mockTrainingService.update).not.toHaveBeenCalled();
    expect(component.form.touched).toBeTrue();
  });

  // ── save() — create ──────────────────────────────────────────────────────

  it('save() calls create() when editingId is null and form is valid', () => {
    mockTrainingService.create.and.returnValue(of(makePlan()));
    mockTrainingService.getAll.and.returnValue(of([]));
    component.editingId.set(null);
    component.form.patchValue({ patientId: 1, title: 'New Plan' });
    component.save();
    expect(mockTrainingService.create).toHaveBeenCalledTimes(1);
    expect(mockTrainingService.update).not.toHaveBeenCalled();
  });

  // ── save() — update ──────────────────────────────────────────────────────

  it('save() calls update() when editingId is set and form is valid', () => {
    mockTrainingService.update.and.returnValue(of(makePlan()));
    mockTrainingService.getAll.and.returnValue(of([]));
    component.editingId.set(1);
    component.form.patchValue({ patientId: 1, title: 'Updated' });
    component.save();
    expect(mockTrainingService.update).toHaveBeenCalledWith(1, jasmine.any(Object));
    expect(mockTrainingService.create).not.toHaveBeenCalled();
  });
});
