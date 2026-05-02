import { computed, Directive, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'outline' | 'sm-primary' | 'sm-danger' | 'sm-blue' | 'close' | 'toggle-active' | 'toggle-inactive';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'px-[1.1rem] py-2 border-0 rounded-[10px] text-[0.9rem] cursor-pointer font-semibold transition-colors duration-[180ms] bg-[var(--primary)] text-white hover:bg-[var(--primary-mid)]',
  outline:
    'px-[1.1rem] py-2 rounded-[10px] text-[0.9rem] cursor-pointer font-semibold transition-colors duration-[180ms] bg-transparent border-[1.5px] border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white',
  'sm-primary':
    'px-[0.7rem] py-[0.3rem] border-0 rounded-[10px] text-[0.8rem] cursor-pointer font-semibold transition-colors duration-[180ms] bg-[var(--primary)] text-white hover:bg-[var(--primary-mid)]',
  'sm-danger':
    'px-[0.7rem] py-[0.3rem] border-0 rounded-[10px] text-[0.8rem] cursor-pointer font-semibold transition-colors duration-[180ms] bg-[var(--danger)] text-white hover:bg-red-700',
  'sm-blue':
    'px-[0.7rem] py-[0.3rem] border-0 rounded-[10px] text-[0.8rem] cursor-pointer font-semibold transition-colors duration-[180ms] bg-[var(--primary-mid)] text-white hover:bg-sky-400',
  close:
    'bg-transparent border-0 text-[1.4rem] cursor-pointer text-[var(--primary-mid)] leading-none hover:text-[var(--danger)] transition-colors duration-200',
  'toggle-active':
    'px-3 py-[0.45rem] border-0 flex items-center cursor-pointer text-[0.82rem] font-semibold transition-colors duration-150 bg-[var(--primary)] text-white',
  'toggle-inactive':
    'px-3 py-[0.45rem] border-0 flex items-center cursor-pointer text-[0.82rem] font-semibold transition-colors duration-150 bg-white text-[var(--primary-mid)] hover:bg-sky-50',
};

/**
 * Applies variant-specific button styles to any <button appBtn="variant"> element.
 *
 * Usage:
 *   <button appBtn="primary" (click)="save()">Salva</button>
 *   <button appBtn="sm-danger" (click)="delete(id)">Elimina</button>
 *   <button appBtn="close" (click)="closeModal()">&times;</button>
 *
 * Note: All Tailwind class strings use CSS custom properties (--primary, --primary-mid,
 * --danger) defined in styles.scss. No raw hex values are permitted here.
 */
@Directive({
  selector: 'button[appBtn]',
  standalone: true,
  host: { '[class]': 'btnClass()' }
})
export class BtnDirective {
  readonly appBtn = input.required<ButtonVariant>();

  protected readonly btnClass = computed(() => VARIANT_CLASSES[this.appBtn()]);
}
