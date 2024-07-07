import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import baserUrl from './helper';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  registerDebt(debt: any): Observable<any> {
    return this.http.post(`${baserUrl}/api/deudas`, debt);
  }

  registerSchedule(schedule: any): Observable<any> {
    return this.http.post(`${baserUrl}/api/cronogramas-pago`, schedule);
  }

  getAllDebts(): Observable<any> {
    return this.http.get(`${baserUrl}/api/deudas`);
  }
}
