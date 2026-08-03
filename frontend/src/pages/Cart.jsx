// Página de carrito — implementa RF-03: lista los ítems, permite editar
// cantidades o eliminar, y recalcula el total automáticamente (el
// cálculo real vive en CartContext, aquí solo se muestra).
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../components/ProductCard';

export default function Cart() {
  const { items, updateQuantity, removeItem, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="page cart-page">
        <h1>Tu carrito</h1>
        <p className="empty">Tu carrito está vacío.</p>
        <Link to="/" className="button">Ir al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="page cart-page">
      <h1>Tu carrito</h1>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.productId}>
              <td>{item.name}</td>
              <td>{formatPrice(item.price)}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  max={item.stock}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                />
              </td>
              <td>{formatPrice(item.price * item.quantity)}</td>
              <td>
                <button className="link-button" onClick={() => removeItem(item.productId)}>
                  Quitar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cart-summary">
        <span>Total</span>
        <strong>{formatPrice(total)}</strong>
      </div>

      <button
        className="button"
        onClick={() => navigate(user ? '/checkout' : '/login?redirect=/checkout')}
      >
        Continuar a pagar
      </button>
    </div>
  );
}
