import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {AuthService, AuthUser, LoginResponse} from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Service creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('isLoggedIn', () => {
    it('should return false when no user is logged in', () => {
      expect(service.isLoggedIn).toBe(false);
    });

    it('should return true when user is logged in', () => {
      const mockUser: AuthUser = {
        id: 1,
        username: 'testuser',
        role: 'user',
        displayName: 'Test User'
      };
      service.user.set(mockUser);
      expect(service.isLoggedIn).toBe(true);
    });
  });

  describe('login()', () => {
    it('should POST to /api/auth/login with username and password', () => {
      const mockResponse: LoginResponse = {
        accessToken: 'token123',
        tokenType: 'Bearer',
        username: 'testuser',
        role: 'ROLE_USER',
        userId: 1
      };

      service.login('testuser', 'password123').subscribe();

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        username: 'testuser',
        password: 'password123'
      });
      req.flush(mockResponse);
    });

    it('should normalize username to lowercase', () => {
      const mockResponse: LoginResponse = {
        accessToken: 'token123',
        tokenType: 'Bearer',
        username: 'TestUser',
        role: 'ROLE_USER',
        userId: 1
      };

      service.login('TestUser', 'password123').subscribe();

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.body.username).toBe('testuser');
      req.flush(mockResponse);
    });

    it('should set user signal and token in localStorage on success', () => {
      const mockResponse: LoginResponse = {
        accessToken: 'token123',
        tokenType: 'Bearer',
        username: 'testuser',
        role: 'ROLE_USER',
        userId: 1
      };

      service.login('testuser', 'password123').subscribe(result => {
        expect(result).toBeTrue();
        expect(service.user()).toBeTruthy();
        expect(service.user()?.username).toBe('testuser');
        expect(localStorage.getItem('apice_auth_token')).toBe('token123');
        const storedUser = JSON.parse(localStorage.getItem('apice_auth_user') || '{}');
        expect(storedUser.username).toBe('testuser');
      });

      httpMock.expectOne('/api/auth/login').flush(mockResponse);
    });

    it('should map ROLE_ADMIN to admin role', () => {
      const mockResponse: LoginResponse = {
        accessToken: 'token123',
        tokenType: 'Bearer',
        username: 'admin',
        role: 'ROLE_ADMIN',
        userId: 1
      };

      service.login('admin', 'password123').subscribe(() => {
        expect(service.user()?.role).toBe('admin');
        expect(service.isAdmin).toBeTrue();
      });

      httpMock.expectOne('/api/auth/login').flush(mockResponse);
    });

    it('should map non-ROLE_ADMIN roles to user role', () => {
      const mockResponse: LoginResponse = {
        accessToken: 'token123',
        tokenType: 'Bearer',
        username: 'testuser',
        role: 'ROLE_USER',
        userId: 1
      };

      service.login('testuser', 'password123').subscribe(() => {
        expect(service.user()?.role).toBe('user');
        expect(service.isAdmin).toBeFalse();
      });

      httpMock.expectOne('/api/auth/login').flush(mockResponse);
    });

    it('should close login modal on successful login', () => {
      service.showModal.set(true);
      const mockResponse: LoginResponse = {
        accessToken: 'token123',
        tokenType: 'Bearer',
        username: 'testuser',
        role: 'ROLE_USER',
        userId: 1
      };

      service.login('testuser', 'password123').subscribe(() => {
        expect(service.showModal()).toBeFalse();
      });

      httpMock.expectOne('/api/auth/login').flush(mockResponse);
    });

    it('should return false when response is missing accessToken', () => {
      const mockResponse = {
        tokenType: 'Bearer',
        username: 'testuser',
        role: 'ROLE_USER'
      } as unknown as LoginResponse;

      service.login('testuser', 'password123').subscribe(result => {
        expect(result).toBeFalse();
        expect(service.isLoggedIn).toBeFalse();
      });

      httpMock.expectOne('/api/auth/login').flush(mockResponse);
    });
  });

  describe('logout()', () => {
    it('should clear user signal', () => {
      const mockUser: AuthUser = {
        id: 1,
        username: 'testuser',
        role: 'user',
        displayName: 'Test User'
      };
      service.user.set(mockUser);
      expect(service.isLoggedIn).toBe(true);

      service.logout();

      expect(service.isLoggedIn).toBe(false);
      expect(service.user()).toBeNull();
    });

    it('should clear localStorage on logout', () => {
      localStorage.setItem('apice_auth_token', 'token123');
      localStorage.setItem('apice_auth_user', JSON.stringify({
        id: 1,
        username: 'testuser',
        role: 'user',
        displayName: 'Test User'
      }));

      service.logout();

      expect(localStorage.getItem('apice_auth_token')).toBeNull();
      expect(localStorage.getItem('apice_auth_user')).toBeNull();
    });
  });

  describe('register()', () => {
    const baseRequest = {
      firstName: 'Mario', lastName: 'Rossi',
      fiscalCode: 'RSSMRA85T10A562S', birthDate: '1985-12-10',
      email: 'mario@example.com', username: 'newuser', password: 'password123'
    };

    it('should POST to /api/auth/register with username and password', () => {
      service.register(baseRequest).subscribe();

      const req = httpMock.expectOne('/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.username).toBe('newuser');
      expect(req.request.body.password).toBe('password123');
      req.flush({ success: true });
    });

    it('should POST to /api/auth/register with email when provided', () => {
      service.register({ ...baseRequest, email: 'user@example.com' }).subscribe();

      const req = httpMock.expectOne('/api/auth/register');
      expect(req.request.body.email).toBe('user@example.com');
      req.flush({ success: true });
    });

    it('should normalize username to lowercase', () => {
      service.register({ ...baseRequest, username: 'NewUser' }).subscribe();

      const req = httpMock.expectOne('/api/auth/register');
      expect(req.request.body.username).toBe('newuser');
      req.flush({ success: true });
    });
  });

  describe('openLoginModal()', () => {
    it('should set showModal to true', () => {
      service.closeLoginModal();
      expect(service.showModal()).toBe(false);

      service.openLoginModal();

      expect(service.showModal()).toBe(true);
    });
  });

  describe('closeLoginModal()', () => {
    it('should set showModal to false', () => {
      service.openLoginModal();
      expect(service.showModal()).toBe(true);

      service.closeLoginModal();

      expect(service.showModal()).toBe(false);
    });
  });

  describe('currentUser getter', () => {
    it('should return null when no user is logged in', () => {
      expect(service.currentUser).toBeNull();
    });

    it('should return user object when logged in', () => {
      const mockUser: AuthUser = {
        id: 1,
        username: 'testuser',
        role: 'user',
        displayName: 'Test User'
      };
      service.user.set(mockUser);

      expect(service.currentUser).toEqual(mockUser);
    });
  });

  describe('isAdmin getter', () => {
    it('should return false when user is not admin', () => {
      const mockUser: AuthUser = {
        id: 1,
        username: 'testuser',
        role: 'user',
        displayName: 'Test User'
      };
      service.user.set(mockUser);

      expect(service.isAdmin).toBe(false);
    });

    it('should return true when user is admin', () => {
      const mockUser: AuthUser = {
        id: 1,
        username: 'admin',
        role: 'admin',
        displayName: 'Admin User'
      };
      service.user.set(mockUser);

      expect(service.isAdmin).toBe(true);
    });

    it('should return false when no user is logged in', () => {
      expect(service.isAdmin).toBe(false);
    });
  });

  describe('getToken()', () => {
    it('should return null when no token in localStorage', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return token from localStorage after login', () => {
      const mockResponse: LoginResponse = {
        accessToken: 'abc123',
        tokenType: 'Bearer',
        username: 'testuser',
        role: 'ROLE_USER',
        userId: 1
      };

      service.login('testuser', 'password').subscribe(() => {
        expect(service.getToken()).toBe('abc123');
      });

      httpMock.expectOne('/api/auth/login').flush(mockResponse);
    });

    it('should return null after logout', () => {
      localStorage.setItem('apice_auth_token', 'abc123');
      service.logout();
      expect(service.getToken()).toBeNull();
    });
  });

  describe('validateToken()', () => {
    it('should return an Observable error when no token is present', () => {
      let error: any;
      service.validateToken().subscribe({ error: e => (error = e) });
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('No token found');
    });

    it('should call GET /api/auth/validate with Bearer token when token exists', () => {
      localStorage.setItem('apice_auth_token', 'token123');

      service.validateToken().subscribe();

      const req = httpMock.expectOne('/api/auth/validate');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer token123');
      req.flush({ valid: true });
    });
  });

  describe('initialisation from localStorage', () => {
    it('should restore user from localStorage on construction', () => {
      const stored: AuthUser = { id: 1, username: 'testuser', role: 'user', displayName: 'Test User' };
      localStorage.setItem('apice_auth_user', JSON.stringify(stored));

      // Re-create the TestBed with storage already populated
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          provideHttpClient(withInterceptorsFromDi()),
          provideHttpClientTesting()
        ]
      });
      const freshService = TestBed.inject(AuthService);

      expect(freshService.isLoggedIn).toBeTrue();
      expect(freshService.currentUser?.username).toBe('testuser');
      expect(freshService.currentUser?.role).toBe('user');
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('apice_auth_user', 'not-valid-json');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          provideHttpClient(withInterceptorsFromDi()),
          provideHttpClientTesting()
        ]
      });
      const freshService = TestBed.inject(AuthService);

      expect(freshService.isLoggedIn).toBeFalse();
      expect(freshService.currentUser).toBeNull();
    });
  });
});
