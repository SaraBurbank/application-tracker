import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Application } from './application.model';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/applications';

  // Any component that reads `applications()` in its template re-renders
  // automatically when it changes -- no manual subscription needed.
  private readonly _applications = signal<Application[]>([]);
  readonly applications = this._applications.asReadonly();

  // Fetch all applications from the API and update the signal.
  loadApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(this.apiUrl).pipe(
      tap((apps) => this._applications.set(apps))
    );
  }

  getById(id: string): Observable<Application> {
    return this.http.get<Application>(`${this.apiUrl}/${id}`);
  }

  create(application: Application): Observable<Application> {
    return this.http.post<Application>(this.apiUrl, application).pipe(
      tap((created) => this._applications.update((current) => [...current, created]))
    );
  }

  update(id: string, changes: Partial<Application>): Observable<Application> {
    return this.http.put<Application>(`${this.apiUrl}/${id}`, changes).pipe(
      tap((updated) =>
        this._applications.update((current) =>
          current.map((app) => (app._id === id ? updated : app))
        )
      )
    );
  }

  delete(id: string): Observable<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(`${this.apiUrl}/${id}`).pipe(
      tap(() =>
        this._applications.update((current) => current.filter((app) => app._id !== id))
      )
    );
  }
}