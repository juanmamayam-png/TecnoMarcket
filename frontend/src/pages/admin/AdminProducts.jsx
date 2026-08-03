// Gestión de productos — implementa RF-06: crear/editar productos y
// ajustar inventario manualmente (con motivo obligatorio, para
// trazabilidad — ver InventoryMovement en el backend).
import { useEffect, useState } from 'react';
import { productApi } from '../../api/api';
import { formatPrice } from '../../components/ProductCard';

const emptyForm = { sku: '', name: '', description: '', brand: '', price: '', stock: '', categoryId: '', imageUrl: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [stockAdjust, setStockAdjust] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function reload() {
    productApi.list().then(setProducts).catch((err) => setError(err.message));
    productApi.categories().then(setCategories).catch(() => {});
  }

  useEffect(reload, []);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (editingId) {
        await productApi.update(editingId, {
          name: form.name,
          description: form.description,
          brand: form.brand,
          price: Number(form.price),
          categoryId: form.categoryId,
          imageUrl: form.imageUrl,
        });
        setMessage('Producto actualizado.');
      } else {
        await productApi.create({
          sku: form.sku,
          name: form.name,
          description: form.description,
          brand: form.brand,
          price: Number(form.price),
          stock: Number(form.stock) || 0,
          categoryId: form.categoryId,
          imageUrl: form.imageUrl,
        });
        setMessage('Producto creado.');
      }
      setForm(emptyForm);
      setEditingId(null);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      brand: product.brand || '',
      price: product.price,
      stock: product.stock,
      categoryId: product.category_id || product.Category?.id || '',
      imageUrl: product.image_url || '',
    });
  }

  async function handleDeactivate(id) {
    if (!confirm('¿Desactivar este producto? Dejará de verse en el catálogo.')) return;
    await productApi.remove(id);
    reload();
  }

  async function handleStockAdjust(id) {
    const { quantity, reason } = stockAdjust[id] || {};
    if (!quantity || !reason) {
      setError('Indica cantidad y motivo para ajustar el inventario.');
      return;
    }
    try {
      await productApi.adjustStock(id, { quantity: Number(quantity), reason });
      setStockAdjust((prev) => ({ ...prev, [id]: {} }));
      setMessage('Inventario ajustado.');
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-products">
      <form onSubmit={handleSubmit} className="admin-form">
        <h2>{editingId ? 'Editar producto' : 'Nuevo producto'}</h2>
        <div className="form-grid">
          <label>
            SKU
            <input required disabled={!!editingId} value={form.sku} onChange={update('sku')} />
          </label>
          <label>
            Nombre
            <input required value={form.name} onChange={update('name')} />
          </label>
          <label>
            Marca
            <input value={form.brand} onChange={update('brand')} />
          </label>
          <label>
            Precio
            <input required type="number" min="0" value={form.price} onChange={update('price')} />
          </label>
          {!editingId && (
            <label>
              Stock inicial
              <input type="number" min="0" value={form.stock} onChange={update('stock')} />
            </label>
          )}
          <label>
            Categoría
            <select required value={form.categoryId} onChange={update('categoryId')}>
              <option value="">Selecciona...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label>
            URL de imagen
            <input value={form.imageUrl} onChange={update('imageUrl')} />
          </label>
          <label className="span-2">
            Descripción
            <textarea value={form.description} onChange={update('description')} />
          </label>
        </div>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <div className="form-actions">
          <button className="button" type="submit">{editingId ? 'Guardar cambios' : 'Crear producto'}</button>
          {editingId && (
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      <h2>Productos</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Ajustar inventario</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.sku}</td>
              <td>{p.name}</td>
              <td>{formatPrice(p.price)}</td>
              <td>{p.stock}</td>
              <td>
                <div className="stock-adjust">
                  <input
                    type="number"
                    placeholder="+/-"
                    value={stockAdjust[p.id]?.quantity || ''}
                    onChange={(e) =>
                      setStockAdjust((prev) => ({ ...prev, [p.id]: { ...prev[p.id], quantity: e.target.value } }))
                    }
                  />
                  <input
                    type="text"
                    placeholder="Motivo"
                    value={stockAdjust[p.id]?.reason || ''}
                    onChange={(e) =>
                      setStockAdjust((prev) => ({ ...prev, [p.id]: { ...prev[p.id], reason: e.target.value } }))
                    }
                  />
                  <button className="link-button" onClick={() => handleStockAdjust(p.id)}>Aplicar</button>
                </div>
              </td>
              <td>
                <button className="link-button" onClick={() => startEdit(p)}>Editar</button>
                <button className="link-button danger" onClick={() => handleDeactivate(p.id)}>Desactivar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
