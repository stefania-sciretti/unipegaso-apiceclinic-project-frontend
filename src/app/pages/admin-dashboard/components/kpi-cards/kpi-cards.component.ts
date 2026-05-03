import { Component, input, computed } from '@angular/core';
import { CurrencyPipe, DecimalPipe, NgClass } from '@angular/common';
import { DashboardKpi } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, NgClass],
  templateUrl: './kpi-cards.component.html'
})
export class KpiCardsComponent {
  kpi = input.required<DashboardKpi>();

  revenueDelta = computed(() => {
    const k = this.kpi();
    if (k.revenuePrevMonth == null || k.revenuePrevMonth === 0) return 0;
    return Math.round(((k.revenueMonth - k.revenuePrevMonth) / k.revenuePrevMonth) * 100);
  });
}
