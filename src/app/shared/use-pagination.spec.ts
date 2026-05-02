import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { usePagination, PAGE_SIZE } from './use-pagination';

/** Helper: produces an array of n items labelled item-0 … item-(n-1). */
function makeItems(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `item-${i}`);
}

describe('usePagination()', () => {
  // usePagination uses computed() internally — run inside an injection context.
  beforeEach(() => TestBed.configureTestingModule({}));

  it('returns page 1 and all items when source has fewer items than page size', () => {
    TestBed.runInInjectionContext(() => {
      const src  = signal(makeItems(5));
      const pg   = usePagination(src, 10);
      expect(pg.currentPage()).toBe(1);
      expect(pg.pagedItems()).toEqual(makeItems(5));
      expect(pg.totalPages()).toBe(1);
      expect(pg.totalItems()).toBe(5);
    });
  });

  it('slices items correctly for the first page', () => {
    TestBed.runInInjectionContext(() => {
      const src = signal(makeItems(35));
      const pg  = usePagination(src, 10);
      expect(pg.pagedItems().length).toBe(10);
      expect(pg.pagedItems()[0]).toBe('item-0');
      expect(pg.pagedItems()[9]).toBe('item-9');
    });
  });

  it('goToPage() advances to the requested page', () => {
    spyOn(window, 'scrollTo');
    TestBed.runInInjectionContext(() => {
      const src = signal(makeItems(35));
      const pg  = usePagination(src, 10);
      pg.goToPage(2);
      expect(pg.currentPage()).toBe(2);
      expect(pg.pagedItems()[0]).toBe('item-10');
      expect(pg.pagedItems()[9]).toBe('item-19');
    });
  });

  it('goToPage() clamps to 1 when given 0 or negative', () => {
    spyOn(window, 'scrollTo');
    TestBed.runInInjectionContext(() => {
      const src = signal(makeItems(20));
      const pg  = usePagination(src, 10);
      pg.goToPage(0);
      expect(pg.currentPage()).toBe(1);
      pg.goToPage(-5);
      expect(pg.currentPage()).toBe(1);
    });
  });

  it('goToPage() clamps to totalPages when given a value beyond range', () => {
    spyOn(window, 'scrollTo');
    TestBed.runInInjectionContext(() => {
      const src = signal(makeItems(20));
      const pg  = usePagination(src, 10);
      pg.goToPage(999);
      expect(pg.currentPage()).toBe(2);
    });
  });

  it('nextPage() moves to page 2', () => {
    spyOn(window, 'scrollTo');
    TestBed.runInInjectionContext(() => {
      const src = signal(makeItems(25));
      const pg  = usePagination(src, 10);
      pg.nextPage();
      expect(pg.currentPage()).toBe(2);
    });
  });

  it('prevPage() from page 2 returns to page 1', () => {
    spyOn(window, 'scrollTo');
    TestBed.runInInjectionContext(() => {
      const src = signal(makeItems(25));
      const pg  = usePagination(src, 10);
      pg.goToPage(2);
      pg.prevPage();
      expect(pg.currentPage()).toBe(1);
    });
  });

  it('hasPrev is false on page 1 and true on page 2', () => {
    spyOn(window, 'scrollTo');
    TestBed.runInInjectionContext(() => {
      const src = signal(makeItems(25));
      const pg  = usePagination(src, 10);
      expect(pg.hasPrev()).toBe(false);
      pg.goToPage(2);
      expect(pg.hasPrev()).toBe(true);
    });
  });

  it('hasNext is true on page 1 and false on last page', () => {
    spyOn(window, 'scrollTo');
    TestBed.runInInjectionContext(() => {
      const src = signal(makeItems(20));
      const pg  = usePagination(src, 10);
      expect(pg.hasNext()).toBe(true);
      pg.goToPage(2);
      expect(pg.hasNext()).toBe(false);
    });
  });

  it('progressLabel shows displayed/total correctly', () => {
    spyOn(window, 'scrollTo');
    TestBed.runInInjectionContext(() => {
      const src = signal(makeItems(25));
      const pg  = usePagination(src, 10);
      expect(pg.progressLabel()).toBe('10/25');
      pg.goToPage(3);
      expect(pg.progressLabel()).toBe('25/25');
    });
  });

  it('totalPages is 1 for an empty source', () => {
    TestBed.runInInjectionContext(() => {
      const src = signal<string[]>([]);
      const pg  = usePagination(src, 10);
      expect(pg.totalPages()).toBe(1);
    });
  });

  it('reacts to source signal updates', () => {
    spyOn(window, 'scrollTo');
    TestBed.runInInjectionContext(() => {
      const src = signal(makeItems(5));
      const pg  = usePagination(src, 10);
      expect(pg.totalPages()).toBe(1);
      src.set(makeItems(50));
      expect(pg.totalPages()).toBe(5);
      expect(pg.totalItems()).toBe(50);
    });
  });

  it('PAGE_SIZE constant is 30', () => {
    expect(PAGE_SIZE).toBe(30);
  });

  it('uses PAGE_SIZE as default when no pageSize argument provided', () => {
    TestBed.runInInjectionContext(() => {
      const src = signal(makeItems(31));
      const pg  = usePagination(src);
      expect(pg.pagedItems().length).toBe(30);
      expect(pg.totalPages()).toBe(2);
    });
  });
});
