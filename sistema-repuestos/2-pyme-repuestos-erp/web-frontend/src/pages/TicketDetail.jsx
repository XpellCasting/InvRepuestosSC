import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, Receipt } from 'lucide-react';
import apiClient from '../api/axios';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/tickets/${id}`)
      .then(res => setTicket(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-10">Cargando recibo...</div>;
  if (!ticket) return <div className="text-center py-10 text-red-500">Ticket no encontrado</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 print:m-0 print:p-0">
      
      {/* Non-printable controls */}
      <div className="flex justify-between items-center print:hidden">
        <button 
          onClick={() => navigate('/tickets')}
          className="flex items-center gap-1 text-gray-600 hover:text-[#003366] font-medium"
        >
          <ArrowLeft size={20} /> Volver a Tickets
        </button>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-[#003366] hover:bg-[#002244] text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
        >
          <Printer size={18} /> Imprimir Recibo
        </button>
      </div>

      {ticket.estado !== 'en-espera' && (
        <div className="bg-gray-100 border-l-4 border-gray-500 p-4 text-gray-700 print:hidden">
          Este ticket ya se encuentra <strong>{ticket.estado}</strong> y no se admiten modificaciones.
        </div>
      )}

      {/* Printable Receipt Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 print:shadow-none print:border-none print:p-0">
        
        <div className="border-b-2 border-dashed border-gray-300 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 text-[#003366] mb-2">
                <Receipt size={32} />
                <h1 className="text-2xl font-black tracking-tight">PyME Repuestos</h1>
              </div>
              <p className="text-sm text-gray-500">Av. Siempre Viva 123, Springfield</p>
              <p className="text-sm text-gray-500">Tel: +1 555-0198</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-800">TICKET VENTA</h2>
              <p className="text-lg font-mono text-gray-600 mt-1">Nº {ticket.numero}</p>
              <p className="text-sm text-gray-500 mt-2">Fecha: {new Date(ticket.fecha).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <table className="w-full mb-8 text-sm">
          <thead>
            <tr className="border-b border-gray-300 text-gray-600 text-left">
              <th className="py-2">CANT</th>
              <th className="py-2 pl-2">DESCRIPCIÓN</th>
              <th className="py-2 text-right">P. UNIT</th>
              <th className="py-2 text-right">IMPORTE</th>
            </tr>
          </thead>
          <tbody>
            {ticket.productos.map(p => (
              <tr key={p.producto_id} className="border-b border-gray-100">
                <td className="py-3 font-semibold w-12">{p.cantidad}</td>
                <td className="py-3 pl-2">
                  <div className="font-medium text-gray-900">{p.nombre}</div>
                  <div className="text-xs text-gray-500">{p.codigo_barras}</div>
                </td>
                <td className="py-3 text-right tabular-nums">${Number(p.precio_unitario).toLocaleString()}</td>
                <td className="py-3 text-right font-semibold tabular-nums">
                  ${(p.cantidad * p.precio_unitario).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end pt-4 border-t-2 border-gray-800">
          <div className="text-right">
            <span className="text-lg text-gray-600 mr-4 uppercase tracking-widest font-semibold">Total Neto</span>
            <span className="text-3xl font-black text-[#003366] tabular-nums">${Number(ticket.total).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="mt-12 text-center text-sm text-gray-500 print:text-black">
          <p>¡Gracias por su compra!</p>
          <p className="mt-1">Conserve este ticket para devoluciones o garantías dentro de los 30 días.</p>
        </div>

      </div>
    </div>
  );
};

export default TicketDetail;
