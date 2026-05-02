import { Component, input } from '@angular/core';

export interface TableColumn {
  label: string;
  extraClass?: string;
}

/**
 * Reusable table header cell.
 * Renders a <th> with the shared project styles and optionally appends
 * extra Tailwind classes (e.g. fixed-width overrides for action columns).
 *
 * Usage:
 *   <th app-table-th [col]="col"></th>
 */
@Component({
  selector: 'th[app-table-th]',
  standalone: true,
  host: {
    class: 'bg-[#eef4f9] px-4 py-3 text-left font-semibold text-[#112D4E] border-b-2 border-[#DBE2EF] whitespace-nowrap',
    '[class]': 'col().extraClass ?? ""'
  },
  template: '{{ col().label }}'
})
export class TableThComponent {
  readonly col = input.required<TableColumn>();
}
