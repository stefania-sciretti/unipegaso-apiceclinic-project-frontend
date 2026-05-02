import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmModalService } from '../../services/confirm-modal.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (svc.isOpen()) {
      <div
        class="fixed inset-0 bg-[rgba(30,45,59,0.5)] z-[99999] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-message"
      >
        <div class="bg-white rounded-[10px] shadow-[0_10px_40px_rgba(53,88,114,0.22)] p-8 w-full max-w-[420px]">
          <div class="flex flex-col items-center">
            <span class="material-icons text-[#d95550] text-[3rem] leading-none" aria-hidden="true">warning_amber</span>
            <p id="confirm-modal-message" class="text-[#112D4E] text-[1rem] font-semibold mt-3 text-center">
              {{ svc.message() }}
            </p>
          </div>
          <div class="flex justify-between gap-3 mt-6">
            <button
              type="button"
              class="px-[1.1rem] py-2 rounded-[10px] text-[0.9rem] cursor-pointer font-semibold bg-transparent border-[1.5px] border-[#112D4E] text-[#112D4E] hover:bg-[#112D4E] hover:text-white transition-colors duration-[180ms]"
              (click)="svc.cancel()"
            >
              Annulla
            </button>
            <button
              type="button"
              class="px-[1.1rem] py-2 border-0 rounded-[10px] text-[0.9rem] cursor-pointer font-semibold bg-[#d95550] text-white hover:bg-[#b84140] transition-colors duration-[180ms]"
              (click)="svc.confirm()"
            >
              Conferma
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmModalComponent {
  protected readonly svc = inject(ConfirmModalService);
}
