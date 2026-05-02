import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmModalService } from '../../services/confirm-modal.service';
import { ButtonComponent } from '../ui/button/button.component';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [ButtonComponent],
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
            <span class="material-icons text-[var(--danger)] text-[3rem] leading-none" aria-hidden="true">warning_amber</span>
            <p id="confirm-modal-message" class="text-[var(--primary)] text-[1rem] font-semibold mt-3 text-center">
              {{ svc.message() }}
            </p>
          </div>
          <div class="flex justify-between gap-3 mt-6">
            <app-button variant="secondary" (click)="svc.cancel()">Annulla</app-button>
            <app-button variant="danger" (click)="svc.confirm()">Conferma</app-button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmModalComponent {
  protected readonly svc = inject(ConfirmModalService);
}
