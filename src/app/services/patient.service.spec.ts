import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PatientService } from './patient.service';
import { Patient } from '../models/models';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PatientService', () => {
  let service: PatientService;
  let httpMock: HttpTestingController;

  const mockPatients: Patient[] = [
    {
      id: 1, firstName: 'John', lastName: 'Doe',
      fiscalCode: 'DOEJHN80A01H501Z', birthDate: '1980-01-01',
      email: 'john.doe@email.com', createdAt: '2024-01-01T00:00:00'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PatientService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    service = TestBed.inject(PatientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() should call GET /api/patients', () => {
    service.getAll().subscribe(patients => {
      expect(patients.length).toBe(1);
      expect(patients[0].firstName).toBe('John');
    });
    const req = httpMock.expectOne('/api/patients');
    expect(req.request.method).toBe('GET');
    req.flush(mockPatients);
  });

  it('getById(1) should call GET /api/patients/1', () => {
    service.getById(1).subscribe(p => {
      expect(p).toEqual(mockPatients[0]);
      expect(p.firstName).toBe('John');
    });
    const req = httpMock.expectOne('/api/patients/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockPatients[0]);
  });

  it('search() with query should include query param', () => {
    service.search('John').subscribe();
    const req = httpMock.expectOne(r => r.url === '/api/patients' && r.params.has('search'));
    expect(req.request.params.get('search')).toBe('John');
    req.flush([]);
  });

  it('create() should call POST /api/patients', () => {
    const body = {
      firstName: 'Jane', lastName: 'Doe',
      fiscalCode: 'DOEJNE85B41H501X', birthDate: '1985-02-01',
      email: 'jane.doe@email.com'
    };
    service.create(body).subscribe(p => expect(p.id).toBe(2));
    const req = httpMock.expectOne('/api/patients');
    expect(req.request.method).toBe('POST');
    req.flush({ ...body, id: 2, createdAt: '2024-01-01T00:00:00' });
  });

  it('update() should call PATCH /api/patients/:id', () => {
    const body = {
      firstName: 'John', lastName: 'Updated',
      fiscalCode: 'DOEJHN80A01H501Z', birthDate: '1980-01-01',
      email: 'john.updated@email.com'
    };
    service.update(1, body).subscribe(p => expect(p.lastName).toBe('Updated'));
    const req = httpMock.expectOne('/api/patients/1');
    expect(req.request.method).toBe('PUT');
    req.flush({ ...body, id: 1, createdAt: '2024-01-01T00:00:00' });
  });

  it('delete() should call DELETE /api/patients/:id', () => {
    service.delete(1).subscribe();
    const req = httpMock.expectOne('/api/patients/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
