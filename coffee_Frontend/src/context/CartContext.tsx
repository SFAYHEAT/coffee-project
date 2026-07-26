import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

type CartItem = {
  id: string;
  productId?: string;
  name: string;
  price: number;
  basePrice?: number;
  size?: string;
  toppings?: string[];
  image?: any;
  qty: number;
};

type CartContextType = {
  cart: CartItem[];

  addToCart: (item: CartItem) => Promise<void>;

  increaseQty: (id: string) => void;

  decreaseQty: (id: string) => void;

  removeFromCart: (id: string) => void;

  clearCart: () => void;

  updateToppings: (id: string, newToppings: string[], newPrice: number) => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const saved = await AsyncStorage.getItem("cart");

      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (error) {
      console.log("LOAD CART ERROR", error);
    }
  };
  const updateToppings = (
    id: string,
    newToppings: string[],
    newPrice: number,
  ) => {
    const updated = cart.map((item) =>
      item.id === id
        ? { ...item, toppings: newToppings, price: newPrice }
        : item,
    );
    updateCart(updated);
  };
  const updateCart = async (data: CartItem[]) => {
    setCart(data);

    try {
      await AsyncStorage.setItem("cart", JSON.stringify(data));
    } catch (error) {
      console.log("SAVE CART ERROR", error);
    }
  };

  const addToCart = async (item: CartItem) => {
    const updated = [...cart];

    const index = updated.findIndex((i) => i.id === item.id);

    if (index !== -1) {
      updated[index] = {
        ...updated[index],
        qty: updated[index].qty + 1,
      };
    } else {
      updated.push({
        ...item,
        qty: item.qty || 1,
      });
    }

    await updateCart(updated);
  };

  const increaseQty = (id: string) => {
    const updated = cart.map((item) =>
      item.id === id
        ? {
            ...item,
            qty: item.qty + 1,
          }
        : item,
    );

    updateCart(updated);
  };

  const decreaseQty = (id: string) => {
    const updated = cart.map((item) =>
      item.id === id
        ? {
            ...item,
            qty: Math.max(1, item.qty - 1),
          }
        : item,
    );

    updateCart(updated);
  };

  const removeFromCart = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);

    updateCart(updated);
  };

  const clearCart = () => {
    updateCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCart,
        updateToppings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
