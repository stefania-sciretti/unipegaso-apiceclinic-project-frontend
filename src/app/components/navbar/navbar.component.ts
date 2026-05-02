import { Component, HostListener, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent } from '../ui/button/button.component';

@Component({
  selector: 'app-navbar',
  imports: [ReactiveFormsModule, NgOptimizedImage, NgClass, ButtonComponent],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
  private readonly router  = inject(Router);
  private readonly fb      = inject(FormBuilder);

  activeMenu    : string | null = null;
  mobileOpen    = false;
  loginError    = '';
  loginLoading  = false;
  showPassword  = false;

  readonly loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor() {
    // Clear login error whenever the modal opens
    effect(() => {
      if (this.auth.showModal()) this.loginError = '';
    });
  }

  toggle(menu: string, e: MouseEvent): void {
    e.stopPropagation();
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

  toggleMobile(): void { this.mobileOpen = !this.mobileOpen; }

  async go(path: string): Promise<void> {
    try {
      const navigated = await this.router.navigate([path]);
      if (!navigated) console.warn('Navigation to', path, 'did not complete successfully');
    } catch (err) {
      console.error('Navigation error to', path, err);
    } finally {
      this.activeMenu = null;
      this.mobileOpen = false;
    }
  }

  openLogin(): void  { this.auth.openLoginModal(); this.activeMenu = null; }
  closeLogin(): void { this.auth.closeLoginModal(); this.loginForm.reset(); this.loginError = ''; }

  submitLogin(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    const { username, password } = this.loginForm.value;
    this.loginLoading = true;
    this.loginError   = '';
    this.auth.login(username, password).subscribe({
      next: (ok) => {
        this.loginLoading = false;
        if (!ok) this.loginError = 'Credenziali non valide. Riprova.';
      },
      error: () => {
        this.loginLoading = false;
        this.loginError = 'Credenziali non valide. Riprova.';
      }
    });
  }

  logout(): void { this.auth.logout(); this.activeMenu = null; }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target.closest('app-navbar')) {
      this.activeMenu = null;
      this.mobileOpen = false;
    }
  }

  isActive(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(path + '?');
  }

  isSection(paths: string[]): boolean {
    return paths.some(p => this.router.url.startsWith(p));
  }

  isInvalid(field: string): boolean {
    const c = this.loginForm.get(field);
    return !!(c && c.invalid && c.touched);
  }
}
