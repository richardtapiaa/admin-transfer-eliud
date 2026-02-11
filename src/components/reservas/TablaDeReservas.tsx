import { useState, useEffect } from "react";
import Navbar from "../ui/Navbar";
import api from "../../api/axios";
import * as XLSX from 'xlsx';



import ExportarExcelModal from "./ReservasComponents/ExportarExcelModal";




type Reservation = {
    id: string;
    fechaHoraServicio: string
    nombre: string;
    destino: string;
    lugarRecogida: string;
    vuelo?: string;
    cantidadPersonas: number;
    monto?: number;
    comision?: number;
    estado: string;
    chofer?: string;
    telefono: string;
    mensaje?: string;
};





function formatCurrency(v: number | undefined | null) {
    if (v === undefined || v === null) return "-";
    return Number(v).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

import { PencilIcon, CheckIcon, XMarkIcon, DocumentArrowDownIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";



export default function TablaDeReservas() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [reservas, setReservas] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedReservas, setSelectedReservas] = useState<string[]>([]);

    // Estado para el modal de mensaje
    const [mensajeModalOpen, setMensajeModalOpen] = useState(false);
    const [mensajeActual, setMensajeActual] = useState<string>("");

    // Estado para la edición
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<Reservation>>({});

    useEffect(() => {
        fetchReservas();
    }, []);

    const fetchReservas = async () => {
        try {
            const { data } = await api.get('/reservas');
            setReservas(data);
        } catch (error) {
            console.error("Error fetching reservas", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (reserva: Reservation) => {
        setEditingId(reserva.id);
        setEditFormData({
            monto: reserva.monto,
            comision: reserva.comision,
            chofer: reserva.chofer,
            vuelo: reserva.vuelo
        });
    };

    const handleCancelClick = () => {
        setEditingId(null);
        setEditFormData({});
    };

    const handleSaveClick = async (id: string) => {
        try {
            // Optimistic update (optional) or wait for serve
            await api.patch(`/reservas/${id}`, editFormData);

            // Actualizar estado local
            setReservas(reservas.map(r => (r.id === id ? { ...r, ...editFormData } : r)));
            setEditingId(null);
            setEditFormData({});
        } catch (error) {
            console.error("Error updating reserva", error);
            alert("Error al guardar cambios"); // Simple feedback
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: name === 'monto' || name === 'comision' ? parseFloat(value) : value
        });
    };

    const exportToExcel = (selectedIds?: string[]) => {
        // Filtrar las reservas si se seleccionaron IDs específicos
        const reservasToExport = selectedIds && selectedIds.length > 0
            ? reservas.filter(r => selectedIds.includes(r.id))
            : reservas;

        // Preparar los datos para exportar
        const dataToExport = reservasToExport.map(r => {
            const fechaObj = new Date(r.fechaHoraServicio);
            const fecha = fechaObj.toLocaleDateString();
            const hora = fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return {
                'Fecha': fecha,
                'Hora': hora,
                'Cliente': r.nombre,
                'Teléfono': r.telefono,
                'Destino': r.destino,
                'Vuelo': r.vuelo || '-',
                'Pasajeros': r.cantidadPersonas,
                'Monto': r.monto || 0,
                'Comisión': r.comision || 0,
                'Estado': r.estado,
                'Chofer': r.chofer || '-'
            };
        });

        // Crear una hoja de trabajo
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);

        // Crear un libro de trabajo
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reservas");

        // Generar el archivo Excel
        const fileName = `Reservas_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const handleExportAll = () => {
        exportToExcel();
    };

    const handleSelectMode = () => {
        setSelectionMode(true);
        setSelectedReservas([]);
    };

    const handleCancelSelection = () => {
        setSelectionMode(false);
        setSelectedReservas([]);
    };

    const handleToggleReserva = (id: string) => {
        if (selectedReservas.includes(id)) {
            setSelectedReservas(selectedReservas.filter(rId => rId !== id));
        } else {
            setSelectedReservas([...selectedReservas, id]);
        }
    };

    const handleToggleAll = () => {
        if (selectedReservas.length === reservas.length) {
            setSelectedReservas([]);
        } else {
            setSelectedReservas(reservas.map(r => r.id));
        }
    };

    const handleConfirmExport = () => {
        if (selectedReservas.length > 0) {
            exportToExcel(selectedReservas);
            handleCancelSelection();
        }
    };







    return (
        <div className="min-h-screen bg-[#8BC34A]/10 flex flex-col">
            <Navbar externalSidebarOpen={sidebarOpen} setExternalSidebarOpen={setSidebarOpen} />
            <main className={`flex-1 p-6 lg:p-8 pt-24 lg:pt-28 transition-all duration-300 ${sidebarOpen ? 'lg:pl-80' : 'lg:pl-32'}`}>
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-800">Tabla de Reservas</h1>

                    {selectionMode ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-600">
                                {selectedReservas.length} seleccionada{selectedReservas.length !== 1 ? 's' : ''}
                            </span>
                            <button
                                onClick={handleCancelSelection}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmExport}
                                disabled={selectedReservas.length === 0}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#8BC34A] text-white rounded-lg hover:bg-[#7CB342] transition-colors shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8BC34A]"
                            >
                                <DocumentArrowDownIcon className="w-5 h-5" />
                                <span>Exportar {selectedReservas.length > 0 && `(${selectedReservas.length})`}</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#8BC34A] text-white rounded-lg hover:bg-[#7CB342] transition-colors shadow-md hover:shadow-lg font-medium"
                            title="Exportar a Excel"
                        >
                            <DocumentArrowDownIcon className="w-5 h-5" />
                            <span>Exportar a Excel</span>
                        </button>
                    )}
                </div>

                <style>{`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }
                    
                    @keyframes scaleIn {
                        from {
                            opacity: 0;
                            transform: scale(0.9);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                `}</style>

                <div className="overflow-x-auto bg-white rounded-lg shadow-sm min-h-[400px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BC34A]"></div>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 table-auto">
                            <thead className="bg-gray-50">
                                <tr>
                                    {selectionMode && (
                                        <th className="px-4 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedReservas.length === reservas.length && reservas.length > 0}
                                                onChange={handleToggleAll}
                                                className="w-4 h-4 text-[#8BC34A] rounded border-gray-300 focus:ring-[#8BC34A] focus:ring-2 cursor-pointer"
                                            />
                                        </th>
                                    )}
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Fecha</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Cliente</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Recogida</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Destino</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Vuelo</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Pasajeros</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Hora</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Monto</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Comisión</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Chofer</th>
                                    {!selectionMode && (
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Acciones</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {reservas.map((r) => {
                                    const isEditing = editingId === r.id;
                                    const fechaObj = new Date(r.fechaHoraServicio);
                                    const fecha = fechaObj.toLocaleDateString('es-CR', { timeZone: 'America/Costa_Rica' });
                                    const hora = fechaObj.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Costa_Rica' });

                                    return (
                                        <tr key={r.id} className="hover:bg-gray-50">
                                            {selectionMode && (
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedReservas.includes(r.id)}
                                                        onChange={() => handleToggleReserva(r.id)}
                                                        className="w-4 h-4 text-[#8BC34A] rounded border-gray-300 focus:ring-[#8BC34A] focus:ring-2 cursor-pointer"
                                                    />
                                                </td>
                                            )}
                                            <td className="px-4 py-2 text-sm text-gray-700">{fecha}</td>
                                            <td className="px-4 py-2 text-sm text-gray-700 font-medium">{r.nombre}</td>
                                            <td className="px-4 py-2 text-sm text-gray-700">{r.lugarRecogida}</td>
                                            <td className="px-4 py-2 text-sm text-gray-700">{r.destino}</td>

                                            {/* Vuelo Editable */}
                                            <td className="px-4 py-2 text-sm text-gray-700">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="vuelo"
                                                        value={editFormData.vuelo || ''}
                                                        onChange={handleInputChange}
                                                        className="w-20 border border-gray-300 rounded px-1 py-0.5 text-xs"
                                                    />
                                                ) : (r.vuelo || '-')}
                                            </td>

                                            <td className="px-4 py-2 text-sm text-gray-700">{r.cantidadPersonas}</td>
                                            <td className="px-4 py-2 text-sm text-gray-700">{hora}</td>

                                            {/* Monto Editable */}
                                            <td className="px-4 py-2 text-sm text-gray-700">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        name="monto"
                                                        value={editFormData.monto || ''}
                                                        onChange={handleInputChange}
                                                        className="w-20 border border-gray-300 rounded px-1 py-0.5 text-xs"
                                                        step="0.01"
                                                    />
                                                ) : formatCurrency(r.monto)}
                                            </td>

                                            {/* Comision Editable */}
                                            <td className="px-4 py-2 text-sm text-gray-700">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        name="comision"
                                                        value={editFormData.comision || ''}
                                                        onChange={handleInputChange}
                                                        className="w-20 border border-gray-300 rounded px-1 py-0.5 text-xs"
                                                        step="0.01"
                                                    />
                                                ) : formatCurrency(r.comision)}
                                            </td>

                                            {/* Chofer Editable */}
                                            <td className="px-4 py-2 text-sm text-gray-700">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="chofer"
                                                        value={editFormData.chofer || ''}
                                                        onChange={handleInputChange}
                                                        className="w-24 border border-gray-300 rounded px-1 py-0.5 text-xs"
                                                    />
                                                ) : (r.chofer || '-')}
                                            </td>

                                            {/* Acciones */}
                                            {!selectionMode && (
                                                <td className="px-4 py-2 text-sm text-right">
                                                    {isEditing ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => handleSaveClick(r.id)} className="text-green-600 hover:text-green-800 p-1" title="Guardar">
                                                                <CheckIcon className="w-5 h-5" />
                                                            </button>
                                                            <button onClick={handleCancelClick} className="text-red-600 hover:text-red-800 p-1" title="Cancelar">
                                                                <XMarkIcon className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-2">
                                                            {r.mensaje && (
                                                                <button
                                                                    onClick={() => {
                                                                        setMensajeActual(r.mensaje || "");
                                                                        setMensajeModalOpen(true);
                                                                    }}
                                                                    className="text-blue-400 hover:text-blue-600 p-1"
                                                                    title="Ver mensaje"
                                                                >
                                                                    <ChatBubbleLeftIcon className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                            <button onClick={() => handleEditClick(r)} className="text-gray-400 hover:text-[#8BC34A] p-1" title="Editar">
                                                                <PencilIcon className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {/* Modal de exportación */}
            <ExportarExcelModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onExportAll={handleExportAll}
                onSelectMode={handleSelectMode}
                totalReservas={reservas.length}
            />

            {/* Modal de mensaje adicional */}
            {mensajeModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
                    style={{ animation: 'fadeIn 0.3s ease-out' }}
                    onClick={() => setMensajeModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl p-6 w-11/12 max-w-3xl shadow-2xl transform transition-all duration-300 flex flex-col max-h-[85vh]"
                        style={{ animation: 'scaleIn 0.3s ease-out' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Información Adicional</h3>
                            <button
                                onClick={() => setMensajeModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all duration-200"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 overflow-y-auto flex-1 border border-gray-100">
                            <p className="text-gray-700 whitespace-pre-wrap text-base leading-relaxed break-words">
                                {mensajeActual}
                            </p>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setMensajeModalOpen(false)}
                                className="px-4 py-2 bg-[#8BC34A] text-white rounded-lg hover:bg-[#7CB342] transition-all duration-200"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


