import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import { getCart, addItemToCart, updateCartItem, removeCartItem } from "../api/cart";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

import { getProductImageUrl } from "../lib/utils";

export type CartItem = {
  id: string; // backend itemId
  slug: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color?: string;
  category?: string;
  quantity: number;
};

type CartContextType = {
  cartId: string | null;
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "id" | "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "ab_cart_v1";
const SESSION_KEY = "ab_cart_session_v1";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize session ID
  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return "";
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = uuidv4();
      localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  }, []);

  // Fetch initial cart from backend
  useEffect(() => {
    getCart(sessionId).then((res) => {
      if (res && res.items) {
        setCartId(res.id || null);
        setItems(res.items.map((i: any) => {
          const basePrice = (i.product?.basePriceCents || 0) / 100;
          const variantPrice = (i.variant?.priceCents || 0) / 100;
          let price = basePrice;
          if (basePrice > 0 && basePrice < 10000000) {
            price = basePrice;
          } else if (variantPrice > 0 && variantPrice < 10000000) {
            price = variantPrice;
          }

          return {
            id: i.id,
            slug: i.product?.slug || "",
            name: i.product?.name || "",
            price: price,
            image: getProductImageUrl(i.product?.images?.[0]?.url, i.product?.slug),
            size: i.variant?.size || "",
            quantity: i.quantity,
          };
        }));
      }
    }).catch(console.error);
  }, [sessionId]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem: CartContextType["addItem"] = useCallback(async (item, qty = 1) => {
    try {
      // Optimizacion: Para no trabar UI, podemos actualizar localmente primero
      // pero para evitar errores de desincronización, llamamos la API.
      const res = await addItemToCart(item.slug, item.size, item.color, qty, sessionId);
      
      if (!cartId && res.cartId) {
        setCartId(res.cartId);
      }
      
      setItems((prev) => {
        const existing = prev.find((p) => p.slug === item.slug && p.size === item.size && p.color === item.color);
        if (existing) {
          return prev.map((p) => (p.slug === item.slug && p.size === item.size && p.color === item.color ? { ...p, quantity: p.quantity + qty } : p));
        }
        return [...prev, { ...item, id: res.id, quantity: qty }];
      });
      
      setIsOpen(true);
    } catch (err) {
      console.error("Error adding to cart", err);
      alert("No pudimos agregar el producto. " + (err as any).message);
    }
  }, [sessionId]);

  const removeItem = useCallback(async (id: string, itemName?: string) => {
    // Optimistic update
    const prevItems = [...items];
    setItems((prev) => prev.filter((p) => p.id !== id));
    
    try {
      await removeCartItem(id);
      toast.success(itemName ? `${itemName} eliminado del carrito` : "Producto eliminado del carrito", {
        position: "top-center",
        duration: 3000,
        style: { background: '#1a1510', color: '#fff', border: '1px solid #d4af7a' }
      });
    } catch (err) {
      console.error("Error removing from cart", err);
      // Revert on failure
      setItems(prevItems);
      toast.error("No se pudo eliminar el producto", {
        position: "top-center"
      });
    }
  }, [items]);

  const updateQty = useCallback(async (id: string, qty: number) => {
    if (qty <= 0) return removeItem(id);
    
    // Optimistic update
    const prevItems = [...items];
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: qty } : p))
    );
    
    try {
      await updateCartItem(id, qty);
    } catch (err) {
      console.error("Error updating cart", err);
      // Revert on failure
      setItems(prevItems);
    }
  }, [items, removeItem]);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const { subtotal, count } = useMemo(() => {
    return items.reduce(
      (acc, it) => ({
        subtotal: acc.subtotal + it.price * it.quantity,
        count: acc.count + it.quantity,
      }),
      { subtotal: 0, count: 0 },
    );
  }, [items]);

  const value: CartContextType = {
    cartId,
    items,
    isOpen,
    openCart,
    closeCart,
    addItem,
    removeItem: (id) => {
      const item = items.find((i) => i.id === id);
      removeItem(id, item?.name);
    },
    updateQty,
    clear,
    subtotal,
    count,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

export const parseCOP = (s: string) => {
  const digits = s.replace(/[^\d]/g, "");
  return parseInt(digits || "0", 10);
};
