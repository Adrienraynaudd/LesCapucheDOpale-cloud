import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { of } from 'rxjs';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  let next: jasmine.Spy<HttpHandlerFn>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    next = jasmine.createSpy('next').and.callFake((req) => of({} as HttpEvent<any>));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should add Authorization header when token exists', (done) => {
    localStorage.setItem('token', 'abc123');

    const req = new HttpRequest('GET', '/api/data');

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe(() => {
        const calledReq = next.calls.mostRecent().args[0] as HttpRequest<any>;

        expect(calledReq.headers.get('Authorization')).toBe('Bearer abc123');
        done();
      });
    });
  });

  it('should still call next without token', (done) => {
    const req = new HttpRequest('GET', '/api/data');

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe(() => {
        const calledReq = next.calls.mostRecent().args[0] as HttpRequest<any>;

        expect(calledReq.headers.get('Authorization')).toBe('Bearer null');
        done();
      });
    });
  });
});

