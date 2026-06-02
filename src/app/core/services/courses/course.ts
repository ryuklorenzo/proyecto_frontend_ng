import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
    providedIn: 'root',
})
export class CourseService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);
    token = this.authService.token();

    createCourse(idHorario: number, course: any) {

        const token = this.authService.token();

        return this.http.post(
            `/api/courses/?id_horario=${idHorario}`,
            course,
            {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${this.token}`
                })
            }
        );
    }

    getCourses() {
        return this.http.get('/api/courses/', {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        });
    }

    getCourseById(id: number) {
        return this.http.get(
            `/api/courses/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }

    updateCourse(id: number, id_horario: number, course: any) {
    return this.http.put(
        `/api/courses/${id}?id_horario=${id_horario}`, 
        course, 
        {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        }
    );
}

    deleteCourse(id: number) {
        return this.http.delete(
            `/api/courses/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }
}