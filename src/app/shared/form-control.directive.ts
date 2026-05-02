import { Directive } from '@angular/core';

/**
 * Applies the shared form-control styles to input, select, and textarea elements.
 * Extra classes (e.g. resize-vertical, min-h-[85px], uppercase) can be added
 * directly on the element and will coexist normally.
 *
 * Usage:
 *   <input appFormControl formControlName="title" type="text" />
 *   <select appFormControl formControlName="patientId">...</select>
 *   <textarea appFormControl formControlName="notes" rows="3"></textarea>
 */
@Directive({
  selector: 'input[appFormControl], select[appFormControl], textarea[appFormControl]',
  standalone: true,
  host: {
    class:
      'w-full px-[0.8rem] py-[0.55rem] border-[1.5px] border-[#DBE2EF] rounded-lg text-[0.9rem] outline-none focus:border-[#3F72AF] focus:shadow-[0_0_0_3px_rgba(122,170,206,0.2)]'
  }
})
export class FormControlDirective {}
