import { useState } from 'react';
import Navbar from '../ui/Navbar';
import Calendario from './HomeComponents/Calendario';
import MenuInferior from '../ui/MenuInferior';

export default function Inicio() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#8BC34A]/19 flex flex-col">
      <Navbar externalSidebarOpen={sidebarOpen} setExternalSidebarOpen={setSidebarOpen} />
      <div className={`flex-1 pt-14 sm:pt-16 lg:pt-24 px-2 sm:px-4 lg:pr-6 pb-16 sm:pb-20 transition-all duration-300 ${sidebarOpen ? 'lg:pl-72' : 'lg:pl-24'}`}>
        <Calendario />
      </div>
      <MenuInferior />
    </div>
  );
}


