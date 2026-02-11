import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import '../../home/HomeComponents/CalendarioCSS/ModalAnimaciones.css';

interface FormularioNuevaReservaProps {
  onCerrar: () => void;
  onReservaCreada: () => void;
}

export default function FormularioNuevaReserva({ onCerrar, onReservaCreada }: FormularioNuevaReservaProps) {
  const [enviando, setEnviando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    correoElectronico: '',
    fechaHoraServicio: '',
    lugarRecogida: '',
    destino: '',
    cantidadPersonas: 1,
  });

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');

    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cantidadPersonas' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    if (!formData.telefono.trim()) {
      toast.error('El teléfono es requerido');
      return;
    }
    if (!formData.correoElectronico.trim()) {
      toast.error('El correo electrónico es requerido');
      return;
    }
    if (!formData.fechaHoraServicio) {
      toast.error('La fecha y hora del servicio es requerida');
      return;
    }
    if (!formData.lugarRecogida.trim()) {
      toast.error('El lugar de recogida es requerido');
      return;
    }
    if (!formData.destino.trim()) {
      toast.error('El destino es requerido');
      return;
    }
    if (formData.cantidadPersonas < 1) {
      toast.error('La cantidad de personas debe ser al menos 1');
      return;
    }

    setEnviando(true);

    try {
      const response = await fetch('http://localhost:3000/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          desdeAdmin: true, // Indicar que viene desde el panel admin
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la reserva');
      }

      toast.success('Reserva creada exitosamente');
      onReservaCreada();
      onCerrar();
    } catch (error) {
      console.error('Error al crear reserva:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear la reserva');
    } finally {
      setEnviando(false);
    }
  };

  // Obtener fecha mínima (hoy) en formato correcto para el input datetime-local
  const getFechaMinima = () => {
    const ahora = new Date();
    ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
    return ahora.toISOString().slice(0, 16);
  };

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onCerrar}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-content bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Nueva Reserva
            </h2>
            <p className="text-sm text-gray-400 mt-1">Crear una reserva para un cliente</p>
          </div>

          <button
            onClick={onCerrar}
            disabled={enviando}
            className="text-gray-300 hover:text-gray-500 hover:bg-gray-50 rounded-full p-2 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario - Con scroll */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 divide-y divide-gray-50 overflow-y-auto flex-1 min-h-0">
            {/* Información del Cliente */}
            <div className="py-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-[#8BC34A]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Información del Cliente
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-500 mb-2">
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8BC34A]/20 focus:border-[#8BC34A] transition text-gray-900"
                    disabled={enviando}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-500 mb-2">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8BC34A]/20 focus:border-[#8BC34A] transition text-gray-900"
                      disabled={enviando}
                      maxLength={20}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="correoElectronico" className="block text-sm font-medium text-gray-500 mb-2">
                      Correo electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="correoElectronico"
                      name="correoElectronico"
                      value={formData.correoElectronico}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8BC34A]/20 focus:border-[#8BC34A] transition text-gray-900"
                      disabled={enviando}
                      maxLength={100}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ruta del Viaje */}
            <div className="py-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-[#8BC34A]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Ruta del Viaje
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="lugarRecogida" className="block text-sm font-medium text-gray-500 mb-2">
                    Lugar de recogida <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lugarRecogida"
                    name="lugarRecogida"
                    value={formData.lugarRecogida}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8BC34A]/20 focus:border-[#8BC34A] transition text-gray-900"

                    disabled={enviando}
                    maxLength={255}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="destino" className="block text-sm font-medium text-gray-500 mb-2">
                    Destino <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="destino"
                    name="destino"
                    value={formData.destino}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8BC34A]/20 focus:border-[#8BC34A] transition text-gray-900"
                    disabled={enviando}
                    maxLength={255}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Fecha y Pasajeros */}
            <div className="py-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-[#8BC34A]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Fecha y Pasajeros
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="fechaHoraServicio" className="block text-sm font-medium text-gray-500 mb-2">
                    Fecha y hora del servicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="fechaHoraServicio"
                    name="fechaHoraServicio"
                    value={formData.fechaHoraServicio}
                    onChange={handleChange}
                    min={getFechaMinima()}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8BC34A]/20 focus:border-[#8BC34A] transition text-gray-900"
                    disabled={enviando}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="cantidadPersonas" className="block text-sm font-medium text-gray-500 mb-2">
                    Cantidad de personas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="cantidadPersonas"
                    name="cantidadPersonas"
                    value={formData.cantidadPersonas}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8BC34A]/20 focus:border-[#8BC34A] transition text-gray-900"
                    disabled={enviando}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-50 p-6 bg-gradient-to-b from-white to-gray-50/50">
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={enviando}
                className="w-full px-4 py-3 text-sm font-medium rounded-xl bg-[#8BC34A] text-white hover:bg-[#7CB342] transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enviando ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creando reserva...
                  </span>
                ) : (
                  'Crear Reserva'
                )}
              </button>

              <button
                type="button"
                onClick={onCerrar}
                disabled={enviando}
                className="w-full px-4 py-3 text-sm font-medium rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
