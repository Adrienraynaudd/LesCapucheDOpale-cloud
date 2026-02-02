import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly urlUser = `/api/users`;
  private readonly urlLogin = `/api/auth/login`;

  constructor(private readonly http: HttpClient) {  }

  signUp(user: any) : Observable<any> {
    return this.http.post<any>(this.urlUser, user);
  }

  login(user: any): Observable<any> {
    return this.http.post<any>(this.urlLogin, user);
  }

  isLogin(): Observable<any> {
    if (localStorage.getItem('token')) {
      return this.http.get<any>('api/auth/verify');
    } else {
      return of(false);
    }
  }
}
