import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClinicalAppointment, ClinicalAppointmentRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ClinicalAppointmentService {
  private readonly base = '/api/appointments';
  private readonly http = inject(HttpClient);

  getAll(filters: { patientId?: number; specialistId?: number; status?: string } = {}): Observable<ClinicalAppointment[]> {
    let params = new HttpParams();
    if (filters.patientId) params = params.set('patientId', filters.patientId);
    if (filters.specialistId)  params = params.set('specialistId',  filters.specialistId);
    if (filters.status)    params = params.set('status',    filters.status);
    return this.http.get<ClinicalAppointment[]>(this.base, { params });
  }

  getById(id: number): Observable<ClinicalAppointment> {
    return this.http.get<ClinicalAppointment>(`${this.base}/${id}`);
  }

  create(body: ClinicalAppointmentRequest): Observable<ClinicalAppointment> {
    return this.http.post<ClinicalAppointment>(this.base, body);
  }
}
