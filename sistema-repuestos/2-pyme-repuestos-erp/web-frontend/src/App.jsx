import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// We will create these pages next
import Layout from './components/Layout';
import Home from './pages/Home';
import SearchProducts from './pages/SearchProducts';
import ProductDetail from './pages/ProductDetail';
import AddProduct from './pages/AddProduct';
import Tickets from './pages/Tickets';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'buscar', element: <SearchProducts /> },
      { path: 'productos/:id', element: <ProductDetail /> },
      { path: 'agregar', element: <AddProduct /> },
      { path: 'editar/:id', element: <AddProduct /> },
      { path: 'tickets', element: <Tickets /> },
      { path: 'tickets/nuevo', element: <CreateTicket /> },
      { path: 'tickets/editar/:id', element: <CreateTicket /> },
      { path: 'tickets/:id', element: <TicketDetail /> },
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
