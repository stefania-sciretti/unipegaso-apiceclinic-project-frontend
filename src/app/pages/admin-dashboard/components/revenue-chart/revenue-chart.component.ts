import { Component, input, effect, ViewChild, ElementRef, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  private readonly platformId = inject(PLATFORM_ID);
  private chart: ApexCharts | null = null;
  private rendered = false;

  constructor() {
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      const d = this.data();
      if (this.chart && this.rendered) {
        this.chart.updateOptions(this.buildOptions(d));
      } else if (!this.chart) {
        this.chart = new ApexCharts(this.chartEl.nativeElement, this.buildOptions(d));
        this.chart.render().then(() => { this.rendered = true; });
      }
    });
  }

  ngOnDestroy(): void { this.chart?.destroy(); }

  buildOptions(data: RevenueByMonth[]): ApexCharts.ApexOptions {
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
