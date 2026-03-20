import { Outlet, Link } from 'react-router-dom';
import { Package, Menu } from 'lucide-react';

const Layout = () => {
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
              <span className="bg-blue-800 px-3 py-1 rounded-full text-sm font-semibold border border-blue-600">
                Administrador
              </span>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
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
    </div>
  );
};

export default Layout;
