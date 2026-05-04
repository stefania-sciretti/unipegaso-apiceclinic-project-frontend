import { Component, input, computed, effect, ViewChild, ElementRef, OnDestroy, AfterViewInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import ApexCharts from 'apexcharts';
import { AppointmentsByMonth, PeriodFilter } from '../../../../models/dashboard.model';

const MONTHS_IT = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
function formatMonth(val: string): string {
  const [year, month] = val.split('-');
  const m = parseInt(month, 10);
  if (!year || isNaN(m)) return val;
  return `${MONTHS_IT[m - 1]} '${year.slice(2)}`;
}

@Component({
  selector: 'app-appointments-chart',
  standalone: true,
  templateUrl: './appointments-chart.component.html'
})
export class AppointmentsChartComponent implements AfterViewInit, OnDestroy {
  data   = input.required<AppointmentsByMonth[]>();
  period = input.required<PeriodFilter>();

  @ViewChild('chartEl', { static: true }) chartEl!: ElementRef;
  private chart: ApexCharts | null = null;
  private readonly platformId = inject(PLATFORM_ID);
  private initialized = false;

  readonly title = computed((): string => {
    switch (this.period()) {
      case '1m': return 'Appuntamenti — Ultimo mese';
      case '3m': return 'Appuntamenti — Ultimi 3 mesi';
      case '6m': return 'Appuntamenti — Ultimi 6 mesi';
      case '1y': return 'Appuntamenti — Anno corrente';
    }
  });

  constructor() {
    effect(() => {
      const d = this.data();
      if (!this.initialized || !this.chart) return;
      this.chart.updateSeries([
        { name: 'Prenotati',  data: d.map(x => x.booked) },
        { name: 'Completati', data: d.map(x => x.completed) },
        { name: 'Cancellati', data: d.map(x => x.cancelled) }
      ]);
      this.chart.updateOptions({ xaxis: { categories: d.map(x => x.month) } }, false, false);
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.chart = new ApexCharts(this.chartEl.nativeElement, this.buildOptions(this.data()));
    this.chart.render().then(() => { this.initialized = true; });
  }

  ngOnDestroy(): void { this.chart?.destroy(); }

  private buildOptions(data: AppointmentsByMonth[]): ApexCharts.ApexOptions {
    return {
      chart: { type: 'bar', height: 260, toolbar: { show: false }, fontFamily: 'Inter, sans-serif', foreColor: '#374151' },
      theme: { mode: 'light' },
      series: [
        { name: 'Prenotati',  data: data.map(d => d.booked) },
        { name: 'Completati', data: data.map(d => d.completed) },
        { name: 'Cancellati', data: data.map(d => d.cancelled) }
      ],
      xaxis: {
        categories: data.map(d => d.month),
        labels: {
          rotate: -45,
          rotateAlways: true,
          formatter: (val: string) => formatMonth(val),
          style: { fontSize: '11px' }
        }
      },
      colors: ['#6366f1', '#22c55e', '#ef4444'],
      dataLabels: { enabled: false },
      plotOptions: { bar: { borderRadius: 4 } },
      legend: {
        position: 'bottom',
        markers: { size: 8 },
        labels: { colors: '#374151' },
        formatter: (name: string) => `<span style="color:#374151;font-size:12px">${name}</span>`
      },
      tooltip: { enabled: false }
    };
  }
}
