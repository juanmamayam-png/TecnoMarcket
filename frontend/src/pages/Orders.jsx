// Lista de pedidos del cliente autenticado — punto de entrada de RF-08
// (seguimiento). El detalle y la línea de tiempo de estado están en
// OrderDetail.jsx.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/api';
import { formatPrice } from '../components/ProductCard';

const STATUS_LABELS = {
  pendiente_pago: 'Pendiente de pago',
  pagado: 'Pagado',
  en_preparacion: 'En preparación',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    orderApi.list().then(setOrders).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!orders) return <p className="loading">Cargando pedidos...</p>;
  if (orders.length === 0) return <p className="empty">Aún no tienes pedidos.</p>;

  return (
    <div className="page orders-page">
      <h1>Mis pedidos</h1>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id.slice(0, 8)}</td>
              <td>{new Date(order.created_at).toLocaleDateString('es-CO')}</td>
              <td>
                <span className={`status-pill status-${order.status}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </td>
              <td>{formatPrice(order.total)}</td>
              <td>
                <Link to={`/orders/${order.id}`}>Ver detalle</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { STATUS_LABELS };
