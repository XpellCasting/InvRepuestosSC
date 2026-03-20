import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReceiptText, CheckCircle, Clock, XCircle, FilePlus, Eye, Trash2 } from 'lucide-react';
import apiClient from '../api/axios';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = () => {
    setLoading(true);
    apiClient.get('/tickets')
      .then(res => setTickets(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      if (confirm(`¿Cambiar estado a ${newStatus}?`)) {
        await apiClient.put(`/tickets/${id}/estado`, { estado: newStatus });
        fetchTickets();
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar este ticket de forma permanente?')) {
      try {
        await apiClient.delete(`/tickets/${id}`);
        fetchTickets();
      } catch (e) {
        alert('Error al eliminar');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#003366]">Tickets y Boletas</h1>
        <button 
          onClick={() => navigate('/tickets/nuevo')}
          className="flex items-center gap-2 bg-[#28A745] hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
        >
          <FilePlus size={20} /> Nuevo Ticket
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Cargando tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <ReceiptText size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-gray-700">No hay tickets registrados</h2>
          <p className="text-gray-500 mt-2">Crea un nuevo ticket para registrar una venta.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden hover:shadow-md transition">
              <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="font-bold text-[#003366] text-lg flex items-center gap-2">
                  <ReceiptText size={20} /> {ticket.numero}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {new Date(ticket.fecha).toLocaleDateString()}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4 flex-1">
                  <div>
                    <span className="text-gray-500 text-sm">Total:</span>
                    <div className="text-2xl font-black text-[#333333]">
                      ${Number(ticket.total).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {ticket.productos.reduce((acc, p) => acc + p.cantidad, 0)} unidades en total
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    {ticket.estado === 'en-espera' && (
                      <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                        <Clock size={16} /> En Espera
                      </span>
                    )}
                    {ticket.estado === 'entregado' && (
                      <span className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                        <CheckCircle size={16} /> Entregado
                      </span>
                    )}
                    {ticket.estado === 'cancelado' && (
                      <span className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                        <XCircle size={16} /> Cancelado
                      </span>
                    )}

                    {ticket.estado === 'en-espera' && (
                      <div className="mt-3 text-xs bg-gray-50 border rounded p-1">
                        Estado: 
                        <select onChange={(e) => { if(e.target.value) handleStatusChange(ticket.id, e.target.value); }} value="" className="ml-1 bg-transparent font-medium text-blue-600 outline-none">
                          <option value="">Cambiar...</option>
                          <option value="entregado">Entregado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 mt-auto">
                  <button 
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className="flex justify-center items-center gap-2 bg-[#003366] hover:bg-[#002244] text-white py-2 rounded-lg font-medium transition text-sm"
                  >
                    <Eye size={16} /> Ver Detalles
                  </button>
                  <button 
                    onClick={() => handleDelete(ticket.id)}
                    className="flex justify-center items-center gap-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 py-2 rounded-lg font-medium transition text-sm"
                  >
                    <Trash2 size={16} /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tickets;
