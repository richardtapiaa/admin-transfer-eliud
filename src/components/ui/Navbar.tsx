import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotificaciones } from '../../hooks/useNotificaciones';
import {
  CalendarDaysIcon,
  TableCellsIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';




interface NavbarProps {
  externalSidebarOpen?: boolean;
  setExternalSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Navbar({ externalSidebarOpen, setExternalSidebarOpen }: NavbarProps) {
  const [localSidebarOpen, setLocalSidebarOpen] = useState(true);

  const sidebarOpen = externalSidebarOpen !== undefined ? externalSidebarOpen : localSidebarOpen;
  const setSidebarOpen = setExternalSidebarOpen || setLocalSidebarOpen;

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busquedaAbierta, setBusquedaAbierta] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const { noLeidas } = useNotificaciones();

  // solo en reservas.
  const esReservas = location.pathname === '/reservas';

  const cerrarSesion = () => {
    // Limpiar localStorage (no sessionStorage)
    localStorage.removeItem('user');

    // Redirigir al login
    navigate('/', { replace: true });
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (terminoBusqueda.trim()) {
      navigate(`/reservas?buscar=${encodeURIComponent(terminoBusqueda.trim())}`);
      setBusquedaAbierta(false);
      setTerminoBusqueda('');
    }
  };


  useEffect(() => {
 
  }, [location.pathname]);


  // Helper para links
  const NavLink = ({ to, icon: Icon, label, badgeCount }: { to: string; icon: any; label: string; badgeCount?: number }) => {
    const isActive = location.pathname === to;
    return (
      <a
        href={to}
        className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive
          ? 'bg-[#8BC34A] text-white shadow-md shadow-[#8BC34A]/20'
          : 'text-gray-500 hover:bg-gray-50 hover:text-[#8BC34A]'
          }`}
        title={!sidebarOpen ? label : ''}
      >
        <Icon className={`w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />

        <span className={`whitespace-nowrap font-medium transition-all duration-300 origin-left ${sidebarOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0 w-0 overflow-hidden'
          }`}>
          {label}
        </span>

        {badgeCount !== undefined && badgeCount > 0 && sidebarOpen && (
          <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        )}
        {/* Dot indicativo cuando está cerrado y tiene notificaciones */}
        {badgeCount !== undefined && badgeCount > 0 && !sidebarOpen && (
          <div className="absolute right-2 top-2 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white"></div>
        )}
      </a>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Mobile Header (Visible only on smaller screens if needed, otherwise handled by content padding elsewhere) */}
      {/* Keeping structure similar but focusing on Sidebar */}

      <div className="lg:hidden bg-white shadow-sm px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <img src="/logo/logo-eliud.png" alt="Eliud" className="h-10 w-auto" />
        </div>
        {esReservas && (
          <div className="flex items-center gap-2">
            <button onClick={() => setBusquedaAbierta(!busquedaAbierta)} className="p-2 text-gray-600">
              <MagnifyingGlassIcon className="w-6 h-6" />
            </button>
            <button onClick={() => setMenuAbierto(!menuAbierto)} className="p-2 text-gray-600">
              {menuAbierto ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        )}
      </div>


      {/* Desktop Topbar Header */}
      <header
        className={`hidden lg:flex items-center justify-between fixed top-0 right-0 h-20 bg-white shadow-sm z-40 transition-all duration-300 px-8 border-b border-gray-100 ${sidebarOpen ? 'left-72' : 'left-24'
          }`}
      >
        {/* Left side of header */}
        <div className="flex items-center gap-4">
          <img src="/logo/logo-eliud.png" alt="Eliud" className="h-10 w-auto" />
        </div>
      </header>


      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-full bg-white border-r border-gray-100 shadow-xl shadow-gray-200/50 transition-all duration-300 z-50 ${sidebarOpen ? 'w-72' : 'w-24'
          }`}
      >
        {/* Logo Area */}
        <div className="h-24 flex items-center justify-between px-6 mb-2 relative">
          {/* Logo visible only when open */}
          <div className={`transition-all duration-300 ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
            <img src="/logo/logo-eliud.png" alt="Eliud" className="h-10 w-auto object-contain" />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen((s: any) => !s);
            }}
            className={`p-2 rounded-full bg-gray-50 text-gray-400 hover:text-[#8BC34A] hover:bg-[#8BC34A]/10 transition-colors z-10 ${!sidebarOpen ? 'mx-auto' : ''}`}
            title={sidebarOpen ? "Colapsar menú" : "Expandir menú"}
          >
            {sidebarOpen ? (
              <ChevronLeftIcon className="w-5 h-5" />
            ) : (
              <ChevronRightIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            <NavLink to="/calendario" icon={CalendarDaysIcon} label="Calendario" />
            <NavLink to="/tabla-reservas" icon={TableCellsIcon} label="Reservas" />
          </div>

          <div className="pt-4 mt-4 border-t border-dashed border-gray-100 space-y-1">
            <NavLink to="/notificaciones" icon={BellIcon} label="Notificaciones" badgeCount={noLeidas} />
            <NavLink to="/ajustes" icon={Cog6ToothIcon} label="Ajustes" />
          </div>

          {/* Busqueda Desktop (Solo mostrada si está abierta la sidebar y es reservas? o genérica?) */}
          {sidebarOpen && esReservas && (
            <div className="mt-6 px-1">
              <form onSubmit={handleBuscar} className="relative group">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#8BC34A] transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                  className="w-full bg-gray-50 text-gray-700 text-sm rounded-xl py-3 pl-10 pr-4 outline-none border border-transparent focus:border-[#8BC34A]/30 focus:bg-white focus:shadow-sm transition-all placeholder:text-gray-400"
                />
              </form>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={cerrarSesion}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group text-gray-500 hover:bg-red-50 hover:text-red-500 ${!sidebarOpen ? 'justify-center' : ''
              }`}
            title="Cerrar Sesión"
          >
            <ArrowLeftOnRectangleIcon className="w-6 h-6 flex-shrink-0 transition-transform group-hover:-translate-x-1" />
            <span className={`whitespace-nowrap font-medium transition-all duration-300 overflow-hidden ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'
              }`}>
              Cerrar Sesión
            </span>
          </button>
        </div>
      </aside>


      {/* Barra de búsqueda móvil - Solo en Reservas */}
      {esReservas && busquedaAbierta && (
        <div
          className="lg:hidden bg-white border-t border-gray-200 shadow-lg px-4 py-3"
          style={{
            animation: 'slideDown 0.3s ease-out'
          }}
        >
          <style>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-10px);
                max-height: 0;
              }
              to {
                opacity: 1;
                transform: translateY(0);
                max-height: 200px;
              }
            }
          `}</style>
          <form onSubmit={handleBuscar} className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono, destino..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent"
              autoFocus
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>
        </div>
      )}


      {/* Dropdown Menu Móvil - Solo en Reservas */}
      {esReservas && menuAbierto && (
        <div
          className="lg:hidden bg-white border-t border-gray-200 shadow-lg overflow-hidden animate-slideDown"
          style={{
            animation: 'slideDown 0.3s ease-out'
          }}
        >
          <style>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-10px);
                max-height: 0;
              }
              to {
                opacity: 1;
                transform: translateY(0);
                max-height: 200px;
              }
            }
          `}</style>
          <div className="px-4 py-3 space-y-2">
            <a
              href="/reservas"
              className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-[#8BC34A]/10 hover:text-[#8BC34A] font-medium transition"
            >
              Reservas Pendientes
            </a>
            <a
              href="/reservas?estado=CONFIRMADA"
              className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-[#8BC34A]/10 hover:text-[#8BC34A] font-medium transition"
            >
              Reservas Confirmadas
            </a>
            <a
              href="/reservas?estado=RECHAZADA"
              className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-[#8BC34A]/10 hover:text-[#8BC34A] font-medium transition"
            >
              Reservas Rechazadas
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
