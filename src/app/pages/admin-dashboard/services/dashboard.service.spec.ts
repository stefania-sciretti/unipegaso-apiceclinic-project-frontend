import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DashboardService } from './dashboard.service';
import { DashboardStats } from '../../../models/dashboard.model';

const MOCK_STATS: DashboardStats = {
  kpi: {
    revenueMonth: 12450, revenuePrevMonth: 11500,
    activePatients: 148, newPatients: 3,
    appointmentsMonth: 87, cancellationRate: 5, agendaOccupancy: 74
  },
  revenueByMonth: [
    { month: 'Nov', total: 10000 },
    { month: 'Dic', total: 12450 }
  ],
  appointmentsByMonth: [{ month: 'Nov', booked: 80, completed: 70, cancelled: 10 }],
  revenueByService: [
    { service: 'Nutrizione', total: 5000 },
    { service: 'Fitness', total: 7450 }
  ]
};

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service  = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should call GET /api/dashboard with period=6m', () => {
    service.getStats('6m').subscribe(stats => {
      expect(stats).toEqual(MOCK_STATS);
    });
    const req = httpMock.expectOne(r =>
      r.url === '/api/dashboard' && r.params.get('period') === '6m'
    );
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_STATS);
  });

  it('should pass period=1m when requested', () => {
    service.getStats('1m').subscribe(stats => {
      expect(stats).toEqual(MOCK_STATS);
    });
    const req = httpMock.expectOne(r =>
      r.url === '/api/dashboard' && r.params.get('period') === '1m'
    );
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_STATS);
  });
});
