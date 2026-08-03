// Reportes — implementa RF-09: ventas por rango de fechas y estado
// actual de inventario, con los totales que la Gerencia Comercial/
// Financiera necesita para tomar decisiones.
import { useEffect, useState } from 'react';
import { reportApi } from '../../api/api';
import { formatPrice } from '../../components/ProductCard';

export default function AdminReports() {
  const [range, setRange] = useState({ from: '', to: '' });
  const [sales, setSales] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [error, setError] = useState('');

  function loadSales() {
    reportApi.sales(range).then(setSales).catch((err) => setError(err.message));
  }

  useEffect(loadSales, []); // carga inicial sin filtro de fechas
  useEffect(() => {
    reportApi.inventory().then(setInventory).catch((err) => setError(err.message));
  }, []);

  return (
    <div className="admin-reports">
      {error && <p className="error">{error}</p>}

      <section>
        <h2>Reporte de ventas</h2>
        <div className="filters">
          <label>
            Desde
            <input type="date" value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} />
          </label>
          <label>
            Hasta
            <input type="date" value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} />
          </label>
          <button className="button" onClick={loadSales}>Filtrar</button>
        </div>

        {sales && (
          <>
            <div className="kpi-row">
              <div className="kpi"><span>Pedidos</span><strong>{sales.totalPedidos}</strong></div>
              <div className="kpi"><span>Ventas totales</span><strong>{formatPrice(sales.totalVentas)}</strong></div>
            </div>
            <table className="admin-table">
              <thead>
                <tr><th>Producto</th><th>Unidades vendidas</th><th>Total</th></tr>
              </thead>
              <tbody>
                {Object.entries(sales.porProducto).map(([name, data]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{data.unidades}</td>
                    <td>{formatPrice(data.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      <section>
        <h2>Reporte de inventario</h2>
        {inventory && (
          <>
            <div className="kpi-row">
              <div className="kpi"><span>Valor total del inventario</span><strong>{formatPrice(inventory.valorInventario)}</strong></div>
            </div>
            <table className="admin-table">
              <thead>
                <tr><th>SKU</th><th>Producto</th><th>Stock actual</th></tr>
              </thead>
              <tbody>
                {inventory.productos.map((p) => (
                  <tr key={p.id} className={p.stock <= 5 ? 'low-stock' : ''}>
                    <td>{p.sku}</td>
                    <td>{p.name}</td>
                    <td>{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>Movimientos recientes</h3>
            <table className="admin-table">
              <thead>
                <tr><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Motivo</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                {inventory.movimientosRecientes.map((m) => (
                  <tr key={m.id}>
                    <td>{m.Product?.name}</td>
                    <td>{m.type}</td>
                    <td>{m.quantity}</td>
                    <td>{m.reason}</td>
                    <td>{new Date(m.created_at).toLocaleString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>
    </div>
  );
}
