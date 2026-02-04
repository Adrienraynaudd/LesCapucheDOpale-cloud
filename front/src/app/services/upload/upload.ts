import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Upload {
  private readonly baseUrl = `${environment.apiUrl}/upload`;

  constructor(private readonly http: HttpClient) {}

  postFile(file: File): Observable<any> {
    return this.http.post<any>(this.baseUrl, file);
  }

  postFileImage(file: File): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/image`, file);
  }

  getAllFiles(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/list`);
  }
}
