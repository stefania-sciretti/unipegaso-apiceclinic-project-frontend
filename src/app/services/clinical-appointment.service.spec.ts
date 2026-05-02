import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {ClinicalAppointmentService} from './clinical-appointment.service';
import {ClinicalAppointment} from '../models/models';

describe('ClinicalAppointmentService', () => {
  let service: ClinicalAppointmentService;
  let httpMock: HttpTestingController;

  const mockAppt: ClinicalAppointment = {
    id: 1,
    patientId: 1,
    patientFullName: 'John Doe',
    specialistId: 1,
    specialistFullName: 'Laura Smith',
    specialistRole: 'Cardiology',
    scheduledAt: '2026-06-01T10:00:00',
    visitType: 'Cardiology Check-up',
    status: 'BOOKED',
    hasReport: false,
    createdAt: '2024-01-01T00:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClinicalAppointmentService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    service = TestBed.inject(ClinicalAppointmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() without filters calls GET /api/appointments', () => {
    service.getAll().subscribe(list => expect(list.length).toBe(1));
    const req = httpMock.expectOne(r => r.url === '/api/appointments');
    expect(req.request.method).toBe('GET');
    req.flush([mockAppt]);
  });

  it('getAll({ patientId: 1 }) includes ?patientId=1 query param', () => {
    service.getAll({ patientId: 1 }).subscribe();
    const req = httpMock.expectOne(r => r.params.has('patientId'));
    expect(req.request.params.get('patientId')).toBe('1');
    req.flush([]);
  });

  it("getAll({ status: 'BOOKED' }) includes ?status=BOOKED query param", () => {
    service.getAll({ status: 'BOOKED' }).subscribe();
    const req = httpMock.expectOne(r => r.params.has('status'));
    expect(req.request.params.get('status')).toBe('BOOKED');
    req.flush([]);
  });

  it('getById(1) calls GET /api/appointments/1', () => {
    service.getById(1).subscribe(appt => {
      expect(appt.visitType).toBe('Cardiology Check-up');
    });
    const req = httpMock.expectOne('/api/appointments/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockAppt);
  });
});

