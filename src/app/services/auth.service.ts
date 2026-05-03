import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

export type UserRole = 'admin' | 'user';
export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
  displayName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  username: string;
  role: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
}

const STORAGE_KEY = 'apice_auth_user';
const TOKEN_STORAGE_KEY = 'apice_auth_token';
const API_URL = '/api/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  readonly user     = signal<AuthUser | null>(this.loadUserFromStorage());
  readonly showModal = signal<boolean>(false);

  // Observable aliases kept for components that use the async pipe
  readonly user$      = toObservable(this.user);
  readonly showModal$ = toObservable(this.showModal);

  get currentUser(): AuthUser | null { return this.user(); }
  get isLoggedIn(): boolean          { return this.user() !== null; }
  get isAdmin(): boolean             { return this.user()?.role === 'admin'; }

  openLoginModal(): void  { this.showModal.set(true);  }
  closeLoginModal(): void { this.showModal.set(false); }

  register(username: string, password: string, email?: string): Observable<any> {
    const request: RegisterRequest = {
      username: username.trim().toLowerCase(),
      password,
      email
    };
    return this.http.post(`${API_URL}/register`, request);
  }

  login(username: string, password: string): Observable<boolean> {
    const request: LoginRequest = {
      username: username.trim().toLowerCase(),
      password
    };
    return this.http.post<LoginResponse>(`${API_URL}/login`, request).pipe(
      map(response => {
        if (response?.accessToken) {
          localStorage.setItem(TOKEN_STORAGE_KEY, response.accessToken);
          const role: UserRole = response.role === 'ROLE_ADMIN' ? 'admin' : 'user';
          const user: AuthUser = {
            id: Date.now(),
            username: response.username,
            role,
            displayName: response.username
          };
          this.user.set(user);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          this.showModal.set(false);
          return true;
        }
        return false;
      })
    );
  }

  logout(): void {
    this.user.set(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    this.router.navigate(['/homepage']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  validateToken(): Observable<any> {
    const token = this.getToken();
    if (!token) return throwError(() => new Error('No token found'));
    return this.http.get(`${API_URL}/validate`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  private loadUserFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
