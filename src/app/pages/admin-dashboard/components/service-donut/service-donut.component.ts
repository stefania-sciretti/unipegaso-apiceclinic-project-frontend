import { Component, input, effect, ViewChild, ElementRef, OnDestroy, AfterViewInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import ApexCharts from 'apexcharts';
import { RevenueByArea } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-service-donut',
  standalone: true,
  templateUrl: './service-donut.component.html'
})
export class ServiceDonutComponent implements AfterViewInit, OnDestroy {
  data = input.required<RevenueByArea[]>();
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

  buildOptions(data: RevenueByArea[]): ApexCharts.ApexOptions {
    return {
      chart: { type: 'donut', height: 260, fontFamily: 'Inter, sans-serif', foreColor: '#374151' },
      theme: { mode: 'light' },
      series: data.map(d => d.total),
      labels: data.map(d => d.area.areaName),
      colors: ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6'],
      plotOptions: { pie: { donut: { size: '60%' } } },
      legend: {
        show: true,
        position: 'bottom',
        fontSize: '12px',
        markers: { size: 8 },
        labels: { colors: '#374151' },
        formatter: (name: string) => `<span style="color:#374151;font-size:12px">${name}</span>`
      },
      dataLabels: { enabled: false },
      tooltip: { enabled: false }
    };
  }
}
