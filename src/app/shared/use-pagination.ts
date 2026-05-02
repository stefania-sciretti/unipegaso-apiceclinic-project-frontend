import { computed, signal, Signal } from '@angular/core';

export const PAGE_SIZE = 30;

export interface PaginationState<T> {
  /** Items visibili nella pagina corrente */
  pagedItems: Signal<T[]>;
  /** Pagina corrente (1-based) */
  currentPage: Signal<number>;
  /** Numero totale di pagine */
  totalPages: Signal<number>;
  /** Totale elementi nella lista sorgente */
  totalItems: Signal<number>;
  /** Stringa "elementiVisualizzati/totale", es. "30/500" */
  progressLabel: Signal<string>;
  /** Va alla pagina indicata (1-based, con clamp) */
  goToPage: (page: number) => void;
  /** Pagina successiva (se disponibile) */
  nextPage: () => void;
  /** Pagina precedente (se disponibile) */
  prevPage: () => void;
  /** Indica se esiste una pagina precedente */
  hasPrev: Signal<boolean>;
  /** Indica se esiste una pagina successiva */
  hasNext: Signal<boolean>;
}

/**
 * Signal-based pagination utility. Wraps a source-data signal and exposes
 * all derived pagination state as computed signals.
 *
 * Usage:
 *   const pg = usePagination(myListSignal);
 *   // in template: pg.pagedItems(), pg.progressLabel(), pg.goToPage(n)
 */
export function usePagination<T>(
  source: Signal<T[]>,
  pageSize = PAGE_SIZE
): PaginationState<T> {
  const currentPage = signal(1);

  const totalItems = computed(() => source().length);

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(totalItems() / pageSize))
  );

  const safePage = computed(() =>
    Math.min(currentPage(), totalPages())
  );

  const pagedItems = computed(() => {
    const start = (safePage() - 1) * pageSize;
    return source().slice(start, start + pageSize);
  });

  const progressLabel = computed(() => {
    const displayed = Math.min(safePage() * pageSize, totalItems());
    return `${displayed}/${totalItems()}`;
  });

  const hasPrev = computed(() => safePage() > 1);
  const hasNext = computed(() => safePage() < totalPages());

  const goToPage = (page: number): void => {
    const clamped = Math.max(1, Math.min(page, totalPages()));
    currentPage.set(clamped);
    window.scrollTo({ top: 0 });
  };

  return {
    pagedItems,
    currentPage: safePage,
    totalPages,
    totalItems,
    progressLabel,
    goToPage,
    nextPage: () => goToPage(safePage() + 1),
    prevPage: () => goToPage(safePage() - 1),
    hasPrev,
    hasNext,
  };
}
