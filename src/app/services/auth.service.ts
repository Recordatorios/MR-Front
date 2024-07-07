import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import baserUrl from './helper';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    return this.http.post(`${baserUrl}/api/user/register`, user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${baserUrl}/api/auth/login`, credentials);
  }

  isLoggedIn(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
    }
  }

  registerDebt(debt: any): Observable<any> {
    return this.http.post(`${baserUrl}/api/deudas`, debt, this.getHeaders());
  }

  registerSchedule(schedule: any): Observable<any> {
    return this.http.post(`${baserUrl}/api/cronogramas-pago`, schedule, this.getHeaders());
  }

  getDebtsByMonthAndYear(month: number, year: number): Observable<any> {
    return this.http.get(`${baserUrl}/api/deudas/month/${month}/year/${year}`, this.getHeaders());
  }

  searchDebtsByNumeroDocumento(numeroDocumento: string): Observable<any> {
    return this.http.get(`${baserUrl}/api/deudas/search?numeroDocumento=${numeroDocumento}`, this.getHeaders());
  }

  markAsPaid(debtId: number): Observable<void> {
    return this.http.patch<void>(`${baserUrl}/api/deudas/${debtId}/mark-as-paid`, {}, this.getHeaders());
  }

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.getToken()}`
      })
    };
  }
}
