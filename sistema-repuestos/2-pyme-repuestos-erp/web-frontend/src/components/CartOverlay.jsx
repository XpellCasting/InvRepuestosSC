import React from 'react';
import { useTicket } from '../context/TicketContext';
import { Plus, Minus, X, PackageOpen, Save, ShoppingCart } from 'lucide-react';

const CartOverlay = () => {
  const {
    ticketNo,
    setTicketNo,
    cart,
    updateCant,
    removeCart,
    isCartOpen,
    closeCart,
    total,
    handleSave,
    saving
  } = useTicket();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={closeCart}
      />

      {/* Side Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 translate-x-0">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-200 bg-[#003366] text-white flex justify-between items-center">
          <div className="flex items-center gap-2 text-xl font-bold">
            <ShoppingCart size={24} />
            <span>Ticket / Boleta</span>
          </div>
          <button onClick={closeCart} className="text-gray-300 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Ticket Number Input */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-600">N° Ticket:</span>
          <input 
            value={ticketNo} 
            onChange={e => setTicketNo(e.target.value)}
            className="w-32 text-right bg-transparent border-b border-gray-300 focus:border-[#003366] outline-none font-mono" 
          />
        </div>

        {/* List of Products */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <PackageOpen size={48} className="mb-2 opacity-50"/>
              <p>Ticket vacío</p>
            </div>
          ) : (
            cart.map(c => (
              <div key={c.producto_id} className="flex flex-col gap-2 pb-4 border-b border-gray-100 last:border-0">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold leading-tight text-gray-800 pr-4">{c.nombre}</h4>
                  <button onClick={() => removeCart(c.producto_id)} className="text-gray-400 hover:text-red-500">
                    <X size={16}/>
                  </button>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <div className="text-[#003366] font-semibold text-sm">
                    ${c.precio_unitario.toLocaleString()} c/u
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded border-gray-300 bg-white shadow-sm">
                      <button onClick={() => updateCant(c.producto_id, -1)} className="px-2 py-1 text-gray-500 hover:text-black transition">
                        <Minus size={14}/>
                      </button>
                      <span className="px-2 text-sm font-bold min-w-[2rem] text-center">{c.cantidad}</span>
                      <button 
                        onClick={() => updateCant(c.producto_id, 1)} 
                        disabled={c.cantidad >= c.stockMax}
                        className="px-2 py-1 text-gray-500 hover:text-black disabled:opacity-30 transition"
                      >
                        <Plus size={14}/>
                      </button>
                    </div>
                    <span className="font-bold text-gray-900 min-w-[4rem] text-right">
                      ${(c.precio_unitario * c.cantidad).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-gray-200 bg-gray-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-500 text-lg">Total a Pagar</span>
            <span className="text-3xl font-black text-[#003366]">${total.toLocaleString()}</span>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={saving || cart.length === 0}
            className="w-full bg-[#28A745] hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center gap-2 transition shadow-md"
          >
            <Save size={20}/> {saving ? 'Generando...' : 'Confirmar Venta'}
          </button>
        </div>

      </div>
    </>
  );
};

export default CartOverlay;
