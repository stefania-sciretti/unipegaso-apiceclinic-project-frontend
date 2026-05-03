import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats, PeriodFilter } from '../../../models/dashboard.model';

const API_URL = '/api/dashboard';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getStats(period: PeriodFilter): Observable<DashboardStats> {
    const params = new HttpParams().set('period', period);
    return this.http.get<DashboardStats>(API_URL, { params });
  }
}
