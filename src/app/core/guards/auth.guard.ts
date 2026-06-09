import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    const currentUser = authService.user();
    
    //al login si no hay user
    if (!currentUser) {
        router.navigate(['/']);
        return false;
    }

    //permitir si es dashboard
    if (state.url === '/dashboard') {
        return true;
    }

    //mirar permisos específicos de las subrutas
    const expectedRoles = route.data['expectedRoles'] as string[];
    if (expectedRoles && expectedRoles.includes(currentUser.role)) {
        return true;
    }

    // redirigir a un dashboard si no hay permisos
    router.navigate(['/dashboard']); 
    return false;
};