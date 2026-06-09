import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
  providedIn: 'root',
})
export class TeacherService {

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  createTeacher(teacher: any, idCurso: number) {
    return this.http.post(
      `/api/teachers/?id_curso=${idCurso}`,
      teacher,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.authService.token()}`
        })
      }
    );
  }

  getTeachers() {
    return this.http.get('/api/teachers/', {
      headers: {
        Authorization: `Bearer ${this.authService.token()}`
      }
    });
  }

  getTeacherById(id: number) {
    return this.http.get(`/api/teachers/${id}/`, {
      headers: {
        Authorization: `Bearer ${this.authService.token()}`
      }
    });
  }

  bajaTeacher(id: number) {
    return this.http.delete(`/api/teachers/${id}/baja/`, {
      headers: {
        Authorization: `Bearer ${this.authService.token()}`
      }
    });
  }
}