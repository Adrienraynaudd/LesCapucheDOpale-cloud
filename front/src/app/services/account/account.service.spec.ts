import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AccountService } from './account.service';
import { provideHttpClient } from '@angular/common/http';

describe('AccountService', () => {
  let service: AccountService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AccountService,
      ],
    });

    service = TestBed.inject(AccountService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); 
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a POST request when calling signUp', () => {
    const mockUser = {
      name: 'John',
      email: 'john@example.com',
      password: 'Password1!',
      roleId: 1,
    };

    const mockResponse = { message: 'User created' };

    service.signUp(mockUser).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockUser);

    req.flush(mockResponse);
  });

  it('should send a POST request when calling login', () => {
    const mockCredentials = {
      email: 'john@example.com',
      password: 'Password1!',
    };

    const mockResponse = { token: 'fake-jwt-token' };

    service.login(mockCredentials).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCredentials);

    req.flush(mockResponse);
  });

  describe('isLogin', () => {
    afterEach(() => {
      localStorage.clear();
    });

    it('should call verify endpoint when a token exists in localStorage', () => {
      localStorage.setItem('token', 'fake-token');
      const mockResponse = { roleId: '1' };

      service.isLogin().subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/auth/verify');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return false when token is null', (done) => {
      localStorage.removeItem('token');

      service.isLogin().subscribe((response) => {
        expect(response).toBeFalse();
        done();
      });
    });

    it('should return false when token is empty string', (done) => {
      localStorage.setItem('token', '');

      service.isLogin().subscribe((response) => {
        expect(response).toBeFalse();
        done();
      });
    });
  });

  it('should handle HTTP error correctly for signUp', () => {
    const mockUser = {
      name: 'Jane',
      email: 'jane@example.com',
      password: 'Password1!',
      roleId: 2,
    };

    const mockError = { status: 400, statusText: 'Bad Request' };

    service.signUp(mockUser).subscribe({
      next: () => fail('Expected an error, but got a success response'),
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Request');
      },
    });

    const req = httpMock.expectOne('/api/users');
    req.flush(null, mockError);
  });
});
