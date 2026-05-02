import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlycemiaMeasurement, GlycemiaMeasurementRequest, GlycemiaClassificationRulesResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class GlycemiaService {
  private readonly base = '/api/glycemia-measurements';
  private readonly http = inject(HttpClient);

  getAll(patientId?: number): Observable<GlycemiaMeasurement[]> {
    const params = patientId ? new HttpParams().set('patientId', patientId) : undefined;
    return this.http.get<GlycemiaMeasurement[]>(this.base, { params });
  }

  getById(id: number): Observable<GlycemiaMeasurement> {
    return this.http.get<GlycemiaMeasurement>(`${this.base}/${id}`);
  }

  create(body: GlycemiaMeasurementRequest): Observable<GlycemiaMeasurement> {
    return this.http.post<GlycemiaMeasurement>(this.base, body);
  }

  update(id: number, body: GlycemiaMeasurementRequest): Observable<GlycemiaMeasurement> {
    return this.http.put<GlycemiaMeasurement>(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getClassificationRules(): Observable<GlycemiaClassificationRulesResponse> {
    return this.http.get<GlycemiaClassificationRulesResponse>(`${this.base}/classification-rules`);
  }
}
