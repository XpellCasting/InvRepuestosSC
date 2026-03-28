import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAlert } from './AlertContext';

const TicketContext = createContext();

export const useTicket = () => useContext(TicketContext);

export const TicketProvider = ({ children }) => {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const [ticketNo, setTicketNo] = useState(`T-${Date.now().toString().slice(-6)}`);
  const [cart, setCart] = useState([]); // { producto_id, nombre, precio_unitario, stockMax, imagen, cantidad }
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

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
    } else {
      // If it exists, perhaps just increment quantity by 1 if stock allows
      updateCant(prod.id, 1);
    }
    openCart(); // Show cart when item added
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
  
  const clearCart = () => {
    setCart([]);
    setTicketNo(`T-${Date.now().toString().slice(-6)}`);
  };

  const total = cart.reduce((acc, c) => acc + (c.precio_unitario * c.cantidad), 0);

  const handleSave = async () => {
    if (cart.length === 0) return showAlert('Debes agregar productos al ticket', 'warning');
    setSaving(true);
    try {
      const payload = {
        numero: ticketNo,
        fecha: new Date().toISOString().split('T')[0],
        productos: cart.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario
        }))
      };
      const res = await apiClient.post('/tickets', payload);
      
      if (res.data.eliminados && res.data.eliminados.length > 0) {
        showAlert(`¡Aviso!\nEl stock de los siguientes productos llegó a 0 y fueron eliminados del catálogo automáticamente: \n- ${res.data.eliminados.join('\n- ')}`, 'warning');
      }
      clearCart();
      closeCart();
      showAlert('¡Ticket guardado con éxito!', 'success');
      navigate('/tickets');
      // Force a slight delay buffer before navigating could be needed if state takes time? No, it's fine.
    } catch (err) {
      showAlert(err.response?.data?.error || 'Error al guardar el ticket', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <TicketContext.Provider
      value={{
        ticketNo,
        setTicketNo,
        cart,
        addToCart,
        updateCant,
        removeCart,
        clearCart,
        isCartOpen,
        toggleCart,
        openCart,
        closeCart,
        total,
        handleSave,
        saving
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};
