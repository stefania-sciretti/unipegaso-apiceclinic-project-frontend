import { Component, input, output, computed } from '@angular/core';

/**
 * Reusable pagination bar with dynamic progress counter.
 *
 * Usage:
 *   <app-pagination
 *     [currentPage]="pg.currentPage()"
 *     [totalPages]="pg.totalPages()"
 *     [progressLabel]="pg.progressLabel()"
 *     (pageChange)="pg.goToPage($event)" />
 */
@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <div class="flex items-center justify-center mt-4 flex-wrap gap-3">

      <!-- Controlli navigazione -->
      <div class="flex items-center gap-1">
        <button
          class="px-2 py-1 rounded-[8px] text-[1rem] font-semibold cursor-pointer transition-colors duration-150 border-0 bg-white text-[#3F72AF] hover:bg-[#eef4f9] disabled:opacity-40 disabled:cursor-not-allowed"
          [disabled]="currentPage() <= 1"
          (click)="pageChange.emit(currentPage() - 1)"
          aria-label="Pagina precedente">
          ‹
        </button>

        @for (page of pages(); track page) {
          <button
            class="px-3 py-1 rounded-[8px] text-[0.82rem] font-semibold cursor-pointer transition-colors duration-150 border-0"
            [class]="page === currentPage()
              ? 'bg-[#112D4E] text-white'
              : 'bg-white text-[#3F72AF] hover:bg-[#eef4f9]'"
            (click)="pageChange.emit(page)"
            [attr.aria-current]="page === currentPage() ? 'page' : null">
            {{ page }}
          </button>
        }

        <button
          class="px-2 py-1 rounded-[8px] text-[1rem] font-semibold cursor-pointer transition-colors duration-150 border-0 bg-white text-[#3F72AF] hover:bg-[#eef4f9] disabled:opacity-40 disabled:cursor-not-allowed"
          [disabled]="currentPage() >= totalPages()"
          (click)="pageChange.emit(currentPage() + 1)"
          aria-label="Pagina successiva">
          ›
        </button>
      </div>

    </div>
  `
})
export class PaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages  = input.required<number>();
  readonly progressLabel = input.required<string>();

  readonly pageChange = output<number>();

  /** Mostra al massimo 5 pagine attorno a quella corrente */
  protected readonly pages = computed(() => {
    const total   = this.totalPages();
    const current = this.currentPage();
    const window  = 2;
    const start   = Math.max(1, current - window);
    const end     = Math.min(total, current + window);
    const result: number[] = [];
    for (let i = start; i <= end; i++) result.push(i);
    return result;
  });
}
