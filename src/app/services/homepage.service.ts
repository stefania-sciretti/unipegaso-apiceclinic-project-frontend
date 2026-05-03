import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HomepageStats } from '../models/models';

@Injectable({ providedIn: 'root' })
export class HomepageService {
  private readonly base = '/api/homepage';
  private readonly http = inject(HttpClient);

  getStats(): Observable<HomepageStats> {
    return this.http.get<HomepageStats>(this.base);
  }
}
