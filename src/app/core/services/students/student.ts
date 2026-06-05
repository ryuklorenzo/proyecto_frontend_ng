import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
  providedIn: 'root',
})
export class StudentService {

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  token = this.authService.token();

  createStudent(student: any, idCurso: number) {
    return this.http.post(
      `/api/students/?id_curso=${idCurso}`,
      student,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.token}`
        })
      }
    );
  }

  getStudents() {
    return this.http.get('/api/students/', {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });
  }

  getStudentById(id: number) {
    return this.http.get(`/api/students/${id}/`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });
  }

  bajaStudent(id: number) {
    return this.http.delete(`/api/students/${id}/baja/`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });
  }
}