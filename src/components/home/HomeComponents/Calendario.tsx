import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { PlusIcon } from '@heroicons/react/24/outline';
import api from '../../../api/axios';
import DetallesModal from './DetallesModal';
import FormularioNuevaReserva from './FormularioNuevaReserva';



// estilos del calendario (CSS)
import './CalendarioCSS/Calendario.css';


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
}

export default function Calendario() {
  const [vistaActual, setVistaActual] = useState('timeGridDay');
  const [esMobile, setEsMobile] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<any>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const fechaActual = new Date();
  const calendarioRef = useRef<FullCalendar>(null);

  // Cargar reservas desde la API
  useEffect(() => {
    cargarReservas();
    
    // Actualizar reservas cada 30 segundos
    const intervalo = setInterval(() => {
      cargarReservas();
    }, 30000);

    return () => clearInterval(intervalo);
  }, []);


  // cargar reservas desde la API
  const cargarReservas = async () => {
    try {
      const response = await api.get('/reservas');
      setReservas(response.data);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    }
  };

  useEffect(() => {
    const manejarResize = () => {
      const mobile = window.innerWidth < 768;
      setEsMobile(mobile);
      if (mobile && vistaActual === 'timeGridWeek') {
        setVistaActual('timeGridDay');
      }
    };

    manejarResize();
    window.addEventListener('resize', manejarResize);
    return () => window.removeEventListener('resize', manejarResize);
  }, [vistaActual]);


  
  // Transformar reservas al formato de eventos de FullCalendar
  const eventos = reservas.map((reserva) => {
    // Color según el estado
    const backgroundColor = 
      reserva.estado === 'CONFIRMADA' ? '#8BC34A' :
      reserva.estado === 'RECHAZADA' ? '#EF4444' :
      '#FFA500';
    
    const borderColor = 
      reserva.estado === 'CONFIRMADA' ? '#7CB342' :
      reserva.estado === 'RECHAZADA' ? '#DC2626' :
      '#FF8C00';

    return {
      id: reserva.id,
      title: `${reserva.nombre} - ${reserva.lugarRecogida} → ${reserva.destino}`,
      start: reserva.fechaHoraServicio,
      allDay: false,
      backgroundColor,
      borderColor,
      extendedProps: {
        telefono: reserva.telefono,
        correo: reserva.correoElectronico,
        personas: reserva.cantidadPersonas,
        origen: reserva.lugarRecogida,
        destino: reserva.destino,
        estado: reserva.estado,
      },
    };
  });

  const cambiarVista = (vista: string) => {
    setVistaActual(vista);
  };

  const obtenerProximosDias = () => {
    const dias = [];
    for (let i = 0; i < 30; i++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + i);
      dias.push(fecha);
    }
    return dias;
  };

  const diasSemana = obtenerProximosDias();

  const seleccionarDia = (fecha: Date) => {
    setFechaSeleccionada(fecha);
    
    // Cambiar la fecha en el calendario de FullCalendar
    if (calendarioRef.current) {
      const api = calendarioRef.current.getApi();
      api.gotoDate(fecha);
    }
  };

  return (
    <div className="bg-white md:rounded-2xl md:shadow-lg max-w-full overflow-hidden flex flex-col h-full">
      
      {/* Selector de días móvil */}
      {esMobile && (
        <div className="bg-white border-b border-gray-200 px-3 py-3">
          <div className="flex justify-start gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth">
            {diasSemana.map((dia, index) => {
              const esSeleccionado = dia.toDateString() === fechaSeleccionada.toDateString();
              const nombreDia = dia.toLocaleDateString('es-ES', { weekday: 'short' });
              const numeroDia = dia.getDate();
              
              return (
                <button
                  key={index}
                  onClick={() => seleccionarDia(dia)}
                  className={`snap-center flex-shrink-0 flex flex-col items-center justify-center w-12 h-16 rounded-xl transition-all ${
                    esSeleccionado
                      ? 'bg-[#8BC34A] text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span className="text-xs font-medium capitalize mb-1">
                    {nombreDia}
                  </span>
                  <span className="text-lg font-bold">
                    {numeroDia}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Header Desktop */}
      {!esMobile && (
        <div className="p-4 md:p-6 pb-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate">
                Calendario de Reservas
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm mt-1 truncate">
                {fechaActual.toLocaleDateString('es-ES', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            {/* Botones de vista y actualizar */}
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={cargarReservas}
                className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                title="Actualizar reservas"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={() => cambiarVista('timeGridDay')}
                className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  vistaActual === 'timeGridDay'
                    ? 'bg-[#8BC34A] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Día
              </button>
              <button
                onClick={() => cambiarVista('timeGridWeek')}
                className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  vistaActual === 'timeGridWeek'
                    ? 'bg-[#8BC34A] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => cambiarVista('dayGridMonth')}
                className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  vistaActual === 'dayGridMonth'
                    ? 'bg-[#8BC34A] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Mes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendario */}
      <div className="calendario-container flex-1 p-3 sm:p-4 md:p-6 pt-3">
        <FullCalendar
          ref={calendarioRef}
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView={vistaActual}
          initialDate={fechaSeleccionada.toISOString().split('T')[0]}
          key={vistaActual}
          locale={esLocale}
          timeZone="local"
          height="100%"
          contentHeight="auto"
          slotMinTime="05:00:00"
          slotMaxTime="23:00:00"
          allDaySlot={false}
          nowIndicator={true}
          headerToolbar={esMobile ? false : {
            left: 'prev,next',
            center: 'title',
            right: 'today',
          }}
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
          }}
          titleFormat={{
            year: 'numeric',
            month: esMobile ? 'short' : 'long',
            day: 'numeric',
          }}
          dayHeaderFormat={{
            weekday: esMobile ? 'short' : 'short',
            day: 'numeric',
            omitCommas: true,
          }}
          events={eventos}
          eventClick={(info) => {
            // Abrir modal con detalles de la reserva
            const reserva = reservas.find(r => r.id === info.event.id);
            
            if (reserva) {
              setReservaSeleccionada({
                id: reserva.id,
                nombre: reserva.nombre,
                telefono: reserva.telefono,
                correo: reserva.correoElectronico,
                personas: reserva.cantidadPersonas,
                origen: reserva.lugarRecogida,
                destino: reserva.destino,
                fechaHora: reserva.fechaHoraServicio,
                estado: reserva.estado,
              });
              setModalAbierto(true);
            }
          }}
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            meridiem: 'short',
          }}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            meridiem: 'short',
          }}
          slotDuration="00:30:00"
          slotLabelInterval={esMobile ? '01:00:00' : '01:00:00'}
          expandRows={true}
          eventDisplay="block"
          eventMaxStack={esMobile ? 2 : 3}
        />
      </div>

      {/* Modal de Detalles */}
      <DetallesModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onReservaActualizada={cargarReservas}
        reserva={reservaSeleccionada}
      />

      {/* Botón flotante para crear nueva reserva */}
      <button
        onClick={() => setMostrarFormulario(true)}
        className="fixed bottom-24 lg:bottom-8 right-8 bg-[#8BC34A] hover:bg-[#7CB342] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 z-40 group hover:scale-110"
        title="Nueva Reserva"
      >
        <PlusIcon className="w-7 h-7" />
        <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Nueva Reserva
        </span>
      </button>

      {/* Modal del formulario */}
      {mostrarFormulario && (
        <FormularioNuevaReserva
          onCerrar={() => setMostrarFormulario(false)}
          onReservaCreada={cargarReservas}
        />
      )}
    </div>
  );
}
