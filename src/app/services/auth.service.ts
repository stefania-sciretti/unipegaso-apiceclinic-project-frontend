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
  patientId?: number;
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
  userId: number;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  fiscalCode: string;
  birthDate: string;
  email: string;
  phone?: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  success: boolean;
  username: string;
  email: string;
  patientId: number;
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
  get patientId(): number | undefined { return this.user()?.patientId; }

  openLoginModal(): void  { this.showModal.set(true);  }
  closeLoginModal(): void { this.showModal.set(false); }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${API_URL}/register`, {
      ...request,
      username: request.username.trim().toLowerCase()
    });
  }

  login(username: string, password: string): Observable<boolean> {
    const request: LoginRequest = {
      username: username.trim().toLowerCase(),
      password
    };
    return this.http.post<LoginResponse>(`${API_URL}/login`, request).pipe(
      map(response => {
        if (!response?.accessToken) return false;
        const role: UserRole = response.role === 'ROLE_ADMIN' ? 'admin' : 'user';
        const patientId = role === 'user' ? response.userId : undefined;
        this.persistUser(response, role, patientId);
        return true;
      })
    );
  }

  private persistUser(response: LoginResponse, role: UserRole, patientId: number | undefined): void {
    const user: AuthUser = {
      id: response.userId,
      username: response.username,
      role,
      displayName: response.username,
      patientId
    };
    this.user.set(user);
    localStorage.setItem(TOKEN_STORAGE_KEY, response.accessToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.showModal.set(false);
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
