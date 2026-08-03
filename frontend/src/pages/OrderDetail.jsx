// Detalle de pedido — implementa el criterio de aceptación de RF-08:
// "el cliente ve el estado actualizado de su pedido sin necesidad de
// contactar soporte". Muestra una línea de tiempo del ciclo de vida del
// pedido y, si ya está pagado, el enlace a su factura electrónica
// (RF-05). Si el usuario es administrador/soporte, además puede avanzar
// el estado del pedido manualmente (dispara la notificación de RF-07).
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { orderApi, invoiceApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../components/ProductCard';
import { STATUS_LABELS } from './Orders';

const TIMELINE = ['pagado', 'en_preparacion', 'enviado', 'entregado'];
const NEXT_STATUS = {
  pagado: 'en_preparacion',
  en_preparacion: 'enviado',
  enviado: 'entregado',
};

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  function loadOrder() {
    orderApi.getById(id).then(setOrder).catch((err) => setError(err.message));
  }

  useEffect(loadOrder, [id]);

  useEffect(() => {
    if (order && ['pagado', 'en_preparacion', 'enviado', 'entregado'].includes(order.status)) {
      invoiceApi.getByOrderId(id).then(setInvoice).catch(() => {});
    }
  }, [order, id]);

  async function advanceStatus() {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setUpdating(true);
    try {
      await orderApi.updateStatus(id, next);
      loadOrder();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (error) return <p className="error">{error}</p>;
  if (!order) return <p className="loading">Cargando...</p>;

  const currentIndex = TIMELINE.indexOf(order.status);
  const isStaff = user?.role === 'administrador' || user?.role === 'soporte';

  return (
    <div className="page order-detail">
      <h1>Pedido #{order.id.slice(0, 8)}</h1>
      <p className="order-detail__address">Envío a: {order.shipping_address}</p>

      {order.status === 'cancelado' ? (
        <p className="error">Este pedido fue cancelado.</p>
      ) : (
        <ol className="timeline">
          {TIMELINE.map((step, index) => (
            <li key={step} className={index <= currentIndex ? 'is-done' : ''}>
              {STATUS_LABELS[step]}
            </li>
          ))}
        </ol>
      )}

      {isStaff && NEXT_STATUS[order.status] && (
        <button className="button" onClick={advanceStatus} disabled={updating}>
          {updating ? 'Actualizando...' : `Marcar como "${STATUS_LABELS[NEXT_STATUS[order.status]]}"`}
        </button>
      )}

      <h2>Productos</h2>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item) => (
            <tr key={item.id}>
              <td>{item.Product?.name || item.product_id}</td>
              <td>{item.quantity}</td>
              <td>{formatPrice(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cart-summary">
        <span>Total</span>
        <strong>{formatPrice(order.total)}</strong>
      </div>

      {invoice && (
        <div className="invoice-box">
          <h2>Factura electrónica</h2>
          <p>N.º {invoice.invoice_number}</p>
          <p>Fecha de emisión: {new Date(invoice.issue_date).toLocaleDateString('es-CO')}</p>
          <p>Total facturado: {formatPrice(invoice.total)}</p>
        </div>
      )}
    </div>
  );
}
