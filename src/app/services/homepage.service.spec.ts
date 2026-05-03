import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {HomepageService} from './homepage.service';
import {HomepageStats} from '../models/models';

describe('HomepageService', () => {
  let service: HomepageService;
  let httpMock: HttpTestingController;

  const mockStats: HomepageStats = {
    totalClients: 5,
    totalAppointments: 10,
    bookedAppointments: 3,
    completedAppointments: 7,
    activeDietPlans: 4,
    activeTrainingPlans: 6,
    totalRecipes: 15
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HomepageService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    service = TestBed.inject(HomepageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getStats() calls GET /api/homepage and returns stats', () => {
    service.getStats().subscribe(stats => {
      expect(stats).toEqual(mockStats);
    });

    const req = httpMock.expectOne('/api/homepage');
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });
});
