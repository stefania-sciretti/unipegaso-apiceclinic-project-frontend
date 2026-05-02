import { Directive } from '@angular/core';

/**
 * Applies the shared table data-cell styles to any <td appTd> element.
 * Extra classes can be added directly on the element and will coexist normally.
 *
 * Usage:
 *   <td appTd>...</td>
 *   <td appTd class="font-bold text-[1.1rem]">...</td>
 */
@Directive({
  selector: 'td[appTd]',
  standalone: true,
  host: {
    class: 'px-4 py-3 border-b border-[#DBE2EF] align-middle'
  }
})
export class TableTdDirective {}
