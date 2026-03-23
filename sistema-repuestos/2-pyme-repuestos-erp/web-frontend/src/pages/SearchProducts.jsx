import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle, Eye, Edit } from 'lucide-react';
import apiClient from '../api/axios';
import { DistribuidorBadge, getFirstImage } from './Home';

const SearchProducts = () => {
  const [query, setQuery] = useState('');
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProd = async () => {
      setLoading(true);
      try {
        const url = query.trim() ? `/productos/buscar?q=${encodeURIComponent(query)}` : '/productos';
        const res = await apiClient.get(url);
        setProductos(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchProd();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-[#003366]">Buscar Productos</h1>
        
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            placeholder="Buscar por nombre, SKU, marca..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Buscando...</div>
      ) : productos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-12 flex flex-col items-center justify-center text-gray-500">
          <AlertCircle size={48} className="mb-4 text-gray-400" />
          <h3 className="text-xl font-medium">No se encontraron productos</h3>
          <p className="mt-2 text-sm">Intenta con otro término de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productos.map(prod => (
            <div key={prod.id} className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden hover:shadow-md transition flex flex-col">
              <div className="relative h-48 bg-gray-100 flex-shrink-0">
                {getFirstImage(prod.imagen) ? (
                  <img src={getFirstImage(prod.imagen)} alt={prod.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Sin Imagen</div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-bold rounded-lg shadow-sm ${prod.stock === 0 ? 'bg-[#DC3545] text-white' : prod.stock <= 10 ? 'bg-[#F59E0B] text-white' : 'bg-[#28A745] text-white'}`}>
                    Stock: {prod.stock}
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-[#333333] line-clamp-2">{prod.nombre}</h3>
                </div>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {prod.codigo_barras}
                  </span>
                  <DistribuidorBadge nombre={prod.distribuidor_nombre} />
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                  {prod.descripcion}
                </p>
                
                <div className="mt-auto">
                  <div className="text-2xl font-black text-[#003366] mb-4">
                    ${Number(prod.precio).toLocaleString()}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => navigate(`/editar/${prod.id}`)}
                      className="flex items-center justify-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium transition"
                    >
                      <Edit size={16} /> Editar
                    </button>
                    <button 
                      onClick={() => navigate(`/productos/${prod.id}`)}
                      className="flex items-center justify-center gap-1 text-sm bg-[#003366] hover:bg-[#002244] text-white py-2 rounded-lg font-medium transition"
                    >
                      <Eye size={16} /> Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchProducts;
