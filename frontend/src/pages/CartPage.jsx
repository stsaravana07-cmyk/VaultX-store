import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const CartPage = () => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    discountAmount, 
    taxAmount, 
    grandTotal, 
    coupon, 
    applyCoupon 
  } = useCart();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [couponError, setCouponError] = useState(false);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput) return;
    
    const result = applyCoupon(couponInput);
    setCouponMessage(result.message);
    setCouponError(!result.success);
    if (result.success) {
      setCouponInput('');
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="bg-space-black text-slate-200 min-h-screen flex flex-col font-sans pt-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow flex flex-col space-y-6">
        <h1 className="text-3xl font-black font-display text-white tracking-tight uppercase flex items-center gap-2">
          <ShoppingBag className="text-primary" /> Acquisition Cart
        </h1>

        {cartItems.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Cart Items List */}
            <div className="flex-grow space-y-4">
              {cartItems.map((item) => (
                <div 
                  key={item.id} 
                  className="flex flex-col sm:flex-row items-center justify-between p-5 bg-space-slate/30 border border-slate-900 rounded-2xl gap-4 hover:border-slate-800 transition-colors"
                >
                  {/* Product Info */}
                  <div className="flex gap-4 items-center w-full sm:w-auto">
                    <img 
                      src={item.product.image_url} 
                      alt={item.product.name} 
                      className="w-16 h-16 object-cover rounded-xl border border-slate-800"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{item.product.name}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.product.category_name}</p>
                      <p className="text-xs font-mono text-primary font-bold mt-1">₹{item.product.final_price || item.product.price}</p>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 bg-space-black/60 px-3 py-1.5 border border-slate-800 rounded-xl">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-mono text-xs font-bold text-white w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Price breakdown & Delete */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t border-slate-850 sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Subtotal</p>
                      <p className="text-sm font-mono font-bold text-white">
                        ₹{((item.product.final_price || item.product.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2.5 bg-red-950/20 hover:bg-red-500 hover:text-black text-red-400 rounded-xl border border-red-900/30 transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Order Summary sidebar card */}
            <div className="w-full lg:w-96 flex-shrink-0 space-y-6">
              
              {/* Promo code form */}
              <div className="p-6 glassmorphic rounded-2xl border border-slate-900">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Tag size={14} className="text-accent-gold" /> Encrypt Promo Code
                </h3>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. HERO20, SUPER50"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full bg-space-black border border-slate-800 focus:border-accent-gold focus:outline-none rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-space-slate border border-slate-800 hover:border-accent-gold text-white hover:text-accent-gold font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
                {couponMessage && (
                  <p className={`text-[10px] font-bold mt-2 animate-pulse ${couponError ? 'text-accent-red' : 'text-accent-gold'}`}>
                    {couponMessage}
                  </p>
                )}
                <div className="mt-4 text-[10px] text-slate-500 font-bold space-y-1">
                  <p>Secret Codes available for Academicians:</p>
                  <p>• <span className="text-accent-gold">HERO20</span>: 20% discount on all suites.</p>
                  <p>• <span className="text-accent-gold">SUPER50</span>: 50% ultimate discount.</p>
                </div>
              </div>

              {/* Financial calculations summary */}
              <div className="p-6 glassmorphic rounded-2xl border border-slate-900 space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider pb-2 border-b border-slate-800">
                  Acquisition Statement
                </h3>

                <div className="space-y-2 text-xs font-bold text-slate-400">
                  <div className="flex justify-between">
                    <span>Base Value:</span>
                    <span className="font-mono text-white">₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {coupon && (
                    <div className="flex justify-between text-accent-gold">
                      <span>Promo Discount ({coupon}):</span>
                      <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Multiverse Tariff (5% Tax):</span>
                    <span className="font-mono text-white">₹{taxAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between border-t border-slate-850 pt-3 text-sm text-white font-black">
                    <span>Grand Total:</span>
                    <span className="font-mono text-glow-cyan text-primary">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  className="w-full mt-4 py-3.5 bg-gradient-to-r from-primary to-neon-blue text-black font-bold tracking-wide rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/45 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </button>

                <div className="flex items-center gap-2 text-[10px] text-slate-550 pt-2 justify-center font-bold">
                  <ShieldCheck size={14} className="text-primary animate-pulse" />
                  Secure Cryptographic Encrypted Checkout
                </div>
              </div>

            </div>

          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20 bg-space-dark/80 rounded-2xl border border-slate-900 relative overflow-hidden"
          >
            {/* Animated background neon circles */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/10 rounded-full blur-[80px] pointer-events-none" />
            
            {/* Animated Shopping Bag Icon with scale & float */}
            <motion.div
              animate={{ 
                y: [0, -12, 0],
                rotate: [0, 2, -2, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="inline-block relative mb-6"
            >
              <ShoppingBag className="h-16 w-16 text-slate-650 drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]" />
              <motion.div
                animate={{
                  opacity: [0.1, 0.4, 0.1],
                  scale: [0.9, 1.3, 0.9]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-primary/20 rounded-full filter blur-md -z-10"
              />
            </motion.div>

            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white font-black text-xl mb-2 uppercase tracking-wider text-glow-cyan"
            >
              Your Vault is Empty
            </motion.p>
            
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-slate-400 font-bold mb-8"
            >
              You haven't added any items to your acquisition grid yet.
            </motion.p>
            
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link 
                to="/shop"
                className="px-8 py-3 bg-gradient-to-r from-primary to-neon-blue text-black font-black text-xs uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all inline-block hover:scale-105 active:scale-95"
              >
                Enter Shop Catalog
              </Link>
            </motion.div>
          </motion.div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
