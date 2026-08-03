// Contexto del carrito — soporta RF-03 (carrito con edición de
// cantidades y cálculo automático de totales). El carrito vive en
// memoria + localStorage (persiste si el cliente recarga la página,
// pero el total real y la disponibilidad se vuelven a validar en el
// servidor durante el checkout, nunca se confía solo en este estado).
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'tecnomarket_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(product, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        { productId: product.id, name: product.name, price: Number(product.price), quantity, stock: product.stock },
      ];
    });
  }

  function updateQuantity(productId, quantity) {
    if (quantity <= 0) return removeItem(productId);
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
  }

  function removeItem(productId) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function clearCart() {
    setItems([]);
  }

  // El total se recalcula automáticamente cada vez que cambian los
  // ítems (criterio de aceptación de RF-03).
  const total = useMemo(
    () => items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
