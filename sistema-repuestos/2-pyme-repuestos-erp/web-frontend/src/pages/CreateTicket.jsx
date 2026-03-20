import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Minus, X, PackageOpen, Save } from 'lucide-react';
import apiClient from '../api/axios';

const CreateTicket = () => {
  const navigate = useNavigate();
  const [ticketNo, setTicketNo] = useState(`T-${Date.now().toString().slice(-6)}`);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]); // { product_id, dbProd_id, nombre, precio, maxStock, image, cantidad }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (search.length > 2) {
      apiClient.get(`/productos/buscar?q=${search}`)
        .then(res => setSearchResults(res.data.filter(p => p.stock > 0)))
        .catch(err => console.error(err));
    } else {
      setSearchResults([]);
    }
  }, [search]);

  const addToCart = (prod) => {
    const exist = cart.find(c => c.producto_id === prod.id);
    if (!exist) {
      setCart([...cart, {
        producto_id: prod.id,
        nombre: prod.nombre,
        precio_unitario: Number(prod.precio),
        stockMax: prod.stock,
        imagen: prod.imagen,
        cantidad: 1
      }]);
    }
    setSearch('');
    setSearchResults([]);
  };

  const updateCant = (id, delta) => {
    setCart(cart.map(c => {
      if (c.producto_id === id) {
        const newC = parseInt(c.cantidad) + delta;
        if (newC > 0 && newC <= c.stockMax) return { ...c, cantidad: newC };
      }
      return c;
    }));
  };

  const removeCart = (id) => setCart(cart.filter(c => c.producto_id !== id));

  const total = cart.reduce((acc, c) => acc + (c.precio_unitario * c.cantidad), 0);

  const handleSave = async () => {
    if (cart.length === 0) return alert('Debes agregar productos al ticket');
    setSaving(true);
    try {
      const payload = {
        numero: ticketNo,
        fecha: new Date().toISOString().split('T')[0],
        productos: cart
      };
      const res = await apiClient.post('/tickets', payload);
      
      if (res.data.eliminados && res.data.eliminados.length > 0) {
        alert(`¡Aviso!\nEl stock de los siguientes productos llegó a 0 y fueron eliminados del catálogo automáticamente: \n- ${res.data.eliminados.join('\n- ')}`);
      }
      navigate('/tickets');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar el ticket');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
      
      {/* Left Column: POS Search */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-[#003366] mb-4">Buscar Productos (Stock {'>'} 0)</h2>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-[#D1D5DB] rounded-lg focus:ring-[#003366] text-lg"
            placeholder="Buscar por código o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {searchResults.map(p => (
              <div 
                key={p.id} 
                onClick={() => addToCart(p)}
                className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-3 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition"
              >
                <div className="h-12 w-12 bg-white flex-shrink-0 border rounded">
                  {p.imagen ? <img src={p.imagen} className="h-full w-full object-cover"/> : <PackageOpen className="w-full h-full p-2 text-gray-300"/>}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 line-clamp-1">{p.nombre}</h4>
                  <p className="text-sm text-gray-500 font-mono">{p.codigo_barras}</p>
                </div>
                <div className="text-right">
                  <div className="font-black text-[#003366]">${Number(p.precio).toLocaleString()}</div>
                  <div className="text-xs font-bold text-green-600">Stock: {p.stock}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Ticket Summary */}
      <div className="lg:w-96 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-150px)]">
        <div className="p-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-[#333333] flex justify-between">
            <span>Ticket</span>
            <input 
              value={ticketNo} 
              onChange={e => setTicketNo(e.target.value)}
              className="w-24 text-right bg-transparent border-b border-gray-300 focus:border-[#003366] outline-none" 
            />
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <PackageOpen size={48} className="mb-2 opacity-50"/>
              <p>Ticket vacío</p>
            </div>
          ) : (
            cart.map(c => (
              <div key={c.producto_id} className="flex justify-between items-start pb-4 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <h4 className="text-sm font-bold leading-tight mb-1 text-gray-800">{c.nombre}</h4>
                  <div className="text-[#003366] font-semibold text-sm">${c.precio_unitario.toLocaleString()} c/u</div>
                </div>
                
                <div className="flex flex-col items-end gap-2 ml-4">
                  <div className="flex items-center border rounded border-gray-300 bg-white">
                    <button onClick={() => updateCant(c.producto_id, -1)} className="px-2 py-1 text-gray-500 hover:text-black">
                      <Minus size={14}/>
                    </button>
                    <span className="px-2 text-sm font-bold min-w-[2rem] text-center">{c.cantidad}</span>
                    <button 
                      onClick={() => updateCant(c.producto_id, 1)} 
                      disabled={c.cantidad >= c.stockMax}
                      className="px-2 py-1 text-gray-500 hover:text-black disabled:opacity-30"
                    >
                      <Plus size={14}/>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">${(c.precio_unitario * c.cantidad).toLocaleString()}</span>
                    <button onClick={() => removeCart(c.producto_id)} className="text-red-400 hover:text-red-600">
                      <X size={16}/>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-500 text-lg">Total a Pagar</span>
            <span className="text-3xl font-black text-[#003366]">${total.toLocaleString()}</span>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={saving || cart.length === 0}
            className="w-full bg-[#28A745] hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center gap-2 transition"
          >
            <Save size={20}/> {saving ? 'Generando...' : 'Confirmar Venta'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default CreateTicket;
