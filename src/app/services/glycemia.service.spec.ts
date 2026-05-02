import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {GlycemiaService} from './glycemia.service';
import {GlycemiaMeasurement, GlycemiaMeasurementRequest} from '../models/models';

describe('GlycemiaService', () => {
  let service: GlycemiaService;
  let httpMock: HttpTestingController;

  const mockMeasurement: GlycemiaMeasurement = {
    id: 1,
    patientId: 1,
    patientFullName: 'John Doe',
    specialistId: 1,
    specialistFullName: 'Jane Smith',
    measuredAt: '2024-01-10T08:00:00Z',
    valueMgDl: 120,
    context: 'A_DIGIUNO',
    classification: 'NORMALE',
    notes: 'Test measurement',
    createdAt: '2024-01-10T08:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GlycemiaService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    service = TestBed.inject(GlycemiaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() without clientId should GET /api/glycemia-measurements', () => {
    service.getAll().subscribe(result => {
      expect(result).toEqual([mockMeasurement]);
    });

    const req = httpMock.expectOne('/api/glycemia-measurements');
    expect(req.request.method).toBe('GET');
    req.flush([mockMeasurement]);
  });

  it('getAll(1) with patientId should include ?patientId=1 query param', () => {
    service.getAll(1).subscribe(result => {
      expect(result).toEqual([mockMeasurement]);
    });

    const req = httpMock.expectOne(r => r.params.has('patientId'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('patientId')).toBe('1');
    req.flush([mockMeasurement]);
  });

  it('getById(1) should GET /api/glycemia-measurements/1', () => {
    service.getById(1).subscribe(result => {
      expect(result).toEqual(mockMeasurement);
    });

    const req = httpMock.expectOne('/api/glycemia-measurements/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockMeasurement);
  });

  it('create(request) should POST /api/glycemia-measurements with body', () => {
    const createRequest: GlycemiaMeasurementRequest = {
      patientId: 1,
      specialistId: 1,
      measuredAt: '2024-01-10T08:00:00Z',
      valueMgDl: 120,
      context: 'A_DIGIUNO',
      notes: 'Test measurement'
    };

    service.create(createRequest).subscribe(result => {
      expect(result).toEqual(mockMeasurement);
    });

    const req = httpMock.expectOne('/api/glycemia-measurements');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(createRequest);
    req.flush(mockMeasurement);
  });

  it('update(1, request) should PUT /api/glycemia-measurements/1 with body', () => {
    const updateRequest: GlycemiaMeasurementRequest = {
      patientId: 1,
      specialistId: 1,
      measuredAt: '2024-01-10T08:00:00Z',
      valueMgDl: 130,
      context: 'POST_PASTO_1H',
      notes: 'Updated measurement'
    };

    service.update(1, updateRequest).subscribe(result => {
      expect(result).toEqual(mockMeasurement);
    });

    const req = httpMock.expectOne('/api/glycemia-measurements/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateRequest);
    req.flush(mockMeasurement);
  });

  it('delete(1) should DELETE /api/glycemia-measurements/1', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne('/api/glycemia-measurements/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
