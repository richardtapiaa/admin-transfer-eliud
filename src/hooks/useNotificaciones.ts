import { useState, useEffect } from 'react';
import api from '../api/axios';

interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  datos?: any;
  fechaCreacion: string;
  leida: boolean;
}


// Hook para manejar notificaciones 
export function useNotificaciones() {
  const [noLeidas, setNoLeidas] = useState(0);

  const cargarConteo = async () => {
    try {
      const { data } = await api.get<Notificacion[]>('/notificaciones');
      const conteo = data.filter((n) => !n.leida).length;
      setNoLeidas(conteo);
    } catch (error) {
      console.error('Error al cargar conteo de notificaciones:', error);
    }
  };

  useEffect(() => {
    cargarConteo();

    // Actualizar cada 30 segundos
    const interval = setInterval(cargarConteo, 30000);

    return () => clearInterval(interval);
  }, []);

  return { noLeidas, actualizarConteo: cargarConteo };
}
