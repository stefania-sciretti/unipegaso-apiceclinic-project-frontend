import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PatientsComponent } from './patients.component';
import { PatientService } from '../../services/patient.service';
import { AlertService } from '../../services/alert.service';
import { Patient } from '../../models/models';

const makePatient = (overrides: Partial<Patient> = {}): Patient => ({
  id: 1, firstName: 'Anna', lastName: 'Rossi',
  fiscalCode: 'RSSNNA80A41H501Z', birthDate: '1980-01-01',
  email: 'anna@test.com', createdAt: '2024-01-01T00:00:00',
  ...overrides
});

describe('PatientsComponent', () => {
  let component: PatientsComponent;
  let fixture:   ComponentFixture<PatientsComponent>;

  const mockPatientService = jasmine.createSpyObj('PatientService',
    ['getAll', 'create', 'update', 'delete', 'search']);
  const mockAlertService   = jasmine.createSpyObj('AlertService', ['show'], { alert: () => null });

  beforeEach(async () => {
    mockPatientService.getAll.calls.reset();
    mockPatientService.create.calls.reset();
    mockPatientService.update.calls.reset();
    mockPatientService.delete.calls.reset();
    mockPatientService.search.calls.reset();

    mockPatientService.getAll.and.returnValue(of([]));
    mockPatientService.create.and.returnValue(of(makePatient()));
    mockPatientService.update.and.returnValue(of(makePatient()));
    mockPatientService.delete.and.returnValue(of(void 0));
    mockPatientService.search.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [PatientsComponent],
      providers: [
        { provide: PatientService, useValue: mockPatientService },
        { provide: AlertService,   useValue: mockAlertService }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(PatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('calls getAll on init', () => expect(mockPatientService.getAll).toHaveBeenCalled());

  // ── modal state ──────────────────────────────────────────────────────────

  it('openCreate() clears form and shows modal', () => {
    component.form.patchValue({ firstName: 'Mario' });
    component.openCreate();
    expect(component['showModal']()).toBeTrue();
    expect(component['editingId']()).toBeNull();
    expect(component.form.value.firstName).toBeFalsy();
  });

  it('openEdit() patches form with patient data and shows modal', () => {
    const patient = makePatient({ firstName: 'Luigi', lastName: 'Bianchi' });
    component.openEdit(patient);
    expect(component['showModal']()).toBeTrue();
    expect(component['editingId']()).toBe(1);
    expect(component.form.value.firstName).toBe('Luigi');
    expect(component.form.value.lastName).toBe('Bianchi');
  });

  it('closeModal() hides the modal', () => {
    component['showModal'].set(true);
    component.closeModal();
    expect(component['showModal']()).toBeFalse();
  });

  // ── isInvalid() ──────────────────────────────────────────────────────────

  it('isInvalid() returns false when control is untouched', () => {
    expect(component.isInvalid('firstName')).toBeFalse();
  });

  it('isInvalid() returns true when required field is touched and empty', () => {
    component.form.get('firstName')!.setValue('');
    component.form.get('firstName')!.markAsTouched();
    expect(component.isInvalid('firstName')).toBeTrue();
  });

  it('isInvalid() returns false when control is valid and touched', () => {
    component.form.get('firstName')!.setValue('Carlo');
    component.form.get('firstName')!.markAsTouched();
    expect(component.isInvalid('firstName')).toBeFalse();
  });

  // ── save() — invalid ─────────────────────────────────────────────────────

  it('save() marks all touched and skips service when form is invalid', () => {
    component.form.reset();
    component.save();
    expect(mockPatientService.create).not.toHaveBeenCalled();
    expect(mockPatientService.update).not.toHaveBeenCalled();
    expect(component.form.touched).toBeTrue();
  });

  // ── save() — create ──────────────────────────────────────────────────────

  it('save() calls create() when editingId is null and form is valid', () => {
    component['editingId'].set(null);
    component.form.patchValue({
      firstName:  'Carlo',
      lastName:   'Neri',
      fiscalCode: 'NRICRL80A01H501Z',
      birthDate:  '1980-01-01',
      email:      'carlo@test.com',
      phone:      ''
    });
    component.save();
    expect(mockPatientService.create).toHaveBeenCalledTimes(1);
    expect(mockPatientService.update).not.toHaveBeenCalled();
  });

  // ── save() — update ──────────────────────────────────────────────────────

  it('save() calls update() when editingId is set and form is valid', () => {
    component['editingId'].set(1);
    component.form.patchValue({
      firstName:  'Anna',
      lastName:   'Rossi',
      fiscalCode: 'RSSNNA80A41H501Z',
      birthDate:  '1980-01-01',
      email:      'anna@test.com',
      phone:      ''
    });
    component.save();
    expect(mockPatientService.update).toHaveBeenCalledWith(1, jasmine.any(Object));
    expect(mockPatientService.create).not.toHaveBeenCalled();
  });

  // ── fiscalCode uppercasing ────────────────────────────────────────────────

  it('save() sends fiscalCode in uppercase', () => {
    component['editingId'].set(null);
    component.form.patchValue({
      firstName:  'Anna',
      lastName:   'Rossi',
      fiscalCode: 'rssnna80a41h501z',
      birthDate:  '1980-01-01',
      email:      'anna@test.com',
      phone:      ''
    });
    component.save();
    const callArg = mockPatientService.create.calls.mostRecent().args[0];
    expect(callArg.fiscalCode).toBe('RSSNNA80A41H501Z');
  });
});
