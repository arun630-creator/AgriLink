
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  image: string;
  farmer: {
    name: string;
    location: string;
  };
  maxQuantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  validateCartItems: () => Promise<{ valid: boolean; invalidItems: string[] }>;
  removeInvalidItems: (invalidIds: string[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('agriDirect_cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('agriDirect_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: any) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        if (existingItem.quantity >= product.quantity) {
          toast.error('Cannot add more than available quantity');
          return prevItems;
        }
        
        toast.success('Item quantity updated in cart');
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        toast.success('Item added to cart');
        return [...prevItems, {
          id: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          quantity: 1,
          image: product.image,
          farmer: product.farmer,
          maxQuantity: product.quantity
        }];
      }
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          if (quantity > item.maxQuantity) {
            toast.error(`Maximum available quantity is ${item.maxQuantity} ${item.unit}`);
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    toast.success('Item removed from cart');
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success('Cart cleared');
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Validate cart items by checking if products still exist
  const validateCartItems = async (): Promise<{ valid: boolean; invalidItems: string[] }> => {
    if (cartItems.length === 0) {
      return { valid: true, invalidItems: [] };
    }

    try {
      const invalidItems: string[] = [];
      
      // Check each cart item's product ID
      for (const item of cartItems) {
        try {
          const response = await fetch(`http://localhost:5000/api/products/${item.id}`);
          if (!response.ok) {
            invalidItems.push(item.id);
          }
        } catch (error) {
          invalidItems.push(item.id);
        }
      }

      return {
        valid: invalidItems.length === 0,
        invalidItems
      };
    } catch (error) {
      console.error('Error validating cart items:', error);
      return { valid: false, invalidItems: cartItems.map(item => item.id) };
    }
  };

  // Remove invalid items from cart
  const removeInvalidItems = (invalidIds: string[]) => {
    setCartItems(prevItems => prevItems.filter(item => !invalidIds.includes(item.id)));
    if (invalidIds.length > 0) {
      toast.error(`${invalidIds.length} item(s) removed from cart due to invalid product IDs`);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getTotalItems,
      getTotalPrice,
      validateCartItems,
      removeInvalidItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
