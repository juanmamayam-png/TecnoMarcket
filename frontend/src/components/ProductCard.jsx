import { Link } from 'react-router-dom';

const formatPrice = (value) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

export default function ProductCard({ product }) {
  const outOfStock = product.stock <= 0;

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card__image">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <div className="product-card__placeholder">{product.name.slice(0, 1)}</div>
        )}
      </div>
      <div className="product-card__body">
        <span className="product-card__brand">{product.brand}</span>
        <h3>{product.name}</h3>
        <p className="product-card__price">{formatPrice(product.price)}</p>
        <p className={`product-card__stock ${outOfStock ? 'is-out' : ''}`}>
          {outOfStock ? 'Sin stock' : `${product.stock} disponibles`}
        </p>
      </div>
    </Link>
  );
}

export { formatPrice };
