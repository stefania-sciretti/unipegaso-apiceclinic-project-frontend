import { Component, input, effect, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import ApexCharts from 'apexcharts';
import { RevenueByService } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-service-donut',
  standalone: true,
  templateUrl: './service-donut.component.html'
})
export class ServiceDonutComponent implements OnDestroy {
  data = input.required<RevenueByService[]>();
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

  buildOptions(data: RevenueByService[]): ApexCharts.ApexOptions {
    return {
      chart: { type: 'donut', height: 220, fontFamily: 'Inter, sans-serif' },
      series: data.map(d => d.total),
      labels: data.map(d => d.service),
      colors: ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6'],
      plotOptions: { pie: { donut: { size: '60%' } } },
      legend: { position: 'bottom', fontSize: '12px' },
      dataLabels: { enabled: false },
      tooltip: { y: { formatter: (v: number) => `€${v.toLocaleString('it-IT')}` } }
    };
  }
}
