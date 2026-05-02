import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'ghost'
  | 'ghost-light'
  | 'icon'
  | 'close'
  | 'toggle-active'
  | 'toggle-inactive';

export type ButtonSize = 'sm' | 'md';

const BASE =
  'inline-flex items-center justify-center gap-[0.4rem] cursor-pointer transition-colors duration-[180ms] font-semibold leading-none';

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'px-[1.1rem] py-2 text-[0.9rem]',
  sm: 'px-[0.7rem] py-[0.3rem] text-[0.8rem]',
};

/** Variants that have fixed padding — ignore the `size` input. */
const FIXED_PADDING_VARIANTS: ButtonVariant[] = [
  'icon', 'close', 'toggle-active', 'toggle-inactive', 'ghost', 'ghost-light',
];

/** Shared base classes for toggle variants. */
const TOGGLE_BASE =
  'px-3 py-[0.45rem] border-0 items-center text-[0.82rem] disabled:opacity-50 disabled:cursor-not-allowed';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'border-0 rounded-[10px] bg-[var(--primary)] text-white hover:bg-[var(--primary-mid)] disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'rounded-[10px] bg-transparent border-[1.5px] border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed',
  danger:
    'border-0 rounded-[10px] bg-[var(--danger)] text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent border-0 text-[var(--primary)] hover:bg-[var(--bg)] rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed',
  'ghost-light':
    'rounded-md bg-white/15 text-white border border-white/35 hover:bg-white/25 text-[0.9rem] disabled:opacity-50 disabled:cursor-not-allowed',
  icon: 'p-1.5 rounded-md bg-transparent border-0 text-[var(--primary-mid)] hover:text-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed',
  close:
    'bg-transparent border-0 text-[1.4rem] text-[var(--primary-mid)] leading-none hover:text-[var(--danger)] disabled:opacity-50 disabled:cursor-not-allowed',
  'toggle-active':
    `${TOGGLE_BASE} bg-[var(--primary)] text-white`,
  'toggle-inactive':
    `${TOGGLE_BASE} bg-white text-[var(--primary-mid)] hover:bg-sky-50`,
};

/**
 * Reusable button component using Angular 21 signal-based inputs and CVA-style
 * class composition. Uses display:contents on the host so the inner native
 * <button> is the real rendered element — preserves type="submit" and :disabled.
 *
 * @example
 * <app-button>Salva</app-button>
 * <app-button variant="secondary" (click)="cancel()">Annulla</app-button>
 * <app-button variant="danger" size="sm" (click)="delete(id)">Elimina</app-button>
 * <app-button type="submit" [disabled]="loading" extraClass="w-full">Accedi</app-button>
 */
@Component({
  selector: 'app-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [':host { display: contents }'],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || null"
      [attr.aria-label]="ariaLabel() || null"
      [class]="classes()"
    ><ng-content /></button>
  `,
})
export class ButtonComponent {
  readonly variant    = input<ButtonVariant>('primary');
  readonly size       = input<ButtonSize>('md');
  readonly type       = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled   = input<boolean>(false);
  readonly ariaLabel  = input<string | null>(null);
  /** Escape hatch for layout-level classes (e.g. `w-full`, `ml-2`, `self-start`). */
  readonly extraClass = input<string>('');

  protected readonly classes = computed(() => {
    const v = this.variant();
    const sizeClass = FIXED_PADDING_VARIANTS.includes(v) ? '' : SIZE_CLASSES[this.size()];
    return [BASE, VARIANT_CLASSES[v], sizeClass, this.extraClass()]
      .filter(Boolean)
      .join(' ');
  });
}
