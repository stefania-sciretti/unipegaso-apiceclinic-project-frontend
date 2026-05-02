import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {DietPlanService} from './diet-plan.service';
import {DietPlan, DietPlanRequest} from '../models/models';

describe('DietPlanService', () => {
  let service: DietPlanService;
  let httpMock: HttpTestingController;

  const mockPlan: DietPlan = {
    id: 1,
    patientId: 1,
    patientFirstName: 'John',
    patientLastName: 'Doe',
    specialistId: 2,
    specialistFirstName: 'Jane',
    specialistLastName: 'Smith',
    title: 'Weight Loss Plan',
    description: 'A balanced diet for weight loss',
    calories: 2000,
    durationWeeks: 8,
    active: true,
    createdAt: '2024-01-01'
  };

  const mockRequest: DietPlanRequest = {
    patientId: 1,
    specialistId: 2,
    title: 'Weight Loss Plan',
    description: 'A balanced diet for weight loss',
    calories: 2000,
    durationWeeks: 8,
    active: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DietPlanService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    service = TestBed.inject(DietPlanService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll()', () => {
    it('should call GET /api/diet-plans without clientId', () => {
      const mockPlans: DietPlan[] = [mockPlan];

      service.getAll().subscribe(plans => {
        expect(plans.length).toBe(1);
        expect(plans).toEqual(mockPlans);
      });

      const req = httpMock.expectOne('/api/diet-plans');
      expect(req.request.params.keys().length).toBe(0);
      expect(req.request.method).toBe('GET');
      req.flush(mockPlans);
    });

    it('should include patientId query param when provided', () => {
      const mockPlans: DietPlan[] = [mockPlan];

      service.getAll(1).subscribe(plans => {
        expect(plans).toEqual(mockPlans);
      });

      const req = httpMock.expectOne(r => r.url === '/api/diet-plans' && r.params.has('patientId'));
      expect(req.request.params.get('patientId')).toBe('1');
      expect(req.request.method).toBe('GET');
      req.flush(mockPlans);
    });
  });

  describe('getById()', () => {
    it('should call GET /api/diet-plans/:id', () => {
      service.getById(1).subscribe(plan => {
        expect(plan).toEqual(mockPlan);
      });

      const req = httpMock.expectOne('/api/diet-plans/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockPlan);
    });
  });

  describe('create()', () => {
    it('should call POST /api/diet-plans with request body', () => {
      service.create(mockRequest).subscribe(plan => {
        expect(plan).toEqual(mockPlan);
      });

      const req = httpMock.expectOne('/api/diet-plans');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRequest);
      req.flush(mockPlan);
    });
  });

  describe('update()', () => {
    it('should call PUT /api/diet-plans/:id with request body', () => {
      const id = 1;
      const requestBody: DietPlanRequest = {
        patientId: 1,
        specialistId: 2,
        title: 'Updated Weight Loss Plan',
        description: 'An improved balanced diet',
        calories: 1800,
        durationWeeks: 10,
        active: true
      };

      const mockResponse: DietPlan = {
        ...mockPlan,
        title: 'Updated Weight Loss Plan',
        description: 'An improved balanced diet',
        calories: 1800,
        durationWeeks: 10
      };

      service.update(id, requestBody).subscribe(plan => {
        expect(plan).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`/api/diet-plans/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(requestBody);
      req.flush(mockResponse);
    });
  });

  describe('delete()', () => {
    it('should call DELETE /api/diet-plans/:id', () => {
      const id = 1;

      service.delete(id).subscribe();

      const req = httpMock.expectOne(`/api/diet-plans/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });
});
