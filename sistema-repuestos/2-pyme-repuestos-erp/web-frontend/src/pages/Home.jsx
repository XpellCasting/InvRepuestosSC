import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageSearch, PlusCircle, Search } from 'lucide-react';
import apiClient from '../api/axios';
import ProductImage from '../components/ProductImage';

export const DistribuidorBadge = ({ nombre }) => {
  let bgColor = 'bg-gray-100 text-gray-800';
  if (nombre?.includes('1')) bgColor = 'bg-blue-100 text-blue-800';
  else if (nombre?.includes('2')) bgColor = 'bg-cyan-100 text-cyan-800';
  else if (nombre?.toLowerCase().includes('otros')) bgColor = 'bg-purple-100 text-purple-800';

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor}`}>
      {nombre || 'Desconocido'}
    </span>
  );
};

const Home = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get('/productos')
      .then(res => setProductos(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalProductos = productos.length;
  const ultimosProductos = [...productos].slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#003366]">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card */}
        <div 
          onClick={() => navigate('/buscar')}
          className="bg-[#003366] text-white rounded-xl shadow-sm p-6 cursor-pointer hover:bg-[#002244] transition flex flex-col items-center justify-center text-center"
        >
          <PackageSearch size={48} className="mb-2 opacity-80" />
          <h2 className="text-lg font-medium opacity-90">Total de Productos Almacenados</h2>
          <p className="text-4xl font-bold mt-2">{loading ? '...' : totalProductos}</p>
        </div>

        {/* Action: Agregar */}
        <div 
          onClick={() => navigate('/agregar')}
          className="bg-gray-50 text-gray-800 rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:bg-gray-100 transition flex flex-col items-center justify-center text-center"
        >
          <PlusCircle size={48} className="mb-2 text-gray-500" />
          <h2 className="text-2xl font-bold">Agregar Producto</h2>
        </div>

        {/* Action: Buscar */}
        <div 
          onClick={() => navigate('/buscar')}
          className="bg-gray-50 text-gray-800 rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:bg-gray-100 transition flex flex-col items-center justify-center text-center"
        >
          <Search size={48} className="mb-2 text-gray-500" />
          <h2 className="text-2xl font-bold">Buscar Productos</h2>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-[#E5E7EB] bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-[#333333]">Últimos Productos Registrados</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-gray-500">Cargando productos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribuidor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ultimosProductos.map((prod) => (
                  <tr 
                    key={prod.id} 
                    onClick={() => navigate(`/productos/${prod.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden">
                          <ProductImage src={prod.imagen} alt="" className="h-full w-full object-cover" fallbackSize={20} fallbackIcon="package" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{prod.nombre}</div>
                          <div className="text-sm text-gray-500">{prod.codigo_barras}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <DistribuidorBadge nombre={prod.distribuidor_nombre} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${Number(prod.precio).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${prod.stock === 0 ? 'bg-red-100 text-red-800' : prod.stock <= 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {prod.stock} ud.
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
