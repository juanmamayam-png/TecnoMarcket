// Página de checkout — implementa RF-04: captura dirección de envío y
// medio de pago, envía el carrito al backend (que recalcula el total y
// cobra vía paymentService) y muestra el resultado. Si el pago es
// aprobado, limpia el carrito y redirige al detalle del pedido, donde
// ya está disponible la factura (RF-05).
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderApi } from '../api/api';
import { formatPrice } from '../components/ProductCard';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('tarjeta');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await orderApi.checkout({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress,
        paymentMethod,
      });

      if (!result.payment.approved) {
        setError(`Pago rechazado: ${result.payment.message}`);
        setLoading(false);
        return;
      }

      clearCart();
      navigate(`/orders/${result.order.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="page checkout-page">
      <h1>Finalizar compra</h1>

      <div className="checkout-grid">
        <form onSubmit={handleSubmit} className="checkout-form">
          <label>
            Dirección de envío
            <textarea
              required
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Calle, número, ciudad, referencia"
            />
          </label>

          <fieldset>
            <legend>Medio de pago</legend>
            <label className="radio">
              <input
                type="radio"
                name="paymentMethod"
                value="tarjeta"
                checked={paymentMethod === 'tarjeta'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Tarjeta de crédito/débito
            </label>
            <label className="radio">
              <input
                type="radio"
                name="paymentMethod"
                value="pse"
                checked={paymentMethod === 'pse'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              PSE
            </label>
          </fieldset>

          {error && <p className="error">{error}</p>}

          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Procesando pago...' : `Pagar ${formatPrice(total)}`}
          </button>
        </form>

        <aside className="order-summary">
          <h2>Resumen del pedido</h2>
          <ul>
            {items.map((item) => (
              <li key={item.productId}>
                <span>{item.name} × {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="order-summary__total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}
