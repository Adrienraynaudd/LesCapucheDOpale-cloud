import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


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

  isLogin(): boolean {
    return localStorage.getItem('token') !== null && localStorage.getItem('token') !== undefined && localStorage.getItem('token') !== '';
  }

}