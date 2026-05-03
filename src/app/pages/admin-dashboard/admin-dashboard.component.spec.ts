import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { DashboardService } from './services/dashboard.service';
import { DashboardStats } from '../../models/dashboard.model';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';

registerLocaleData(localeIt);

const MOCK_STATS: DashboardStats = {
  kpi: {
    revenueMonth: 12450, revenuePrevMonth: 11500, activePatients: 148,
    newPatients: 3, appointmentsMonth: 87, cancellationRate: 5, agendaOccupancy: 74
  },
  revenueByMonth: [{ month: 'Dic', total: 12450 }],
  appointmentsByMonth: [{ month: 'Dic', booked: 87, completed: 80, cancelled: 7 }],
  revenueByService: [{ service: 'Fitness', total: 12450 }]
};

describe('AdminDashboardComponent', () => {
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let mockService: jasmine.SpyObj<DashboardService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj<DashboardService>('DashboardService', ['getStats']);
    mockService.getStats.and.returnValue(of(MOCK_STATS));

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        { provide: DashboardService, useValue: mockService },
        { provide: LOCALE_ID, useValue: 'it' }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    fixture.detectChanges();
  });

  it('should create and call getStats with default period 6m', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(mockService.getStats).toHaveBeenCalledWith('6m');
  });

  it('should set loading to false after data loads', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(fixture.componentInstance.loading()).toBeFalse();
  }));

  it('should set error signal on service failure', fakeAsync(() => {
    mockService.getStats.and.returnValue(throwError(() => new Error('API error')));
    fixture.componentInstance.selectPeriod('1m');
    tick();
    fixture.detectChanges();
    expect(fixture.componentInstance.error()).toBeTrue();
  }));

  it('should call getStats again when period changes', fakeAsync(() => {
    fixture.componentInstance.selectPeriod('1m');
    tick();
    expect(mockService.getStats).toHaveBeenCalledWith('1m');
  }));
});
