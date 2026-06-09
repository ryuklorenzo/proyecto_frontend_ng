import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
    providedIn: 'root',
})
export class CourseService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);

    createCourse(idHorario: number, course: any) {
        return this.http.post(
            `/api/courses/?id_horario=${idHorario}`,
            course,
            {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${this.authService.token()}`
                })
            }
        );
    }

    getCourses() {
        return this.http.get('/api/courses/', {
            headers: {
                Authorization: `Bearer ${this.authService.token()}`
            }
        });
    }

    getCourseById(id: number) {
        return this.http.get(
            `/api/courses/${id}/`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }

    updateCourse(id: number, idHorario: number, course: any) {
        return this.http.put(
            `/api/courses/${id}/?id_horario=${idHorario}`,
            course,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }

    deleteCourse(id: number) {
        return this.http.delete(
            `/api/courses/${id}/`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }
}