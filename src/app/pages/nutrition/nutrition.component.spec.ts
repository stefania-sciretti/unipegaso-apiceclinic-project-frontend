import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NutritionComponent } from './nutrition.component';
import { DietPlanService } from '../../services/diet-plan.service';
import { PatientService } from '../../services/patient.service';
import { SpecialistService } from '../../services/specialist.service';
import { AlertService } from '../../services/alert.service';
import { DietPlan } from '../../models/models';

const makePlan = (overrides: Partial<DietPlan> = {}): DietPlan => ({
  id: 1, patientId: 1,
  patientFirstName: 'Anna', patientLastName: 'Rossi',
  specialistId: 2, specialistFirstName: 'Jane', specialistLastName: 'Smith',
  title: 'Weight Loss', description: undefined,
  calories: 1800, durationWeeks: 8, active: true,
  createdAt: '2024-01-01',
  ...overrides
});

describe('NutritionComponent', () => {
  let component: NutritionComponent;
  let fixture:   ComponentFixture<NutritionComponent>;

  const mockDietPlanService   = jasmine.createSpyObj('DietPlanService', ['getAll', 'create', 'update', 'delete']);
  const mockPatientService    = jasmine.createSpyObj('PatientService', ['getAll']);
  const mockSpecialistService = jasmine.createSpyObj('SpecialistService', ['getAll']);
  const mockAlertService      = jasmine.createSpyObj('AlertService', ['show'], { alert: () => null });

  beforeEach(async () => {
    mockDietPlanService.getAll.calls.reset();
    mockDietPlanService.create.calls.reset();
    mockDietPlanService.update.calls.reset();
    mockDietPlanService.delete.calls.reset();
    mockPatientService.getAll.calls.reset();
    mockSpecialistService.getAll.calls.reset();

    mockDietPlanService.getAll.and.returnValue(of([]));
    mockPatientService.getAll.and.returnValue(of([]));
    mockSpecialistService.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [NutritionComponent],
      providers: [
        { provide: DietPlanService,   useValue: mockDietPlanService },
        { provide: PatientService,    useValue: mockPatientService },
        { provide: SpecialistService, useValue: mockSpecialistService },
        { provide: AlertService,      useValue: mockAlertService }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(NutritionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('calls DietPlanService.getAll() on init', () =>
    expect(mockDietPlanService.getAll).toHaveBeenCalled());

  // ── filtered computed signal ─────────────────────────────────────────────

  it('filtered returns all plans when filterActive is empty', () => {
    const plans = [makePlan({ active: true }), makePlan({ id: 2, active: false })];
    component.plans.set(plans);
    component.filterActive.set('');
    expect(component.filtered().length).toBe(2);
  });

  it('filtered returns only active plans when filterActive is "true"', () => {
    component.plans.set([makePlan({ active: true }), makePlan({ id: 2, active: false })]);
    component.filterActive.set('true');
    expect(component.filtered().length).toBe(1);
    expect(component.filtered()[0].active).toBeTrue();
  });

  it('filtered returns only inactive plans when filterActive is "false"', () => {
    component.plans.set([makePlan({ active: true }), makePlan({ id: 2, active: false })]);
    component.filterActive.set('false');
    expect(component.filtered().length).toBe(1);
    expect(component.filtered()[0].active).toBeFalse();
  });

  // ── modal signals ────────────────────────────────────────────────────────

  it('openCreate() clears editingId and shows modal', () => {
    component.editingId.set(10);
    component.openCreate();
    expect(component.editingId()).toBeNull();
    expect(component.showModal()).toBeTrue();
  });

  it('openEdit() sets editingId to the plan id and shows modal', () => {
    component.openEdit(makePlan({ id: 5 }));
    expect(component.editingId()).toBe(5);
    expect(component.showModal()).toBeTrue();
  });

  // ── save() — invalid form ────────────────────────────────────────────────

  it('save() marks form touched and skips service call when form is invalid', () => {
    component.form.reset();
    component.save();
    expect(mockDietPlanService.create).not.toHaveBeenCalled();
    expect(mockDietPlanService.update).not.toHaveBeenCalled();
    expect(component.form.touched).toBeTrue();
  });

  // ── save() — create ──────────────────────────────────────────────────────

  it('save() calls create() when editingId is null and form valid', () => {
    mockDietPlanService.create.and.returnValue(of(makePlan()));
    mockDietPlanService.getAll.and.returnValue(of([]));
    component.editingId.set(null);
    component.form.patchValue({ patientId: 1, title: 'New Plan' });
    component.save();
    expect(mockDietPlanService.create).toHaveBeenCalledTimes(1);
    expect(mockDietPlanService.update).not.toHaveBeenCalled();
  });

  // ── save() — update ──────────────────────────────────────────────────────

  it('save() calls update() when editingId is set and form valid', () => {
    mockDietPlanService.update.and.returnValue(of(makePlan()));
    mockDietPlanService.getAll.and.returnValue(of([]));
    component.editingId.set(1);
    component.form.patchValue({ patientId: 1, title: 'Updated Plan' });
    component.save();
    expect(mockDietPlanService.update).toHaveBeenCalledWith(1, jasmine.any(Object));
    expect(mockDietPlanService.create).not.toHaveBeenCalled();
  });
});
