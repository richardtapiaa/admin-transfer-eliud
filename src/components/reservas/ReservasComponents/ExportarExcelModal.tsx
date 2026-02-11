import { XMarkIcon, DocumentArrowDownIcon, TableCellsIcon, CheckIcon } from "@heroicons/react/24/outline";
import './ModalCss/Modal.css';

interface ExportarExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExportAll: () => void;
    onSelectMode: () => void;
    totalReservas: number;
}

export default function ExportarExcelModal({
    isOpen,
    onClose,
    onExportAll,
    onSelectMode,
    totalReservas
}: ExportarExcelModalProps) {

    if (!isOpen) return null;

    const handleExportAll = () => {
        onExportAll();
        onClose();
    };

    const handleSelectMode = () => {
        onSelectMode();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-slideUp">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#8BC34A]/10 rounded-lg">
                            <DocumentArrowDownIcon className="w-6 h-6 text-[#8BC34A]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Exportar a Excel</h2>
                            <p className="text-sm text-gray-500">Selecciona cómo deseas exportar las reservas</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Cerrar"
                    >
                        <XMarkIcon className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Opción 1: Exportar todo */}
                    <div
                        onClick={handleExportAll}
                        className="border-2 border-gray-200 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:border-[#8BC34A] hover:bg-[#8BC34A]/5 hover:shadow-md"
                    >
                        <div className="flex items-start gap-4">
                            <div className="mt-1 w-12 h-12 rounded-lg bg-[#8BC34A]/10 flex items-center justify-center flex-shrink-0">
                                <TableCellsIcon className="w-6 h-6 text-[#8BC34A]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Exportar todas las reservas</h3>
                                <p className="text-sm text-gray-600">
                                    Exporta todas las {totalReservas} reservas de la tabla con todos sus datos.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Opción 2: Selección personalizada */}
                    <div
                        onClick={handleSelectMode}
                        className="border-2 border-gray-200 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:border-[#8BC34A] hover:bg-[#8BC34A]/5 hover:shadow-md"
                    >
                        <div className="flex items-start gap-4">
                            <div className="mt-1 w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <CheckIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Seleccionar reservas específicas</h3>
                                <p className="text-sm text-gray-600 mb-2">
                                    Marca las reservas que deseas exportar directamente en la tabla.
                                </p>
                                <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                                    <span>✓</span>
                                    <span>Aparecerán checkboxes en la tabla para seleccionar</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                </div>
            </div>


        </div>
    );
}
