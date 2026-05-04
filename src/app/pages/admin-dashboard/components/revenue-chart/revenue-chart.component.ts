import { Component, input, computed, effect, ViewChild, ElementRef, OnDestroy, AfterViewInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import ApexCharts from 'apexcharts';
import { RevenueByMonth, PeriodFilter } from '../../../../models/dashboard.model';

const MONTHS_IT = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
function formatMonth(val: string): string {
  const [year, month] = val.split('-');
  const m = parseInt(month, 10);
  if (!year || isNaN(m)) return val;
  return `${MONTHS_IT[m - 1]} '${year.slice(2)}`;
}

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  templateUrl: './revenue-chart.component.html'
})
export class RevenueChartComponent implements AfterViewInit, OnDestroy {
  data   = input.required<RevenueByMonth[]>();
  period = input.required<PeriodFilter>();

  @ViewChild('chartEl', { static: true }) chartEl!: ElementRef;
  private readonly platformId = inject(PLATFORM_ID);
  private chart: ApexCharts | null = null;
  private initialized = false;

  readonly title = computed((): string => {
    switch (this.period()) {
      case '1m': return 'Ricavi — Ultimo mese';
      case '3m': return 'Ricavi — Ultimi 3 mesi';
      case '6m': return 'Ricavi — Ultimi 6 mesi';
      case '1y': return 'Ricavi — Anno corrente';
    }
  });

  constructor() {
    effect(() => {
      const d = this.data();
      if (!this.initialized || !this.chart) return;
      this.chart.updateSeries([{ name: 'Ricavi (€)', data: d.map(x => x.total) }]);
      this.chart.updateOptions({ xaxis: { categories: d.map(x => x.month) } }, false, false);
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.chart = new ApexCharts(this.chartEl.nativeElement, this.buildOptions(this.data()));
    this.chart.render().then(() => { this.initialized = true; });
  }

  ngOnDestroy(): void { this.chart?.destroy(); }

  private buildOptions(data: RevenueByMonth[]): ApexCharts.ApexOptions {
    return {
      chart: { type: 'bar', height: 240, toolbar: { show: false }, fontFamily: 'Inter, sans-serif', foreColor: '#374151' },
      theme: { mode: 'light' },
      series: [{ name: 'Ricavi (€)', data: data.map(d => d.total) }],
      xaxis: {
        categories: data.map(d => d.month),
        labels: {
          rotate: -45,
          rotateAlways: true,
          formatter: (val: string) => formatMonth(val),
          style: { fontSize: '11px' }
        }
      },
      colors: ['#6366f1'],
      dataLabels: { enabled: false },
      plotOptions: { bar: { borderRadius: 4 } },
      yaxis: { labels: { formatter: (v: number) => `€${v.toLocaleString('it-IT')}` } },
      legend: { show: false },
      tooltip: { enabled: false }
    };
  }
}
