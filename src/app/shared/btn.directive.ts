import { computed, Directive, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'outline' | 'sm-primary' | 'sm-danger' | 'sm-blue' | 'close' | 'toggle-active' | 'toggle-inactive';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'px-[1.1rem] py-2 border-0 rounded-[10px] text-[0.9rem] cursor-pointer font-semibold transition-colors duration-[180ms] bg-[#112D4E] text-white hover:bg-[#264560]',
  outline:
    'px-[1.1rem] py-2 rounded-[10px] text-[0.9rem] cursor-pointer font-semibold transition-colors duration-[180ms] bg-transparent border-[1.5px] border-[#112D4E] text-[#112D4E] hover:bg-[#112D4E] hover:text-white',
  'sm-primary':
    'px-[0.7rem] py-[0.3rem] border-0 rounded-[10px] text-[0.8rem] cursor-pointer font-semibold transition-colors duration-[180ms] bg-[#112D4E] text-white hover:bg-[#264560]',
  'sm-danger':
    'px-[0.7rem] py-[0.3rem] border-0 rounded-[10px] text-[0.8rem] cursor-pointer font-semibold transition-colors duration-[180ms] bg-[#d95550] text-white hover:bg-[#b84140]',
  'sm-blue':
    'px-[0.7rem] py-[0.3rem] border-0 rounded-[10px] text-[0.8rem] cursor-pointer font-semibold transition-colors duration-[180ms] bg-[#3F72AF] text-white hover:bg-[#5e96be]',
  close:
    'bg-transparent border-0 text-[1.4rem] cursor-pointer text-[#3F72AF] leading-none hover:text-[#d95550] transition-colors duration-200',
  'toggle-active':
    'px-3 py-[0.45rem] border-0 flex items-center cursor-pointer text-[0.82rem] font-semibold transition-colors duration-150 bg-[#112D4E] text-white',
  'toggle-inactive':
    'px-3 py-[0.45rem] border-0 flex items-center cursor-pointer text-[0.82rem] font-semibold transition-colors duration-150 bg-white text-[#3F72AF] hover:bg-[#eef4f9]',
};

/**
 * Applies variant-specific button styles to any <button appBtn="variant"> element.
 *
 * Usage:
 *   <button appBtn="primary" (click)="save()">Salva</button>
 *   <button appBtn="sm-danger" (click)="delete(id)">Elimina</button>
 *   <button appBtn="close" (click)="closeModal()">&times;</button>
 *
 * Note: The Tailwind class strings here use the existing brand palette (--primary #112D4E,
 * --primary-mid #3F72AF, --danger #d95550). The three new brand constants
 * (COLOR_ACCENT, COLOR_SECONDARY, COLOR_PRIMARY) defined in colors.constants.ts are
 * used for dynamic [ngStyle] role-badge coloring in the appointments component.
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
