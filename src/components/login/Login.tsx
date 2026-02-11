import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from '../../api/axios';
import { requestNotificationPermission } from '../../notificaciones/requestPermission';


export default function Login() {
  const navigate = useNavigate();
  const [correoElectronico, setCorreoElectronico] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);



  // Verificar si el usuario ya está logueado
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.rol === 'ADMINISTRADOR') {
          // Usuario ya está logueado, redirigir al calendario
          navigate('/calendario', { replace: true });
        }
      } catch (error) {
        // Si hay error al parsear, limpiar localStorage
        localStorage.removeItem('user');
      }
    }
  }, [navigate]);

  const manejarEnvioFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstaCargando(true);

    try {
      const respuesta = await axios.post('/auth/login', {
        correoElectronico,
        contrasena,
      });

      // Verificar que el usuario tenga rol de administrador
      if (respuesta.data.usuario.rol !== 'ADMINISTRADOR') {
        toast.error('Acceso denegado. Solo administradores pueden acceder al panel.');
        setEstaCargando(false);
        return;
      }

      // Guardar token JWT (nuevo - lo más importante)
      localStorage.setItem('token', respuesta.data.token);

      // Guardar usuario en localStorage (persiste entre sesiones)
      localStorage.setItem('user', JSON.stringify(respuesta.data.usuario));

      // Generar token de notificaciones automáticamente
      try {
        await requestNotificationPermission();
      } catch (error) {
        console.error(' [Login] Error al generar token:', error);
      }

      // Redirigir al calendario
      navigate('/calendario', { replace: true });

    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);

      // Manejar diferentes tipos de errores
      if (error.response?.status === 401) {
        toast.error(error.response.data.message || 'Credenciales incorrectas o acceso denegado');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al iniciar sesión. Por favor, intente nuevamente.');
      }
    } finally {
      setEstaCargando(false);
    }
  };



  return (
    <div className="min-h-screen flex">
      {/* Columna Izquierda - Formulario */}
      <div className="flex-1 flex items-center justify-center bg-[#8BC34A]/19 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img
                src="/logo/logo-eliud.png"
                alt="Transporte Eliud Logo"
                className="h-24 w-auto"
              />
            </div>

            {/* Títulos */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Transporte Eliud
              </h1>
              <p className="text-gray-600 text-base">
                Aplicacion administrativa de Reservas
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={manejarEnvioFormulario} className="space-y-5">
              <div>
                <label
                  htmlFor="correoElectronico"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Correo Electrónico
                </label>
                <input
                  id="correoElectronico"
                  type="email"
                  required
                  value={correoElectronico}
                  onChange={(e) => setCorreoElectronico(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-[#8BC34A] focus:bg-white transition duration-200 outline-none"

                />
              </div>

              <div>
                <label
                  htmlFor="contrasena"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Contraseña
                </label>
                <input
                  id="contrasena"
                  type="password"
                  required
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-[#8BC34A] focus:bg-white transition duration-200 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={estaCargando}
                className="w-full bg-[#8BC34A] text-white font-semibold py-3.5 px-4 rounded-lg hover:bg-[#7CB342] focus:outline-none focus:ring-2 focus:ring-[#8BC34A] focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-6"
              >
                {estaCargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Columna Derecha - Imagen */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img
          src="https://d1cq5bmaro4ubb.cloudfront.net/wp-content/uploads/2025/02/Manuel-Antonio-National-Park-Costa-Rica.jpeg"
          alt="Costa Rica"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#8BC34A]/20 to-[#7CB342]/20" />
      </div>
    </div>
  );
}