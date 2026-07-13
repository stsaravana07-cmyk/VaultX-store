import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0); // decimal percentage e.g. 0.20
  const [loading, setLoading] = useState(false);

  // Load cart on auth change
  useEffect(() => {
    if (user) {
      fetchDBCart();
    } else {
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        setCartItems(JSON.parse(localCart));
      } else {
        setCartItems([]);
      }
    }
    setCoupon('');
    setCouponDiscount(0);
  }, [user]);

  const fetchDBCart = async () => {
    setLoading(true);
    try {
      const response = await api.get('orders/cart/');
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (user) {
      try {
        await api.post('orders/cart/', { product: product.id, quantity });
        await fetchDBCart();
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    } else {
      // Local cart management
      const existingItemIndex = cartItems.findIndex(item => item.product.id === product.id);
      let updatedCart = [...cartItems];
      
      if (existingItemIndex > -1) {
        updatedCart[existingItemIndex].quantity += quantity;
      } else {
        updatedCart.push({
          id: `local_${Date.now()}_${product.id}`,
          product: product,
          quantity: quantity
        });
      }
      setCartItems(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    if (user) {
      try {
        // API uses patch with product id or nested model id
        // Let's find the item and patch its quantity
        const isLocalId = String(itemId).startsWith('local_');
        const dbId = isLocalId ? itemId.split('_')[2] : itemId;
        
        await api.patch(`orders/cart/${itemId}/`, { quantity });
        await fetchDBCart();
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    } else {
      const updatedCart = cartItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
      setCartItems(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
  };

  const removeFromCart = async (itemId) => {
    if (user) {
      try {
        await api.delete(`orders/cart/${itemId}/`);
        await fetchDBCart();
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    } else {
      const updatedCart = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await api.post('orders/cart/clear/');
        setCartItems([]);
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    } else {
      setCartItems([]);
      localStorage.removeItem('cart');
    }
    setCoupon('');
    setCouponDiscount(0);
  };

  const applyCoupon = (code) => {
    const formattedCode = code.toUpperCase().trim();
    if (formattedCode === 'HERO20') {
      setCoupon(formattedCode);
      setCouponDiscount(0.20);
      return { success: true, message: 'Hero Discount Applied: 20% OFF!' };
    } else if (formattedCode === 'SUPER50') {
      setCoupon(formattedCode);
      setCouponDiscount(0.50);
      return { success: true, message: 'Super Power Discount Applied: 50% OFF!' };
    } else if (formattedCode === 'AVENGERS10') {
      setCoupon(formattedCode);
      setCouponDiscount(0.10);
      return { success: true, message: 'Avengers Assemble: 10% OFF!' };
    }
    return { success: false, message: 'Invalid or Expired Coupon Code' };
  };

  // Derived states
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product.final_price || item.product.price;
    return acc + (parseFloat(price) * item.quantity);
  }, 0);

  const discountAmount = subtotal * couponDiscount;
  const taxAmount = (subtotal - discountAmount) * 0.05; // 5% tax
  const grandTotal = subtotal - discountAmount + taxAmount;

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      subtotal: roundToTwo(subtotal),
      discountAmount: roundToTwo(discountAmount),
      taxAmount: roundToTwo(taxAmount),
      grandTotal: roundToTwo(grandTotal),
      coupon,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      applyCoupon
    }}>
      {children}
    </CartContext.Provider>
  );
};

const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

export const useCart = () => useContext(CartContext);
