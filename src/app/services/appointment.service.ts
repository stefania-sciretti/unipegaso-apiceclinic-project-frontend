import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FitnessAppointment, FitnessAppointmentRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly base = '/api/appointments';
  private readonly http = inject(HttpClient);

  getAll(filters: { [key: string]: string } = {}): Observable<FitnessAppointment[]> {
    let params = new HttpParams();
    Object.keys(filters).forEach(k => { if (filters[k]) params = params.set(k, filters[k]); });
    return this.http.get<FitnessAppointment[]>(this.base, { params });
  }

  getById(id: number): Observable<FitnessAppointment> {
    return this.http.get<FitnessAppointment>(`${this.base}/${id}`);
  }

  create(body: FitnessAppointmentRequest): Observable<FitnessAppointment> {
    return this.http.post<FitnessAppointment>(this.base, body);
  }

  updateStatus(id: number, status: string): Observable<FitnessAppointment> {
    return this.http.put<FitnessAppointment>(`${this.base}/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
