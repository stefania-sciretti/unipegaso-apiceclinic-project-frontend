import { Component, input, effect, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import ApexCharts from 'apexcharts';
import { RevenueByMonth } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  templateUrl: './revenue-chart.component.html'
})
export class RevenueChartComponent implements OnDestroy {
  data = input.required<RevenueByMonth[]>();
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

  buildOptions(data: RevenueByMonth[]): object {
    return {
      chart: { type: 'bar', height: 220, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
      series: [{ name: 'Ricavi (€)', data: data.map(d => d.total) }],
      xaxis: { categories: data.map(d => d.month) },
      colors: ['#6366f1'],
      dataLabels: { enabled: false },
      plotOptions: { bar: { borderRadius: 4 } },
      yaxis: { labels: { formatter: (v: number) => `€${v.toLocaleString('it-IT')}` } },
      tooltip: { y: { formatter: (v: number) => `€${v.toLocaleString('it-IT')}` } }
    };
  }
}
