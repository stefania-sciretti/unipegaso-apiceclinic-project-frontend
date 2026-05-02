import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { BookingCalendarComponent } from './booking-calendar.component';
import { AppointmentService } from '../../services/appointment.service';
import { DatePipe, registerLocaleData } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import localeIt from '@angular/common/locales/it';

const makeAppt = (overrides: Record<string, unknown> = {}) => ({
  id: 1, serviceType: 'Personal Training',
  scheduledAt: new Date(2025, 5, 1, 10, 0, 0).toISOString(),
  specialistFullName: 'Luca PT', specialistRole: 'PERSONAL_TRAINER',
  patientFullName: 'Anna Rossi', status: 'CONFIRMED', notes: null,
  ...overrides
});

describe('BookingCalendarComponent', () => {
  let component: BookingCalendarComponent;
  let fixture:   ComponentFixture<BookingCalendarComponent>;

  const mockApptService = jasmine.createSpyObj('AppointmentService', ['getAll']);

  beforeAll(() => registerLocaleData(localeIt));

  beforeEach(async () => {
    mockApptService.getAll.calls.reset();
    mockApptService.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [BookingCalendarComponent],
      providers: [
        { provide: AppointmentService, useValue: mockApptService },
        { provide: LOCALE_ID, useValue: 'it-IT' },
        DatePipe
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(BookingCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  it('should create', () => expect(component).toBeTruthy());

  it('calls getAll once on init', () => expect(mockApptService.getAll).toHaveBeenCalledTimes(1));

  it('loading is false after init with empty data', () => expect(component.loading()).toBeFalse());

  // ── DatePipe self-provide ─────────────────────────────────────────────────

  describe('NullInjectorError prevention', () => {
    let localFixture: ComponentFixture<BookingCalendarComponent>;

    beforeEach(async () => {
      TestBed.resetTestingModule();
      mockApptService.getAll.and.returnValue(of([]));
      await TestBed.configureTestingModule({
        imports: [BookingCalendarComponent],
        providers: [
          { provide: AppointmentService, useValue: mockApptService },
          { provide: LOCALE_ID, useValue: 'it-IT' }
          // DatePipe intentionally omitted — component must self-provide it
        ]
      }).compileComponents();
      localFixture = TestBed.createComponent(BookingCalendarComponent);
    });

    afterEach(() => localFixture?.destroy());

    it('should not throw when DatePipe is omitted from test providers', () => {
      expect(() => localFixture.detectChanges()).not.toThrow();
      expect(localFixture.componentInstance).toBeTruthy();
    });
  });

  // ── type derived from specialistRole ─────────────────────────────────────

  describe('type mapping from specialistRole', () => {
    it('maps PERSONAL_TRAINER → fitness', async () => {
      mockApptService.getAll.and.returnValue(of([makeAppt({ specialistRole: 'PERSONAL_TRAINER' })]));
      component.load();
      await fixture.whenStable();
      expect(component.events()[0].type).toBe('fitness');
    });

    it('maps NUTRITIONIST → fitness', async () => {
      mockApptService.getAll.and.returnValue(of([makeAppt({ specialistRole: 'NUTRITIONIST' })]));
      component.load();
      await fixture.whenStable();
      expect(component.events()[0].type).toBe('fitness');
    });

    it('maps SPORT_DOCTOR → clinical', async () => {
      mockApptService.getAll.and.returnValue(of([makeAppt({ specialistRole: 'SPORT_DOCTOR' })]));
      component.load();
      await fixture.whenStable();
      expect(component.events()[0].type).toBe('clinical');
    });

    it('maps PHYSIOTHERAPIST → clinical', async () => {
      mockApptService.getAll.and.returnValue(of([makeAppt({ specialistRole: 'PHYSIOTHERAPIST' })]));
      component.load();
      await fixture.whenStable();
      expect(component.events()[0].type).toBe('clinical');
    });

    it('mixed roles produce correct types and count', async () => {
      const data = [
        makeAppt({ id: 1, specialistRole: 'PERSONAL_TRAINER' }),
        makeAppt({ id: 2, specialistRole: 'SPORT_DOCTOR', scheduledAt: new Date(2025, 5, 1, 11, 0, 0).toISOString() })
      ];
      mockApptService.getAll.and.returnValue(of(data));
      component.load();
      await fixture.whenStable();
      expect(component.events().length).toBe(2);
      expect(component.events().some(e => e.type === 'fitness')).toBeTrue();
      expect(component.events().some(e => e.type === 'clinical')).toBeTrue();
    });
  });

  // ── API error handling ────────────────────────────────────────────────────

  describe('API error handling', () => {
    it('sets loadError=true when API call fails', async () => {
      mockApptService.getAll.and.returnValue(throwError(() => new Error('API failed')));
      component.load();
      await fixture.whenStable();
      expect(component.loadError()).toBeTrue();
      expect(component.events().length).toBe(0);
    });

    it('does not set loadError when API call succeeds', async () => {
      mockApptService.getAll.and.returnValue(of([makeAppt()]));
      component.load();
      await fixture.whenStable();
      expect(component.loadError()).toBeFalse();
      expect(component.events().length).toBe(1);
    });
  });

  // ── getCalendarDays() ─────────────────────────────────────────────────────

  describe('getCalendarDays()', () => {
    it('returns an array whose length is a multiple of 7', () => {
      expect(component.getCalendarDays().length % 7).toBe(0);
    });

    it('contains real day numbers greater than 0', () => {
      expect(component.getCalendarDays().filter(d => d > 0).length).toBeGreaterThan(0);
    });

    it('leading zeros pad the first row to the correct weekday', () => {
      component.currentDate.set(new Date(2025, 5, 1)); // June 2025
      const days = component.getCalendarDays();
      const leadingZeros = days.indexOf(1);
      expect(leadingZeros).toBeGreaterThanOrEqual(0);
      expect(leadingZeros).toBeLessThan(7);
    });
  });

  // ── isToday() ─────────────────────────────────────────────────────────────

  describe('isToday()', () => {
    it('returns false for day 0 (padding slot)', () => expect(component.isToday(0)).toBeFalse());

    it('returns false for a day in a different month', () => {
      component.currentDate.set(new Date(2000, 0, 1));
      expect(component.isToday(new Date().getDate())).toBeFalse();
    });

    it('returns true when month/year/day match today', () => {
      const today = new Date();
      component.currentDate.set(new Date(today));
      expect(component.isToday(today.getDate())).toBeTrue();
    });
  });

  // ── previousPeriod() / nextPeriod() ──────────────────────────────────────

  describe('navigation', () => {
    it('previousPeriod() decrements month in month view', () => {
      component.viewMode.set('month');
      component.currentDate.set(new Date(2025, 5, 15));
      component.previousPeriod();
      expect(component.currentDate().getMonth()).toBe(4);
    });

    it('nextPeriod() increments month in month view', () => {
      component.viewMode.set('month');
      component.currentDate.set(new Date(2025, 5, 15));
      component.nextPeriod();
      expect(component.currentDate().getMonth()).toBe(6);
    });

    it('previousPeriod() decrements by 7 days in week view', () => {
      component.viewMode.set('week');
      component.currentDate.set(new Date(2025, 5, 15));
      component.previousPeriod();
      expect(component.currentDate().getDate()).toBe(8);
    });

    it('nextPeriod() increments by 7 days in week view', () => {
      component.viewMode.set('week');
      component.currentDate.set(new Date(2025, 5, 15));
      component.nextPeriod();
      expect(component.currentDate().getDate()).toBe(22);
    });

    it('goToToday() resets currentDate to today', () => {
      component.currentDate.set(new Date(2000, 0, 1));
      component.goToToday();
      const today = new Date();
      expect(component.currentDate().getDate()).toBe(today.getDate());
      expect(component.currentDate().getMonth()).toBe(today.getMonth());
    });
  });

  // ── popover / event selection ─────────────────────────────────────────────

  describe('popover', () => {
    it('openEvent() sets selectedEvent', () => {
      const event: any = { id: 1, title: 'Training', type: 'fitness' };
      component.openEvent(event);
      expect(component.selectedEvent()).toBe(event);
    });

    it('closePopover() clears selectedEvent', () => {
      component['selectedEvent'].set({ id: 1 } as any);
      component.closePopover();
      expect(component.selectedEvent()).toBeNull();
    });
  });

  // ── eventBgColor() ────────────────────────────────────────────────────────

  describe('eventBgColor()', () => {
    it('returns a color for PERSONAL_TRAINER', () => expect(component.eventBgColor('PERSONAL_TRAINER')).toBeTruthy());
    it('returns a color for NUTRITIONIST',     () => expect(component.eventBgColor('NUTRITIONIST')).toBeTruthy());
    it('returns default color for unknown role', () => {
      expect(component.eventBgColor('UNKNOWN')).toBe(component.eventBgColor('SPORT_DOCTOR'));
    });
  });

  // ── statusLabel() ─────────────────────────────────────────────────────────

  it('statusLabel maps known status to Italian label', () => {
    expect(component.statusLabel('BOOKED')).toBe('Prenotato');
    expect(component.statusLabel('CONFIRMED')).toBe('Confermato');
  });

  it('statusLabel returns raw string for unknown status', () => {
    expect(component.statusLabel('CUSTOM')).toBe('CUSTOM');
  });
});
