import { Component, input, computed } from '@angular/core';
import { CurrencyPipe, DecimalPipe, NgClass } from '@angular/common';
import { DashboardKpi, PeriodFilter } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, NgClass],
  templateUrl: './kpi-cards.component.html'
})
export class KpiCardsComponent {
  kpi    = input.required<DashboardKpi>();
  period = input.required<PeriodFilter>();

  revenueDelta = computed(() => {
    const k = this.kpi();
    if (k.revenuePrevMonth == null || k.revenuePrevMonth === 0) return 0;
    return Math.round(((k.revenueMonth - k.revenuePrevMonth) / k.revenuePrevMonth) * 100);
  });

  periodLabel = computed((): string => {
    switch (this.period()) {
      case '1m': return 'del mese';
      case '3m': return 'ultimi 3 mesi';
      case '6m': return 'ultimi 6 mesi';
      case '1y': return 'anno corrente';
    }
  });
}
