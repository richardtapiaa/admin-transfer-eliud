import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import './CalendarioCSS/ModalAnimaciones.css';
import api from '../../../api/axios';

interface DetallesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReservaActualizada: () => void;
  reserva: {
    id: string;
    nombre: string;
    telefono: string;
    correo: string;
    personas: number;
    origen: string;
    destino: string;
    fechaHora: string;
    estado?: string;
  } | null;
}

export default function DetallesModal({
  isOpen,
  onClose,
  onReservaActualizada,
  reserva
}: DetallesModalProps) {
  const [cargando, setCargando] = useState(false);

  // Bloquear scroll del body y ocultar MenuInferior cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    }

    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen || !reserva) return null;

  const aceptarReserva = async () => {
    setCargando(true);

    try {
      await api.patch(`/reservas/${reserva.id}/aceptar`);
      toast.success('Reserva aceptada exitosamente');
      onReservaActualizada();
      onClose();
    } catch (error: any) {
      console.error('Error al aceptar reserva:', error);
      toast.error(error.response?.data?.message || 'Error al aceptar la reserva');
    } finally {
      setCargando(false);
    }
  };


  // Rechazar reserva
  const rechazarReserva = async () => {
    setCargando(true);

    try {
      await api.patch(`/reservas/${reserva.id}/rechazar`);
      toast.success('Reserva rechazada');
      onReservaActualizada();
      onClose();
    } catch (error: any) {
      console.error('Error al rechazar reserva:', error);
      toast.error(error.response?.data?.message || 'Error al rechazar la reserva');
    } finally {
      setCargando(false);
    }
  }
  if (!isOpen || !reserva) return null;

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  
  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-content bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Detalles de la reserva
            </h2>
            <p className="text-sm text-gray-400 mt-1">Información completa del servicio</p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-500 hover:bg-gray-50 rounded-full p-2 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Con scroll */}
        <div className="px-6 divide-y divide-gray-50 overflow-y-auto flex-1">
          {/* Cliente */}
          <div className="py-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-[#8BC34A]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Información del Cliente
              </h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4 py-3">
                <span className="text-gray-500">Nombre</span>
                <span className="font-medium text-gray-900">
                  {reserva.nombre}
                </span>
              </div>

              <div className="flex justify-between gap-4 py-3 border-t border-gray-50">
                <span className="text-gray-500">Teléfono</span>
                <a
                  href={`tel:${reserva.telefono}`}
                  className="font-medium text-[#8BC34A] hover:text-[#7CB342] hover:underline transition"
                >
                  {reserva.telefono}
                </a>
              </div>

              <div className="flex justify-between gap-4 py-3 border-t border-gray-50">
                <span className="text-gray-500">Correo</span>
                <a
                  href={`mailto:${reserva.correo}`}
                  className="font-medium text-[#8BC34A] hover:text-[#7CB342] hover:underline break-all text-right transition"
                >
                  {reserva.correo}
                </a>
              </div>
            </div>
          </div>

          {/* Viaje */}
          <div className="py-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-[#8BC34A]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Ruta del Viaje
              </h3>
            </div>

            <div className="relative pl-8 space-y-6">
              <span className="absolute left-3 top-3 bottom-3 w-0.5 bg-gradient-to-b from-[#8BC34A]/60 to-[#8BC34A]/20" />

              <div className="relative">
                <div className="absolute -left-8 top-1 w-6 h-6 bg-[#8BC34A]/20 rounded-full flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-[#8BC34A] rounded-full"></div>
                </div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Recogida</span>
                <p className="font-medium text-gray-800 mt-1">
                  {reserva.origen}
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-8 top-1 w-6 h-6 bg-[#8BC34A] rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Destino</span>
                <p className="font-medium text-gray-800 mt-1">
                  {reserva.destino}
                </p>
              </div>
            </div>
          </div>

          {/* Fecha y Personas */}
          <div className="py-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-[#8BC34A]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Fecha y Pasajeros
              </h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4 py-3">
                <span className="text-gray-500">Fecha del servicio</span>
                <span className="font-medium text-gray-900 text-right capitalize">
                  {formatearFecha(reserva.fechaHora)}
                </span>
              </div>

              <div className="flex justify-between gap-4 py-3 border-t border-gray-50">
                <span className="text-gray-500">Cantidad de personas</span>
                <span className="font-medium text-gray-900">
                  {reserva.personas} {reserva.personas === 1 ? 'persona' : 'personas'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-50 p-6 bg-gradient-to-b from-white to-gray-50/50">
          {/* Badge de estado */}
          {reserva.estado && (
            <div className="mb-4">
              <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium uppercase ${
                reserva.estado === 'PENDIENTE' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' :
                reserva.estado === 'CONFIRMADA' ? 'bg-green-50 text-green-600 border border-green-100' :
                'bg-red-50 text-red-600 border border-red-100'
              }`}>
                {reserva.estado}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {reserva.estado === 'PENDIENTE' ? (
              <>
                <button
                  onClick={aceptarReserva}
                  disabled={cargando}
                  className="w-full px-4 py-3 text-sm font-medium rounded-xl bg-[#8BC34A] text-white hover:bg-[#7CB342] transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cargando ? 'Aceptando...' : 'Aceptar Reserva'}
                </button>

                <button
                  onClick={rechazarReserva}
                  disabled={cargando}
                  className="w-full px-4 py-3 text-sm font-medium rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cargando ? 'Procesando...' : 'Rechazar'}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full px-4 py-3 text-sm font-medium rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
