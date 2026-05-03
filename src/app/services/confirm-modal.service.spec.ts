import { TestBed } from '@angular/core/testing';
import { ConfirmModalService } from './confirm-modal.service';

describe('ConfirmModalService', () => {
  let service: ConfirmModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmModalService);
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('isOpen is false initially', () => expect(service.isOpen()).toBeFalse());

  it('message is empty initially', () => expect(service.message()).toBe(''));

  describe('open()', () => {
    it('sets isOpen to true', () => {
      service.open('Delete this item?', () => {});
      expect(service.isOpen()).toBeTrue();
    });

    it('sets the message', () => {
      service.open('Are you sure?', () => {});
      expect(service.message()).toBe('Are you sure?');
    });
  });

  describe('cancel()', () => {
    it('closes the modal without calling onConfirm', () => {
      const spy = jasmine.createSpy('onConfirm');
      service.open('Delete?', spy);
      service.cancel();
      expect(service.isOpen()).toBeFalse();
      expect(spy).not.toHaveBeenCalled();
    });

    it('resets the message to empty', () => {
      service.open('Remove?', () => {});
      service.cancel();
      expect(service.message()).toBe('');
    });
  });

  describe('confirm()', () => {
    it('calls the onConfirm callback', () => {
      const spy = jasmine.createSpy('onConfirm');
      service.open('Confirm?', spy);
      service.confirm();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('closes the modal after confirmation', () => {
      service.open('Confirm?', () => {});
      service.confirm();
      expect(service.isOpen()).toBeFalse();
    });

    it('resets the message after confirmation', () => {
      service.open('Delete all?', () => {});
      service.confirm();
      expect(service.message()).toBe('');
    });

    it('does not throw when called on a closed modal (no-op onConfirm)', () => {
      expect(() => service.confirm()).not.toThrow();
    });
  });

  describe('full open → cancel cycle', () => {
    it('can be opened again after cancel', () => {
      service.open('First', () => {});
      service.cancel();
      service.open('Second', () => {});
      expect(service.isOpen()).toBeTrue();
      expect(service.message()).toBe('Second');
    });
  });
});
