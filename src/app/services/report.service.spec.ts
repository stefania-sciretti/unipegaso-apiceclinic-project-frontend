import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {Report, ReportRequest, ReportService} from './report.service';

describe('ReportService', () => {
  let service: ReportService;
  let httpMock: HttpTestingController;

  const mockReport: Report = {
    id: 1, appointmentId: 1,
    patientFullName: 'Anna Rossi', specialistFullName: 'Laura Smith',
    visitType: 'Visita Cardiologica',
    scheduledAt: '2026-06-01T10:00:00',
    issuedDate: '2026-06-01',
    diagnosis: 'Tutto nella norma', createdAt: '2024-01-01T00:00:00'
  };
  const mockRequest: ReportRequest = {
    appointmentId: 1,
    diagnosis: 'Tutto nella norma'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReportService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    service  = TestBed.inject(ReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('getAll() should GET /api/reports', () => {
    service.getAll().subscribe(list => {
      expect(list).toEqual([mockReport]);
      expect(list[0].diagnosis).toBe('Tutto nella norma');
    });
    const req = httpMock.expectOne('/api/reports');
    expect(req.request.method).toBe('GET');
    req.flush([mockReport]);
  });

  it('getById(1) should GET /api/reports/1', () => {
    service.getById(1).subscribe(r => {
      expect(r).toEqual(mockReport);
      expect(r.patientFullName).toBe('Anna Rossi');
    });
    const req = httpMock.expectOne('/api/reports/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockReport);
  });

  it('create(request) should POST /api/reports with body', () => {
    service.create(mockRequest).subscribe(r => {
      expect(r).toEqual(mockReport);
      expect(r.id).toBe(1);
    });
    const req = httpMock.expectOne('/api/reports');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockReport);
  });

  it('update(1, request) should PUT /api/reports/1 with body', () => {
    service.update(1, mockRequest).subscribe(r => {
      expect(r).toEqual(mockReport);
      expect(r.diagnosis).toBe('Tutto nella norma');
    });
    const req = httpMock.expectOne('/api/reports/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockReport);
  });
});
