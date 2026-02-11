import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    // Verificar que exista token JWT
    if (!token || !userStr) {
        // No hay token o usuario, redirigir a login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/" replace />;
    }

    try {
        const user = JSON.parse(userStr);

        // Verificar que el usuario tenga rol de administrador
        if (user.rol !== 'ADMINISTRADOR') {
            // No es administrador, limpiar y redirigir
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return <Navigate to="/" replace />;
        }

        // Usuario válido con token, mostrar el contenido protegido
        return <>{children}</>;
    } catch (error) {
        // Error al parsear el usuario, limpiar y redirigir
        console.error('Error al verificar sesión:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/" replace />;
    }
}
