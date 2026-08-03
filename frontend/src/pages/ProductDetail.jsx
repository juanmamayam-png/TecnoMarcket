// Página de detalle de producto — muestra el stock en tiempo real
// (RF-02) refrescándolo periódicamente contra /products/:id/stock, y
// permite agregar al carrito (RF-03) respetando el límite disponible.
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../api/api';
import { formatPrice } from '../components/ProductCard';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    productApi.getById(id).then(setProduct).catch((err) => setError(err.message));
  }, [id]);

  // Refresco periódico del stock (RF-02: "desfase ≤ 1 minuto" respecto
  // al inventario real). Cada 15s es suficiente margen para cumplirlo.
  useEffect(() => {
    const interval = setInterval(() => {
      productApi
        .getById(id)
        .then((data) => setProduct((prev) => (prev ? { ...prev, stock: data.stock } : data)))
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!product) return <p className="loading">Cargando...</p>;

  const outOfStock = product.stock <= 0;

  function handleAdd() {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="page product-detail">
      <button className="link-button" onClick={() => navigate(-1)}>&larr; Volver</button>
      <div className="product-detail__grid">
        <div className="product-detail__image">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} />
          ) : (
            <div className="product-card__placeholder large">{product.name.slice(0, 1)}</div>
          )}
        </div>
        <div className="product-detail__info">
          <span className="product-card__brand">{product.brand}</span>
          <h1>{product.name}</h1>
          <p className="product-detail__description">{product.description}</p>
          <p className="product-card__price large">{formatPrice(product.price)}</p>
          <p className={`product-card__stock ${outOfStock ? 'is-out' : ''}`}>
            {outOfStock ? 'Sin stock disponible' : `${product.stock} unidades disponibles`}
          </p>

          {!outOfStock && (
            <div className="add-to-cart">
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, Number(e.target.value))))}
              />
              <button onClick={handleAdd}>{added ? 'Agregado ✓' : 'Agregar al carrito'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
