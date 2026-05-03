import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {HomepageComponent} from './homepage.component';
import {AppointmentService} from '../../services/appointment.service';
import {ClinicalAppointmentService} from '../../services/clinical-appointment.service';
import {AuthService} from '../../services/auth.service';
import {BookingService} from '../../services/booking.service';
import {ClinicServicesService} from '../../services/clinic-services.service';
import {SpecialistService} from '../../services/specialist.service';
import {Router} from '@angular/router';

describe('HomepageComponent', () => {
  let component: HomepageComponent;
  let fixture: ComponentFixture<HomepageComponent>;

  const mockApptService         = jasmine.createSpyObj('AppointmentService', ['create', 'getAll']);
  const mockClinicalApptService = jasmine.createSpyObj('ClinicalAppointmentService', ['getAll']);
  const mockAuthService         = jasmine.createSpyObj('AuthService', ['openLoginModal'],
    { currentUser: null, isLoggedIn: false });
  const mockBookingService      = jasmine.createSpyObj('BookingService', ['setPendingBooking', 'clearPendingBooking']);
  const mockClinicSvc           = jasmine.createSpyObj('ClinicServicesService', ['getAll']);
  const mockSpecialistSvc       = jasmine.createSpyObj('SpecialistService', ['getAll']);

  beforeEach(async () => {
    mockApptService.getAll.calls.reset();
    mockClinicalApptService.getAll.calls.reset();
    mockApptService.create.calls.reset();
    mockAuthService.openLoginModal.calls.reset();
    mockBookingService.setPendingBooking.calls.reset();
    mockBookingService.clearPendingBooking.calls.reset();
    mockApptService.getAll.and.returnValue(of([]));
    mockClinicalApptService.getAll.and.returnValue(of([]));
    mockApptService.create.and.returnValue(of({}));
    mockClinicSvc.getAll.and.returnValue(of([]));
    mockSpecialistSvc.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [HomepageComponent],
      providers: [
        { provide: AppointmentService,         useValue: mockApptService },
        { provide: ClinicalAppointmentService, useValue: mockClinicalApptService },
        { provide: AuthService,                useValue: mockAuthService },
        { provide: BookingService,             useValue: mockBookingService },
        { provide: ClinicServicesService,      useValue: mockClinicSvc },
        { provide: SpecialistService,          useValue: mockSpecialistSvc },
        { provide: Router,                     useValue: { navigate: jasmine.createSpy() } }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(HomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('bookingAreas() returns an array', () => {
    expect(Array.isArray(component.bookingAreas())).toBeTrue();
  });

  it('getCalendarDays() returns real day numbers', () => {
    const days = component.getCalendarDays();
    const realDays = days.filter(d => d > 0);
    expect(realDays.length).toBeGreaterThan(0);
  });

  it('getAvailableSlots() returns empty array when no date selected', () => {
    component.selectedDate = '';
    expect(component.getAvailableSlots()).toEqual([]);
  });

  it('selectArea() sets selectedArea and clears selectedService', () => {
    const area = { id: 1, label: 'Area Test', icon: 'test', image: '', appointmentType: 'fitness' as const, navPath: '/test', navLabel: 'Test →', services: [] };
    component.selectArea(area);
    expect(component.selectedArea).toBe(area);
    expect(component.selectedService).toBeNull();
  });
});
