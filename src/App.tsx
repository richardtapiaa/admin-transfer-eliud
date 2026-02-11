import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// componente login
import Login from './components/login/Login';

// componente de protección de rutas
import ProtectedRoute from './components/auth/ProtectedRoute';

// componente de inicio 
import Inicio from './components/home/Inicio';


// componente de reservas
import Reservas from './components/reservas/Reservas';


// componente de tabla de reservas (unicamente para desktopp)

import TablaDeReservas from './components/reservas/TablaDeReservas';

// componente de notificaciones
import Notificaciones from './components/notificaciones/Notificaciones';


// componente de ajustes
import Ajustes from './components/ajustes/Ajustes';

// utilidades
import { requestNotificationPermission } from './notificaciones/requestPermission';



export default function App() {

  useEffect(() => {
    // Intentar actualizar el token de notificaciones al cargar la app si hay sesión
    const userStr = localStorage.getItem('user');
    if (userStr) {
      requestNotificationPermission().catch(console.error);
    }
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: '#8BC34A',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/calendario"
          element={
            <ProtectedRoute>
              <Inicio />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservas"
          element={
            <ProtectedRoute>
              <Reservas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notificaciones"
          element={
            <ProtectedRoute>
              <Notificaciones />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ajustes"
          element={
            <ProtectedRoute>
              <Ajustes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tabla-reservas"
          element={
            <ProtectedRoute>
              <TablaDeReservas />
            </ProtectedRoute>
          }
        />


      </Routes>
    </BrowserRouter>
  );
}