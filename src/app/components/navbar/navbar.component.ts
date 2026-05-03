import { Component, HostListener, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, RegisterRequest } from '../../services/auth.service';
import { ButtonComponent } from '../ui/button/button.component';

const FISCAL_CODE_PATTERN = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;

@Component({
  selector: 'app-navbar',
  imports: [ReactiveFormsModule, NgOptimizedImage, NgClass, ButtonComponent],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
  private readonly router  = inject(Router);
  private readonly fb      = inject(FormBuilder);

  activeMenu      : string | null = null;
  mobileOpen      = false;
  loginError      = '';
  registerSuccess = '';
  loginLoading    = false;
  showPassword    = false;

  readonly activeTab = signal<'login' | 'register'>('login');

  readonly loginForm: FormGroup = this.fb.group({
    username:   ['', Validators.required],
    password:   ['', Validators.required],
    firstName:  [''],
    lastName:   [''],
    fiscalCode: [''],
    birthDate:  [''],
    email:      [''],
    phone:      ['']
  });

  private readonly registerOnlyFields: Record<string, any[]> = {
    firstName:  [Validators.required],
    lastName:   [Validators.required],
    fiscalCode: [Validators.required, Validators.pattern(FISCAL_CODE_PATTERN)],
    birthDate:  [Validators.required],
    email:      [Validators.required, Validators.email]
  };

  constructor() {
    effect(() => {
      if (this.auth.showModal()) {
        this.loginError = '';
        this.registerSuccess = '';
        this.activeTab.set('login');
      }
    });
  }

  setTab(tab: 'login' | 'register'): void {
    this.activeTab.set(tab);
    this.loginError = '';
    this.registerSuccess = '';
    this.loginForm.reset();

    if (tab === 'register') {
      Object.entries(this.registerOnlyFields).forEach(([name, validators]) => {
        this.loginForm.get(name)!.addValidators(validators);
        this.loginForm.get(name)!.updateValueAndValidity();
      });
    } else {
      Object.keys(this.registerOnlyFields).forEach(name => {
        this.loginForm.get(name)!.clearValidators();
        this.loginForm.get(name)!.updateValueAndValidity();
      });
    }
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
  closeLogin(): void {
    this.auth.closeLoginModal();
    this.loginForm.reset();
    this.loginError = '';
    this.registerSuccess = '';
    this.activeTab.set('login');
  }

  submitLogin(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.loginLoading = true;
    this.loginError   = '';
    this.registerSuccess = '';

    if (this.activeTab() === 'register') {
      this.submitRegister();
      return;
    }

    const { username, password } = this.loginForm.value;
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

  private submitRegister(): void {
    const v = this.loginForm.value;
    const request: RegisterRequest = {
      firstName:  v.firstName.trim(),
      lastName:   v.lastName.trim(),
      fiscalCode: v.fiscalCode.trim().toUpperCase(),
      birthDate:  v.birthDate,
      email:      v.email.trim().toLowerCase(),
      phone:      v.phone?.trim() || undefined,
      username:   v.username,
      password:   v.password
    };
    this.auth.register(request).subscribe({
      next: () => {
        this.loginLoading = false;
        this.setTab('login');
        this.registerSuccess = 'Registrazione completata! Accedi con le tue credenziali.';
      },
      error: (err: HttpErrorResponse) => {
        this.loginLoading = false;
        this.loginError = err.error?.message ?? 'Dati non validi o già esistenti. Riprova.';
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
