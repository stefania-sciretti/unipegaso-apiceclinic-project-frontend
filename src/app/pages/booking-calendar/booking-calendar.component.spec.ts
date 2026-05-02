import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import {BookingCalendarComponent} from './booking-calendar.component';
import {AppointmentService} from '../../services/appointment.service';
import {ClinicalAppointmentService} from '../../services/clinical-appointment.service';
import {DatePipe, registerLocaleData} from '@angular/common';
import {LOCALE_ID} from '@angular/core';
import localeIt from '@angular/common/locales/it';

describe('BookingCalendarComponent', () => {
  let component: BookingCalendarComponent;
  let fixture: ComponentFixture<BookingCalendarComponent>;

  const mockApptService = jasmine.createSpyObj('AppointmentService', ['getAll']);
  const mockClinicalService = jasmine.createSpyObj('ClinicalAppointmentService', ['getAll']);

  beforeAll(() => registerLocaleData(localeIt));

  beforeEach(async () => {
    mockApptService.getAll.calls.reset();
    mockClinicalService.getAll.calls.reset();
    mockApptService.getAll.and.returnValue(of([]));
    mockClinicalService.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [BookingCalendarComponent],
      providers: [
        { provide: AppointmentService, useValue: mockApptService },
        { provide: ClinicalAppointmentService, useValue: mockClinicalService },
        { provide: LOCALE_ID, useValue: 'it-IT' },
        DatePipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  it('should create', () => expect(component).toBeTruthy());

  it('should call getAll on both services on init', () => {
    expect(mockApptService.getAll).toHaveBeenCalledTimes(1);
    expect(mockClinicalService.getAll).toHaveBeenCalledTimes(1);
  });

  describe('NullInjectorError prevention', () => {
    let localFixture: ComponentFixture<BookingCalendarComponent>;

    beforeEach(async () => {
      TestBed.resetTestingModule();
      mockApptService.getAll.and.returnValue(of([]));
      mockClinicalService.getAll.and.returnValue(of([]));
      await TestBed.configureTestingModule({
        imports: [BookingCalendarComponent],
        providers: [
          { provide: AppointmentService, useValue: mockApptService },
          { provide: ClinicalAppointmentService, useValue: mockClinicalService },
          { provide: LOCALE_ID, useValue: 'it-IT' }
          // DatePipe intentionally omitted — component must self-provide it
        ]
      }).compileComponents();
      localFixture = TestBed.createComponent(BookingCalendarComponent);
    });

    afterEach(() => localFixture?.destroy());

    it('should provide DatePipe in component providers (not just imports)', () => {
      expect(() => localFixture.detectChanges()).not.toThrow();
      expect(localFixture.componentInstance).toBeTruthy();
    });
  });

  describe('forkJoin partial failure', () => {
    const fitnessData = [{
      id: 1, serviceType: 'Personal Training', scheduledAt: new Date(),
      specialistFullName: 'John Specialist', patientFullName: 'Jane Patient', status: 'CONFIRMED'
    }];
    const clinicalData = [{
      id: 2, visitType: 'Consultation', scheduledAt: new Date(),
      specialistFullName: 'Dr. Smith', patientFullName: 'Jane Patient', status: 'CONFIRMED'
    }];

    it('should show fitness data even when clinical API fails', async () => {
      mockApptService.getAll.and.returnValue(of(fitnessData));
      mockClinicalService.getAll.and.returnValue(throwError(() => new Error('API failed')));

      component.load();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.events.length).toBeGreaterThan(0);
      expect(component.events.some(e => e.type === 'fitness')).toBe(true);
      expect(component.loadError).toBe(false);
    });

    it('should show clinical data even when fitness API fails', async () => {
      mockApptService.getAll.and.returnValue(throwError(() => new Error('API failed')));
      mockClinicalService.getAll.and.returnValue(of(clinicalData));

      component.load();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.events.length).toBeGreaterThan(0);
      expect(component.events.some(e => e.type === 'clinical')).toBe(true);
      expect(component.loadError).toBe(false);
    });

    it('should set loadError=true only when BOTH APIs fail', async () => {
      mockApptService.getAll.and.returnValue(throwError(() => new Error('API failed')));
      mockClinicalService.getAll.and.returnValue(throwError(() => new Error('API failed')));

      component.load();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.loadError).toBe(true);
      expect(component.events.length).toBe(0);
    });

    it('should not set loadError when both APIs succeed', async () => {
      mockApptService.getAll.and.returnValue(of(fitnessData));
      mockClinicalService.getAll.and.returnValue(of(clinicalData));

      component.load();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.loadError).toBe(false);
      expect(component.events.length).toBe(2);
    });
  });
});
