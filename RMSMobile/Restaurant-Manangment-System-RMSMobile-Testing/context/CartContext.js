import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart from storage when app starts
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    saveCartToStorage();
  }, [cartItems]);

  const loadCartFromStorage = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    }
  };

  const saveCartToStorage = async () => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  };

  // Add item to cart
  const addToCart = (item) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingItemIndex !== -1) {
        // Item already exists, increase quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      } else {
        // New item, add to cart
        const newItem = {
          id: item.id,
          name: item.name || item.foodName,
          price: item.unitPrice || item.price,
          image: item.foodImage || item.imageUrl,
          description: item.description,
          quantity: 1,
          categoryId: item.categoryId
        };
        return [...prevItems, newItem];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    console.log('🗑️ CartContext.removeFromCart called with itemId:', itemId);
    console.log('📦 Current cart before removal:', cartItems);
    
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== itemId);
      console.log('📦 Cart after removal:', newItems);
      console.log('✅ Item removed. Items count changed from', prevItems.length, 'to', newItems.length);
      return newItems;
    });
  };

  // Update item quantity
  const updateQuantity = (itemId, newQuantity) => {
    console.log('🔢 CartContext.updateQuantity called:', { itemId, newQuantity });
    
    if (newQuantity <= 0) {
      console.log('⚠️ Quantity is 0 or less, removing item');
      removeFromCart(itemId);
      return;
    }

    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
    console.log('✅ Quantity updated');
  };

  // Increase quantity by 1
  const increaseQuantity = (itemId) => {
    console.log('➕ CartContext.increaseQuantity called for itemId:', itemId);
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Decrease quantity by 1
  const decreaseQuantity = (itemId) => {
    console.log('➖ CartContext.decreaseQuantity called for itemId:', itemId);
    
    setCartItems(prevItems => {
      const newItems = prevItems.map(item => 
        item.id === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ).filter(item => item.quantity > 0);
      
      console.log('📦 Cart after decrease:', newItems);
      return newItems;
    });
  };

  // Clear entire cart
  const clearCart = () => {
    console.log('🧹 CartContext.clearCart called');
    console.log('📦 Clearing', cartItems.length, 'items from cart');
    
    setCartItems([]);
    console.log('✅ Cart cleared');
  };

  // Get total items count
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Get total price
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Check if item is in cart
  const isInCart = (itemId) => {
    return cartItems.some(item => item.id === itemId);
  };

  // Get item quantity in cart
  const getItemQuantity = (itemId) => {
    const item = cartItems.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const contextValue = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;