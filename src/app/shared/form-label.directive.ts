import { Directive } from '@angular/core';

/**
 * Applies the shared form-label styles to label and p elements used as
 * field labels in forms and read-only detail views.
 *
 * Usage:
 *   <label appLabel for="firstName">Nome *</label>
 *   <p appLabel>Paziente</p>
 */
@Directive({
  selector: 'label[appLabel], p[appLabel]',
  standalone: true,
  host: {
    class:
      'block text-[0.85rem] font-semibold mb-[0.35rem] text-[#3F72AF] uppercase tracking-[0.3px]'
  }
})
export class FormLabelDirective {}
