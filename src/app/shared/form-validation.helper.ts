import { Signal } from '@angular/core';
import { FormGroup } from '@angular/forms';

export class FormValidationHelper {
  constructor(
    private readonly form: FormGroup,
    private readonly fieldErrors: Signal<Record<string, string>>
  ) {}

  isInvalid(field: string, form?: FormGroup): boolean {
    const control = (form ?? this.form).get(field);
    return !!(control?.invalid && control.touched);
  }

  fieldError(field: string): string | null {
    return this.fieldErrors()[field] ?? null;
  }
}
