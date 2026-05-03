import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceRequest, ServiceResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ClinicServicesService {
  private readonly base = '/api/services';
  private readonly http = inject(HttpClient);

  getAll(specialistId?: number): Observable<ServiceResponse[]> {
    const params = specialistId != null
      ? new HttpParams().set('specialistId', specialistId)
      : undefined;
    return this.http.get<ServiceResponse[]>(this.base, { params });
  }

  create(request: ServiceRequest): Observable<ServiceResponse> {
    return this.http.post<ServiceResponse>(this.base, request);
  }
}
