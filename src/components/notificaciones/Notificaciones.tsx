
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onMessage } from 'firebase/messaging';
import { messaging } from '../../lib/firebase';
import MenuInferior from '../ui/MenuInferior';
import Navbar from '../ui/Navbar';
import api from '../../api/axios';

interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  datos?: any;
  fechaCreacion: string;
  leida: boolean;
}

import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Notificaciones() {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // aos 
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  // Cargar notificaciones desde el backend
  const cargarNotificaciones = async () => {
    try {
      const { data } = await api.get('/notificaciones');
      setNotificaciones(data);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarNotificaciones();

    // Escuchar notificaciones en tiempo real
    const unsubscribe = onMessage(messaging, (payload) => {
      // Cuando llega una notificación, recargar la lista para tener la versión del servidor
      // O agregarla manualmente si queremos evitar la llamada
      const nuevaNotificacion: Notificacion = {
        id: 'temp-' + Date.now(), // ID temporal hasta recargar
        titulo: payload.notification?.title || 'Nueva notificación',
        mensaje: payload.notification?.body || '',
        datos: payload.data,
        fechaCreacion: new Date().toISOString(),
        leida: false,
      };

      setNotificaciones((prev) => [nuevaNotificacion, ...prev]);

      // Mostrar notificación nativa si es necesario
      if (Notification.permission === 'granted') {
        new Notification(nuevaNotificacion.titulo, {
          body: nuevaNotificacion.mensaje,
          icon: '/icon-192.png',
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const marcarComoLeida = async (id: string) => {
    try {

      setNotificaciones((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, leida: true } : notif
        )
      );

    
      if (!id.startsWith('temp-')) {
        await api.patch(`/notificaciones/${id}/leer`);
      }
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const formatearFecha = (fecha: string) => {
    const fechaObj = new Date(fecha);
    const ahora = new Date();
    const diff = ahora.getTime() - fechaObj.getTime();
    const minutos = Math.floor(diff / 60000);

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (minutos < 1440) return `Hace ${Math.floor(minutos / 60)} h`;
    return fechaObj.toLocaleDateString('es-CR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const noLeidas = notificaciones.filter((n) => !n.leida).length;


  return (
    <div className="min-h-screen bg-[#8BC34A]/10 flex flex-col">
      <Navbar externalSidebarOpen={sidebarOpen} setExternalSidebarOpen={setSidebarOpen} />
      <div className={`flex-1 pt-28 pb-20 px-6 transition-all duration-300 ${sidebarOpen ? 'lg:pl-80' : 'lg:pl-32'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-10 bg-[#8BC34A] rounded-full"></div>
              <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
            </div>
            <p className="text-gray-500 ml-7 text-sm">
              {notificaciones.length === 0
                ? 'No hay notificaciones en este momento'
                : `${notificaciones.length} ${notificaciones.length === 1 ? 'notificación' : 'notificaciones'}`
              }
              {noLeidas > 0 && (
                <span className="text-red-500 font-medium"> · {noLeidas} sin leer</span>
              )}
            </p>
          </div>

          {cargando ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BC34A]"></div>
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <p className="text-gray-600 text-lg">No hay notificaciones</p>
              <p className="text-gray-400 text-sm mt-2">
                Aquí aparecerán las nuevas reservas
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  className={`bg-white rounded-xl shadow-md p-4 transition-all hover:shadow-lg cursor-pointer group ${!notif.leida ? 'ring-2 ring-[#8BC34A]/30' : ''
                    }`}
                  data-aos="fade-up"
                  data-aos-duration="500"
                  onClick={() => {
                    if (!notif.leida) marcarComoLeida(notif.id);
                    if (notif.datos?.reservaId) {
                      navigate(`/reservas?id=${notif.datos.reservaId}`);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">
                          {notif.titulo}
                        </h3>
                        {!notif.leida && (
                          <span className="w-2 h-2 bg-[#8BC34A] rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {notif.mensaje}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{formatearFecha(notif.fechaCreacion)}</span>
                        </div>
                        {notif.datos?.reservaId && (
                          <span className="text-[#8BC34A] text-xs font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            Ver detalles de la reserva
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <MenuInferior />
    </div>
  );
}

