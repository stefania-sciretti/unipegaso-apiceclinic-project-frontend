import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { PaginationComponent } from './pagination.component';

async function buildFixture(current: number, total: number, label = '10/50') {
  @Component({
    standalone: true,
    imports: [PaginationComponent],
    template: `
      <app-pagination
        [currentPage]="current"
        [totalPages]="total"
        [progressLabel]="label"
        (pageChange)="onPage($event)" />
    `
  })
  class Host {
    current = current;
    total   = total;
    label   = label;
    lastPage: number | undefined;
    onPage(p: number) { this.lastPage = p; }
  }

  await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  return fixture;
}

describe('PaginationComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders progress label when provided', async () => {
    const fixture = await buildFixture(1, 5, '10/50');
    const span = fixture.nativeElement.querySelector('span');
    expect(span?.textContent?.trim()).toBe('10/50');
  });

  it('does not render progress label when empty string', async () => {
    const fixture = await buildFixture(1, 5, '');
    const span = fixture.nativeElement.querySelector('span');
    expect(span).toBeNull();
  });

  it('previous button is disabled on page 1', async () => {
    const fixture = await buildFixture(1, 5);
    const [prevBtn] = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    expect(prevBtn.disabled).toBeTrue();
  });

  it('next button is disabled on the last page', async () => {
    const fixture = await buildFixture(5, 5);
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    const nextBtn = buttons[buttons.length - 1];
    expect(nextBtn.disabled).toBeTrue();
  });

  it('emits currentPage - 1 when previous button is clicked on page 3', async () => {
    const fixture = await buildFixture(3, 5);
    const host    = fixture.componentInstance as any;
    const [prevBtn] = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    prevBtn.click();
    expect(host.lastPage).toBe(2);
  });

  it('emits currentPage + 1 when next button is clicked', async () => {
    const fixture = await buildFixture(2, 5);
    const host    = fixture.componentInstance as any;
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    const nextBtn = buttons[buttons.length - 1];
    nextBtn.click();
    expect(host.lastPage).toBe(3);
  });

  it('emits the correct page number when a numbered page button is clicked', async () => {
    const fixture = await buildFixture(3, 5);
    const host    = fixture.componentInstance as any;
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    // buttons layout: [prev, 1, 2, 3, 4, 5, next] — click page 1
    buttons[1].click();
    expect(host.lastPage).toBe(1);
  });

  describe('pages() computed signal', () => {
    it('shows up to 5 pages centred on current page (window=2)', async () => {
      const fixture = await buildFixture(5, 10);
      const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
      // [prev, 3, 4, 5, 6, 7, next]
      const numbered = buttons.slice(1, buttons.length - 1);
      expect(numbered.length).toBe(5);
      expect(numbered[0].textContent?.trim()).toBe('3');
      expect(numbered[4].textContent?.trim()).toBe('7');
    });

    it('starts from page 1 when current page is near the start', async () => {
      const fixture = await buildFixture(2, 10);
      const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
      const firstNumbered = buttons[1];
      expect(firstNumbered.textContent?.trim()).toBe('1');
    });

    it('renders only 1 page button for a single-page result set', async () => {
      const fixture = await buildFixture(1, 1, '5/5');
      const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
      // [prev, 1, next]
      const numbered = buttons.slice(1, buttons.length - 1);
      expect(numbered.length).toBe(1);
      expect(numbered[0].textContent?.trim()).toBe('1');
    });
  });
});
