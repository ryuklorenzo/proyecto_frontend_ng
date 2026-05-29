import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
  providedIn: 'root',
})
export class StudentService {

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  createStudent(student: any, idCurso: number) {

    const token = this.authService.token();

    return this.http.post(
      `/api/students/?id_curso=${idCurso}`,
      student,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }
    );
  }
}