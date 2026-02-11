import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import MenuInferior from '../ui/MenuInferior';
import Navbar from '../ui/Navbar';
import api from '../../api/axios';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface Reserva {
  id: string;
  nombre: string;
  telefono: string;
  correoElectronico: string;
  fechaHoraServicio: string;
  lugarRecogida: string;
  destino: string;
  cantidadPersonas: number;
  estado: string;
  fechaCreacion: string;
}

export default function Reservas() {
  const [searchParams] = useSearchParams();
  const estadoFiltro = searchParams.get('estado');
  const buscarFiltro = searchParams.get('buscar');
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 450,
      once: true,
    });
  }, []);

  useEffect(() => {
    cargarReservas();
  }, [estadoFiltro, buscarFiltro]);

  const cargarReservas = async () => {
    setCargando(true);
    try {
      // Construir la URL con parámetros de búsqueda
      let url = '/reservas';
      const params = new URLSearchParams();
      
      const idFiltro = searchParams.get('id');

      if (idFiltro) {
        // Si hay ID específico, cargar solo esa reserva
        const response = await api.get(`/reservas/${idFiltro}`);
        setReservas([response.data]);
      } else {
      
        if (buscarFiltro) {
          params.append('buscar', buscarFiltro);
        }
        
        if (estadoFiltro) {
          params.append('estado', estadoFiltro);
        } else if (!buscarFiltro) {
         
          params.append('estado', 'PENDIENTE');
        }
        
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }

        const response = await api.get(url);
        setReservas(response.data);
      }
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      setReservas([]);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-CR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Costa_Rica'
    });
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'CONFIRMADA':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'RECHAZADA':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'PENDIENTE':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#8BC34A]/19 flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-10 bg-[#8BC34A] rounded-full"></div>
              <h1 className="text-3xl font-bold text-gray-900">
                {buscarFiltro
                  ? `Reservas Encontradas`
                  : searchParams.get('id')
                  ? 'Detalle de Reserva'
                  : estadoFiltro
                    ? `Reservas ${estadoFiltro === 'CONFIRMADA' ? 'Confirmadas' : 'Rechazadas'}`
                    : 'Reservas Pendientes'}
              </h1>
            </div>
            <p className="text-gray-500 ml-7 text-sm">
              {buscarFiltro && (
                <span className="text-[#8BC34A] font-medium">Búsqueda: "{buscarFiltro}" · </span>
              )}
              {reservas.length === 0 
                ? 'No hay reservas en este momento'
                : `${reservas.length} ${reservas.length === 1 ? 'reserva' : 'reservas'} ${reservas.length === 1 ? 'encontrada' : 'encontradas'}`
              }
            </p>
          </div>

          {cargando ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BC34A]"></div>
            </div>
          ) : reservas.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="flex justify-center mb-4">
                <CalendarDaysIcon className="w-20 h-20 text-gray-300" />
              </div>
              <p className="text-gray-500 text-lg font-medium">No hay reservas {estadoFiltro ? estadoFiltro.toLowerCase() + 's' : ''}</p>
              <p className="text-gray-400 text-sm mt-2">Las nuevas reservas aparecerán aquí</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {reservas.map((reserva) => (
                <div
                  key={reserva.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4"
                  data-aos="fade-right"
                  data-aos-offset="300"
                  data-aos-easing="ease-in-sine"
                >
                  <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-200">
                    <h3 className="font-bold text-xl text-gray-900">
                      {reserva.nombre}
                    </h3>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm border ${obtenerColorEstado(reserva.estado)}`}>
                      {reserva.estado}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#8BC34A] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-gray-500 text-xs mb-0.5">Recogida</p>
                        <p className="text-gray-800 font-medium">{reserva.lugarRecogida}</p>
                        <p className="text-gray-500 text-xs mt-1.5 mb-0.5">Destino</p>
                        <p className="text-gray-800 font-medium">{reserva.destino}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-[#8BC34A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-gray-500 text-xs">Fecha del servicio</p>
                        <p className="text-gray-800 font-medium">{formatearFecha(reserva.fechaHoraServicio)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-[#8BC34A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <div>
                        <p className="text-gray-500 text-xs">Pasajeros</p>
                        <p className="text-gray-800 font-medium">{reserva.cantidadPersonas} persona{reserva.cantidadPersonas !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-3 mb-2">
                        <svg className="w-5 h-5 text-[#8BC34A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href={`tel:${reserva.telefono}`} className="text-[#8BC34A] hover:text-[#7CB342] font-medium hover:underline">
                          {reserva.telefono}
                        </a>
                      </div>

                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-[#8BC34A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a href={`mailto:${reserva.correoElectronico}`} className="text-[#8BC34A] hover:text-[#7CB342] text-sm hover:underline break-all">
                          {reserva.correoElectronico}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Recibida el {formatearFecha(reserva.fechaCreacion)}
                    </p>
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
