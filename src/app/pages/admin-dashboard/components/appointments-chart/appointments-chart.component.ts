import { Component, input, effect, ViewChild, ElementRef, OnDestroy, AfterViewInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import ApexCharts from 'apexcharts';
import { AppointmentsByMonth } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-appointments-chart',
  standalone: true,
  templateUrl: './appointments-chart.component.html'
})
export class AppointmentsChartComponent implements AfterViewInit, OnDestroy {
  data = input.required<AppointmentsByMonth[]>();
  @ViewChild('chartEl', { static: true }) chartEl!: ElementRef;
  private chart: ApexCharts | null = null;
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    effect(() => {
      const d = this.data();
      if (this.chart) {
        this.chart.updateOptions(this.buildOptions(d));
      }
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.chart = new ApexCharts(this.chartEl.nativeElement, this.buildOptions(this.data()));
    this.chart.render();
  }

  ngOnDestroy(): void { this.chart?.destroy(); }

  buildOptions(data: AppointmentsByMonth[]): ApexCharts.ApexOptions {
    return {
      chart: { type: 'bar', height: 260, toolbar: { show: false }, fontFamily: 'Inter, sans-serif', foreColor: '#374151' },
      theme: { mode: 'light' },
      series: [
        { name: 'Prenotati',  data: data.map(d => d.booked) },
        { name: 'Completati', data: data.map(d => d.completed) },
        { name: 'Cancellati', data: data.map(d => d.cancelled) }
      ],
      xaxis: { categories: data.map(d => d.month) },
      colors: ['#6366f1', '#22c55e', '#ef4444'],
      dataLabels: { enabled: false },
      plotOptions: { bar: { borderRadius: 4 } },
      legend: {
        position: 'bottom',
        markers: { size: 8 },
        labels: { colors: '#374151' },
        formatter: (name: string) => `<span style="color:#374151;font-size:12px">${name}</span>`
      },
      tooltip: {
        enabled: false,
      }
      };
  }
}
