// Página de catálogo — implementa RF-01 (búsqueda y filtros por
// categoría, marca y precio). El criterio de aceptación pide que el
// usuario encuentre un producto en ≤ 3 clics: la búsqueda por texto y
// los tres filtros están todos visibles en la misma pantalla, sin pasos
// intermedios.
import { useEffect, useMemo, useState } from 'react';
import { productApi } from '../api/api';
import ProductCard from '../components/ProductCard';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: '', categoryId: '', brand: '', minPrice: '', maxPrice: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    productApi.categories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      productApi
        .list(filters)
        .then(setProducts)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 250); // pequeño debounce para no disparar una petición por cada tecla
    return () => clearTimeout(timeout);
  }, [filters]);

  // Marcas disponibles derivadas del catálogo cargado, para poblar el filtro.
  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand).filter(Boolean))],
    [products]
  );

  return (
    <div className="page catalog">
      <h1>Catálogo de productos</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <select
          value={filters.categoryId}
          onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value }))}
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={filters.brand} onChange={(e) => setFilters((f) => ({ ...f, brand: e.target.value }))}>
          <option value="">Todas las marcas</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Precio mín."
          value={filters.minPrice}
          onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
        />
        <input
          type="number"
          placeholder="Precio máx."
          value={filters.maxPrice}
          onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
        />
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="loading">Cargando productos...</p>
      ) : products.length === 0 ? (
        <p className="empty">No se encontraron productos con esos filtros.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
