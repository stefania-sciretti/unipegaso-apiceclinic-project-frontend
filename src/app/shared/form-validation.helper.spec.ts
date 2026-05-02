import { signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { FormValidationHelper } from './form-validation.helper';

describe('FormValidationHelper', () => {
  let helper: FormValidationHelper;
  let fieldErrors: ReturnType<typeof signal<Record<string, string>>>;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    const fb   = new FormBuilder();
    const form = fb.group({
      name:  ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
    });

    fieldErrors = signal<Record<string, string>>({});
    helper      = new FormValidationHelper(form, fieldErrors);

    // Make "name" control dirty/touched with an invalid value to drive tests
    form.get('name')!.setValue('');
    form.get('name')!.markAsTouched();
  });

  describe('isInvalid()', () => {
    it('returns true when control is invalid and touched', () => {
      expect(helper.isInvalid('name')).toBeTrue();
    });

    it('returns false when control is valid', () => {
      const fb   = new FormBuilder();
      const form = fb.group({ name: ['Alice', Validators.required] });
      form.get('name')!.markAsTouched();
      const h = new FormValidationHelper(form, fieldErrors);
      expect(h.isInvalid('name')).toBeFalse();
    });

    it('returns false when control is invalid but not yet touched', () => {
      const fb   = new FormBuilder();
      const form = fb.group({ name: ['', Validators.required] });
      // NOT touched
      const h = new FormValidationHelper(form, fieldErrors);
      expect(h.isInvalid('name')).toBeFalse();
    });

    it('returns false for a non-existent field name', () => {
      expect(helper.isInvalid('nonExistentField')).toBeFalse();
    });

    it('accepts an optional FormGroup override', () => {
      const fb2   = new FormBuilder();
      const form2 = fb2.group({ city: ['', Validators.required] });
      form2.get('city')!.markAsTouched();
      // Pass the second form as override; 'city' exists there but not in the primary form
      expect(helper.isInvalid('city', form2)).toBeTrue();
    });
  });

  describe('fieldError()', () => {
    it('returns null when no error is registered for the field', () => {
      expect(helper.fieldError('name')).toBeNull();
    });

    it('returns the error message when one is set via the signal', () => {
      fieldErrors.set({ name: 'Il campo è obbligatorio' });
      expect(helper.fieldError('name')).toBe('Il campo è obbligatorio');
    });

    it('returns null for a field not present in the errors map', () => {
      fieldErrors.set({ email: 'Email non valida' });
      expect(helper.fieldError('name')).toBeNull();
    });

    it('reflects signal updates reactively', () => {
      fieldErrors.set({ name: 'First error' });
      expect(helper.fieldError('name')).toBe('First error');
      fieldErrors.set({ name: 'Updated error' });
      expect(helper.fieldError('name')).toBe('Updated error');
      fieldErrors.set({});
      expect(helper.fieldError('name')).toBeNull();
    });
  });
});
