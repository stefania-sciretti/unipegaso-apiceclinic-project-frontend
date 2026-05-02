import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableThComponent, TableColumn } from './table-th.component';

async function buildFixture(col: TableColumn): Promise<{ th: HTMLElement; fixture: ComponentFixture<any> }> {
  @Component({
    standalone: true,
    imports: [TableThComponent],
    template: `<table><thead><tr><th app-table-th [col]="col"></th></tr></thead></table>`
  })
  class Host {
    readonly col = col;
  }

  await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const th = fixture.nativeElement.querySelector('th') as HTMLElement;
  return { th, fixture };
}

describe('TableThComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders the column label', async () => {
    const { th } = await buildFixture({ label: 'Patient' });
    expect(th.textContent?.trim()).toBe('Patient');
  });

  it('applies shared header styles via host class binding', async () => {
    const { th } = await buildFixture({ label: 'Name' });
    expect(th.className).toContain('bg-sky-50');
    expect(th.className).toContain('font-semibold');
  });

  it('appends extraClass when provided', async () => {
    const { th } = await buildFixture({ label: 'Actions', extraClass: 'w-[200px]' });
    expect(th.className).toContain('w-[200px]');
  });

  it('does not add spurious class text when extraClass is undefined', async () => {
    const { th } = await buildFixture({ label: 'Name' });
    expect(th.className).not.toContain('undefined');
    expect(th.className).not.toContain('null');
  });
});
