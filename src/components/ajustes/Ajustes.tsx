import MenuInferior from "../ui/MenuInferior";
import Navbar from "../ui/Navbar";


export default function Ajustes() {
  return (
         <div className="min-h-screen bg-[#8BC34A]/19 flex flex-col">
             <Navbar />
             <div className="flex-1 pb-16 sm:pb-20">
                 <h1 className="text-2xl font-bold text-center mt-8">Página de Ajustes</h1>
                 {/* Aquí puedes agregar más contenido relacionado con los ajustes */}
             </div>
             <MenuInferior />
         </div>
     );
 }



