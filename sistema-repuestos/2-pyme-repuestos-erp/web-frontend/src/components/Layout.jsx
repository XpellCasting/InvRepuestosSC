import { Outlet, Link } from 'react-router-dom';
import { Package, Menu, ShoppingCart } from 'lucide-react';
import { TicketProvider, useTicket } from '../context/TicketContext';
import CartOverlay from './CartOverlay';

const LayoutContent = () => {
  const { cart, toggleCart } = useTicket();
  const totalItems = cart.reduce((acc, c) => acc + c.cantidad, 0);

  return (
    <div className="min-h-screen bg-[#F0F0F0] font-sans text-[#333333]">
      <header className="bg-[#003366] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold hover:text-gray-200">
                <Package size={28} />
                <span>Repuestos Inv</span>
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="hover:text-blue-200 px-3 py-2 rounded-md font-medium">Inicio</Link>
              <Link to="/agregar" className="hover:text-blue-200 px-3 py-2 rounded-md font-medium">Agregar Producto</Link>
              <Link to="/buscar" className="hover:text-blue-200 px-3 py-2 rounded-md font-medium">Buscar Productos</Link>
              <Link to="/tickets" className="hover:text-blue-200 px-3 py-2 rounded-md font-medium">Tickets / Boletas</Link>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <button onClick={toggleCart} className="flex items-center gap-2 text-white hover:text-blue-200 focus:outline-none transition bg-blue-700 px-3 py-1.5 rounded-lg border border-blue-600 shadow-sm">
                <ShoppingCart size={20} />
                <span className="font-bold bg-white text-[#003366] px-2 py-0.5 rounded-full text-xs">{totalItems}</span>
                <span className="hidden lg:inline text-sm font-semibold">Caja / Ticket</span>
              </button>
              <span className="bg-blue-800 px-3 py-1 rounded-full text-sm font-semibold border border-blue-600">
                Administrador
              </span>
            </div>

            {/* Mobile Menu Button & Cart */}
            <div className="md:hidden flex items-center gap-4">
              <button onClick={toggleCart} className="text-white hover:text-gray-200 relative">
                <ShoppingCart size={26} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>
              <button className="text-white hover:text-gray-200 focus:outline-none">
                <Menu size={28} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      
      <CartOverlay />
    </div>
  );
};

const Layout = () => {
  return (
    <TicketProvider>
      <LayoutContent />
    </TicketProvider>
  );
};

export default Layout;
