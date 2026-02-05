import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
  success: boolean;
  url: string;
  blobName: string;
}

@Injectable({
  providedIn: 'root',
})
export class Upload {
  private readonly baseUrl = `${environment.apiUrl}/upload`;

  constructor(private readonly http: HttpClient) {}

  postFile(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadResponse>(this.baseUrl, formData);
  }

  postFileImage(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('container', 'avatars');
    return this.http.post<UploadResponse>(`${this.baseUrl}/image`, formData);
  }

  getAllFiles(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/list`);
  }
}
