import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BtnDirective, ButtonVariant, VARIANT_CLASSES } from './btn.directive';

/** Factory: compile + create a button with the given variant in a fresh TestBed. */
async function buildFixture(variant: ButtonVariant): Promise<{ btn: HTMLButtonElement; fixture: ComponentFixture<any> }> {
  @Component({
    standalone: true,
    imports: [BtnDirective],
    template: `<button [appBtn]="variant">Click</button>`
  })
  class Host {
    readonly variant = variant;
  }

  await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  return { btn, fixture };
}

describe('BtnDirective', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('applies primary variant classes', async () => {
    const { btn } = await buildFixture('primary');
    expect(btn.className).toContain('bg-[var(--primary)]');
    expect(btn.className).toContain('text-white');
  });

  it('applies outline variant classes', async () => {
    const { btn } = await buildFixture('outline');
    expect(btn.className).toContain('bg-transparent');
    expect(btn.className).toContain('border-[var(--primary)]');
  });

  it('applies sm-primary variant classes', async () => {
    const { btn } = await buildFixture('sm-primary');
    expect(btn.className).toContain('bg-[var(--primary)]');
    expect(btn.className).toContain('text-[0.8rem]');
  });

  it('applies sm-danger variant classes', async () => {
    const { btn } = await buildFixture('sm-danger');
    expect(btn.className).toContain('bg-[var(--danger)]');
    expect(btn.className).toContain('text-[0.8rem]');
  });

  it('applies sm-blue variant classes', async () => {
    const { btn } = await buildFixture('sm-blue');
    expect(btn.className).toContain('bg-[var(--primary-mid)]');
  });

  it('applies close variant classes', async () => {
    const { btn } = await buildFixture('close');
    expect(btn.className).toContain('bg-transparent');
    expect(btn.className).toContain('border-0');
  });

  it('applies toggle-active variant classes', async () => {
    const { btn } = await buildFixture('toggle-active');
    expect(btn.className).toContain('bg-[var(--primary)]');
    expect(btn.className).toContain('text-white');
  });

  it('applies toggle-inactive variant classes', async () => {
    const { btn } = await buildFixture('toggle-inactive');
    expect(btn.className).toContain('bg-white');
    expect(btn.className).toContain('text-[var(--primary-mid)]');
  });

  it('VARIANT_CLASSES covers all 8 variants', () => {
    const variants: ButtonVariant[] = ['primary', 'outline', 'sm-primary', 'sm-danger', 'sm-blue', 'close', 'toggle-active', 'toggle-inactive'];
    variants.forEach(v => expect(VARIANT_CLASSES[v]).toBeTruthy(`missing variant: ${v}`));
  });
});
