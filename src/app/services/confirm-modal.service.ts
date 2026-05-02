import { Injectable, computed, signal } from '@angular/core';

interface ConfirmModalState {
  open: boolean;
  message: string;
  onConfirm: () => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmModalService {
  private readonly state = signal<ConfirmModalState>({
    open: false,
    message: '',
    onConfirm: () => {}
  });

  readonly isOpen = computed(() => this.state().open);
  readonly message = computed(() => this.state().message);

  open(message: string, onConfirm: () => void): void {
    this.state.set({ open: true, message, onConfirm });
  }

  confirm(): void {
    this.state().onConfirm();
    this.state.set({ open: false, message: '', onConfirm: () => {} });
  }

  cancel(): void {
    this.state.set({ open: false, message: '', onConfirm: () => {} });
  }
}
