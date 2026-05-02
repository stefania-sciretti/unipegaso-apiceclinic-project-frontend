import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AppointmentService } from './appointment.service';
import { FitnessAppointment } from '../models/models';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let httpMock: HttpTestingController;

  const mockAppointment: FitnessAppointment = {
    id: 1, patientId: 1, patientFullName: 'John Doe',
    specialistId: 1, specialistFullName: 'Laura Smith', specialistRole: 'TRAINER',
    scheduledAt: '2025-06-01T10:00:00', serviceType: 'Personal Training',
    status: 'BOOKED', createdAt: '2024-01-01T00:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppointmentService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    service = TestBed.inject(AppointmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('getAll() without filters should call GET /api/appointments', () => {
    service.getAll().subscribe(list => expect(list.length).toBe(1));
    const req = httpMock.expectOne('/api/appointments');
    expect(req.request.method).toBe('GET');
    req.flush([mockAppointment]);
  });

  it('getAll() with status filter should include query param', () => {
    service.getAll({ status: 'BOOKED' }).subscribe();
    const req = httpMock.expectOne(r => r.url === '/api/appointments' && r.params.has('status'));
    expect(req.request.params.get('status')).toBe('BOOKED');
    req.flush([]);
  });

  it('create() should POST to /api/appointments', () => {
    const body = {
      patientId: 1, specialistId: 1,
      scheduledAt: '2025-06-01T10:00:00',
      serviceType: 'Personal Training'
    };
    service.create(body).subscribe(a => expect(a.status).toBe('BOOKED'));
    const req = httpMock.expectOne('/api/appointments');
    expect(req.request.method).toBe('POST');
    req.flush(mockAppointment);
  });

  it('updateStatus() should PUT to /api/appointments/:id/status', () => {
    service.updateStatus(1, 'CONFIRMED').subscribe(a => expect(a.status).toBe('CONFIRMED'));
    const req = httpMock.expectOne('/api/appointments/1/status');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ status: 'CONFIRMED' });
    req.flush({ ...mockAppointment, status: 'CONFIRMED' });
  });

  it('delete() should call DELETE /api/appointments/:id', () => {
    service.delete(1).subscribe();
    const req = httpMock.expectOne('/api/appointments/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
