import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly urlUser = `${environment.apiUrl}/users`;
  private readonly urlLogin = `${environment.apiUrl}/auth/login`;

  constructor(private readonly http: HttpClient) {  }

  signUp(user: any) : Observable<any> {
    return this.http.post<any>(this.urlUser, user);
  }

  login(user: any): Observable<any> {
    return this.http.post<any>(this.urlLogin, user);
  }

  isLogin(): Observable<any> {
    if (localStorage.getItem('token')) {
      return this.http.get<any>(`${environment.apiUrl}/auth/verify`);
    } else {
      return of(false);
    }
  }
}
