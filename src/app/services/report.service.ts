import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Report {
  id: number;
  appointmentId: number;
  patientFullName: string;
  specialistFullName: string;
  visitType: string;
  scheduledAt: string;
  issuedDate: string;
  diagnosis: string;
  prescription?: string;
  doctorNotes?: string;
  createdAt: string;
}

export interface ReportRequest {
  appointmentId: number;
  diagnosis: string;
  prescription?: string | null;
  doctorNotes?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly base = '/api/reports';
  private readonly http = inject(HttpClient);

  getAll(): Observable<Report[]> {
    return this.http.get<Report[]>(this.base);
  }

  getById(id: number): Observable<Report> {
    return this.http.get<Report>(`${this.base}/${id}`);
  }

  create(body: ReportRequest): Observable<Report> {
    return this.http.post<Report>(this.base, body);
  }

  update(id: number, body: ReportRequest): Observable<Report> {
    return this.http.put<Report>(`${this.base}/${id}`, body);
  }
}
