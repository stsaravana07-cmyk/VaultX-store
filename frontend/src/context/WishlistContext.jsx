import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDBWishlist();
    } else {
      const localWish = localStorage.getItem('wishlist');
      if (localWish) {
        setWishlistItems(JSON.parse(localWish));
      } else {
        setWishlistItems([]);
      }
    }
  }, [user]);

  const fetchDBWishlist = async () => {
    setLoading(true);
    try {
      const response = await api.get('orders/wishlist/');
      setWishlistItems(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (product) => {
    if (user) {
      try {
        const response = await api.post('orders/wishlist/', { product: product.id });
        // The response tells us if it was added or removed
        await fetchDBWishlist();
        return response.data.in_wishlist;
      } catch (error) {
        console.error('Error toggling wishlist:', error);
        return false;
      }
    } else {
      // Local wishlist toggle
      const exists = wishlistItems.some(item => item.product.id === product.id);
      let updatedWishlist = [...wishlistItems];
      let inWishlist = false;

      if (exists) {
        updatedWishlist = wishlistItems.filter(item => item.product.id !== product.id);
      } else {
        updatedWishlist.push({
          id: `local_wish_${Date.now()}_${product.id}`,
          product: product
        });
        inWishlist = true;
      }
      setWishlistItems(updatedWishlist);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      return inWishlist;
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.product.id === productId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      loading,
      toggleWishlist,
      isInWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
