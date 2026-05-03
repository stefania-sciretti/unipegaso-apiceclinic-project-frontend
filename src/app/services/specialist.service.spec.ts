import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {SpecialistService} from './specialist.service';
import {Specialist} from '../models/models';

describe('SpecialistService', () => {
  let service: SpecialistService;
  let httpMock: HttpTestingController;

  const mockSpecialist: Specialist = {
    id: 1, firstName: 'Luca', lastName: 'Siretta',
    role: 'PERSONAL_TRAINER', email: 'luca@test.com',
    createdAt: '2024-01-01T00:00:00',
    area: { id: 1, name: 'Sport' }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpecialistService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    service  = TestBed.inject(SpecialistService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('getAll() without role should GET /api/specialists', () => {
    service.getAll().subscribe(list => {
      expect(list).toEqual([mockSpecialist]);
      expect(list[0].firstName).toBe('Luca');
    });
    const req = httpMock.expectOne('/api/specialists');
    expect(req.request.params.keys().length).toBe(0);
    expect(req.request.method).toBe('GET');
    req.flush([mockSpecialist]);
  });

  it('getAll(role) should include ?role query param', () => {
    service.getAll('PERSONAL_TRAINER').subscribe(list => {
      expect(list).toEqual([mockSpecialist]);
    });
    const req = httpMock.expectOne(r => r.params.has('role'));
    expect(req.request.params.get('role')).toBe('PERSONAL_TRAINER');
    expect(req.request.method).toBe('GET');
    req.flush([mockSpecialist]);
  });

  it('getById(1) should GET /api/specialists/1', () => {
    service.getById(1).subscribe(s => {
      expect(s).toEqual(mockSpecialist);
      expect(s.role).toBe('PERSONAL_TRAINER');
    });
    const req = httpMock.expectOne('/api/specialists/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockSpecialist);
  });
});
