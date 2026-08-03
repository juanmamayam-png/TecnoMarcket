import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <header className="navbar">
      <Link to="/" className="brand">TecnoMarket</Link>
      <nav className="nav-links">
        <Link to="/">Catálogo</Link>
        {user && <Link to="/orders">Mis pedidos</Link>}
        {user?.role === 'administrador' && <Link to="/admin">Panel admin</Link>}
        <Link to="/cart" className="cart-link">
          Carrito{cartCount > 0 && <span className="badge">{cartCount}</span>}
        </Link>
        {user ? (
          <>
            <span className="user-chip">{user.name}</span>
            <button
              className="link-button"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Salir
            </button>
          </>
        ) : (
          <Link to="/login">Ingresar</Link>
        )}
      </nav>
    </header>
  );
}
