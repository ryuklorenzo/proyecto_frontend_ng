import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
  providedIn: 'root',
})
export class ExecutiveService {

  private http = inject(HttpClient);
  private authService = inject(AuthService);
   

  createExecutive(idProfesor: number, cargo: string) {
    return this.http.post(
      `/api/executives/${idProfesor}/`,
      { cargo },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.authService.token()}`
        })
      }
    );
  }

  getExecutives() {
    return this.http.get('/api/executives/', {
      headers: {
        Authorization: `Bearer ${this.authService.token()}`
      }
    });
  }

  getExecutiveById(id: number) {
    return this.http.get(`/api/executives/${id}/`, {
      headers: {
        Authorization: `Bearer ${this.authService.token()}`
      }
    });
  }

  deleteExecutive(id: number) {
    return this.http.delete(`/api/executives/${id}/baja/`, {
      headers: {
        Authorization: `Bearer ${this.authService.token()}`
      }
    });
  }
}