import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Speciality } from '../../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpecialityService {
  private readonly baseUrl = `${environment.apiUrl}/specialities`;

  constructor(private readonly http: HttpClient) { }

  getSpecialities(): Observable<Speciality[]> {
    return this.http.get<Speciality[]>(this.baseUrl);
  }

  addSpeciality(name: string): Observable<Speciality> {
    return this.http.post<Speciality>(this.baseUrl, { name });
  }
}
