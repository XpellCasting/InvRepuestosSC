import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, AlertTriangle } from 'lucide-react';
import apiClient from '../api/axios';
import { DistribuidorBadge } from './Home';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prod, setProd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get(`/productos/${id}`)
      .then(res => setProd(res.data))
      .catch(err => {
        console.error(err);
        setError('No se pudo cargar el producto.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-10">Cargando detalles...</div>;
  if (error || !prod) return <div className="text-center py-10 text-red-500">{error}</div>;

  const componentesArr = prod.componentes ? prod.componentes.split(',').map(s => s.trim()) : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600 hover:text-[#003366] font-medium"
        >
          <ArrowLeft size={20} /> Volver
        </button>
        <button 
          onClick={() => navigate(`/editar/${prod.id}`)}
          className="flex items-center gap-2 bg-[#28A745] hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
        >
          <Edit size={18} /> Editar Producto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Image */}
          <div className="bg-[#F9FAFB] border-b md:border-b-0 md:border-r border-[#E5E7EB] p-8 flex items-center justify-center group overflow-hidden cursor-zoom-in">
            {prod.imagen ? (
              <img 
                src={prod.imagen} 
                alt={prod.nombre} 
                className="max-h-96 object-contain transform group-hover:scale-110 transition-transform duration-300" 
              />
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <AlertTriangle size={64} className="mb-2" />
                <span>Imagen no disponible</span>
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-[#333333] leading-tight">{prod.nombre}</h1>
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-md border border-gray-200">
                SKU: {prod.codigo_barras}
              </span>
              <DistribuidorBadge nombre={prod.distribuidor_nombre} />
              <span className={`px-2 py-1 text-xs font-bold rounded-md ${prod.stock === 0 ? 'bg-[#DC3545] text-white' : prod.stock <= 10 ? 'bg-[#F59E0B] text-white' : 'bg-[#28A745] text-white'}`}>
                {prod.stock} en stock
              </span>
            </div>

            <div className="mb-8">
              <span className="text-4xl font-black text-[#003366]">
                ${Number(prod.precio).toLocaleString()}
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Descripción Técnica</h3>
                <p className="text-gray-700 leading-relaxed">{prod.descripcion || 'Sin descripción.'}</p>
              </div>

              {componentesArr.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Componentes en Kit</h3>
                  <div className="flex flex-wrap gap-2">
                    {componentesArr.map((comp, idx) => (
                      <span key={idx} className="bg-blue-50 text-[#003366] border border-blue-100 px-3 py-1 rounded-full text-sm">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compatibilidad Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB] bg-gray-50">
          <h3 className="text-lg font-semibold text-[#333333]">Compatibilidad Vehicular</h3>
        </div>
        <div className="overflow-x-auto">
          {prod.compatibilidad && prod.compatibilidad.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#003366] text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Marca</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Modelo</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Año</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Motor</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prod.compatibilidad.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{c.marca}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{c.modelo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{c.anio_desde} - {c.anio_hasta}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{c.motor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">No hay información de compatibilidad registrada.</div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProductDetail;
