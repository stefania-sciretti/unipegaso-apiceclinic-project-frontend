import { Component, DestroyRef, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DashboardService } from './services/dashboard.service';
import { DashboardStats, PeriodFilter } from '../../models/dashboard.model';
import { KpiCardsComponent } from './components/kpi-cards/kpi-cards.component';
import { RevenueChartComponent } from './components/revenue-chart/revenue-chart.component';
import { AppointmentsChartComponent } from './components/appointments-chart/appointments-chart.component';
import { ServiceDonutComponent } from './components/service-donut/service-donut.component';
import { ButtonComponent } from '../../components/ui/button/button.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [KpiCardsComponent, RevenueChartComponent, AppointmentsChartComponent, ButtonComponent, ServiceDonutComponent],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error   = signal(false);
  readonly stats   = signal<DashboardStats | null>(null);
  readonly period  = signal<PeriodFilter>('6m');

  readonly periods: { label: string; value: PeriodFilter }[] = [
    { label: 'Ultimo mese',    value: '1m' },
    { label: 'Ultimi 3 mesi',  value: '3m' },
    { label: 'Ultimi 6 mesi',  value: '6m' },
    { label: 'Anno corrente',  value: '1y' }
  ];

  constructor() { this.loadStats(); }

  selectPeriod(p: PeriodFilter): void {
    this.period.set(p);
    this.loadStats();
  }

  private loadStats(): void {
    this.loading.set(true);
    this.error.set(false);
    this.dashboardService.getStats(this.period()).pipe(
      catchError(() => { this.error.set(true); return of(null); }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => {
      this.stats.set(data);
      this.loading.set(false);
    });
  }
}
