import { Component, input, effect, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import ApexCharts from 'apexcharts';
import { AppointmentsByMonth } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-appointments-chart',
  standalone: true,
  templateUrl: './appointments-chart.component.html'
})
export class AppointmentsChartComponent implements OnDestroy {
  data = input.required<AppointmentsByMonth[]>();
  @ViewChild('chartEl', { static: true }) chartEl!: ElementRef;
  private chart: ApexCharts | null = null;

  constructor() {
    effect(() => {
      const d = this.data();
      try {
        if (this.chart) {
          this.chart.updateOptions(this.buildOptions(d));
        } else {
          this.chart = new ApexCharts(this.chartEl.nativeElement, this.buildOptions(d));
          this.chart.render();
        }
      } catch (_) { /* no-op in test/JSDOM environments */ }
    });
  }

  ngOnDestroy(): void { this.chart?.destroy(); }

  buildOptions(data: AppointmentsByMonth[]): object {
    return {
      chart: { type: 'bar', height: 220, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
      series: [
        { name: 'Prenotati',  data: data.map(d => d.booked) },
        { name: 'Completati', data: data.map(d => d.completed) },
        { name: 'Cancellati', data: data.map(d => d.cancelled) }
      ],
      xaxis: { categories: data.map(d => d.month) },
      colors: ['#6366f1', '#22c55e', '#ef4444'],
      dataLabels: { enabled: false },
      plotOptions: { bar: { borderRadius: 4 } },
      tooltip: { shared: true, intersect: false }
    };
  }
}
