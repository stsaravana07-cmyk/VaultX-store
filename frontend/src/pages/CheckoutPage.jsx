import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CreditCard, Truck, Receipt, CheckCircle, Smartphone, AlertCircle, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cartItems, subtotal, discountAmount, taxAmount, grandTotal, coupon, clearCart } = useCart();
  const navigate = useNavigate();

  // Address fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  // Payment field
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  // Order submission states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user) {
      setFullName(user.username || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCity(user.city || '');
      setZipCode(user.zip_code || '');
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !orderSuccess) {
      navigate('/cart');
    }
  }, [cartItems, orderSuccess, navigate]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must authenticate to place an order. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const orderPayload = {
        full_name: fullName,
        email,
        phone,
        address,
        city,
        zip_code: zipCode,
        payment_method: paymentMethod,
        coupon_code: coupon
      };

      const response = await api.post('orders/history/', orderPayload);
      setCreatedOrder(response.data);
      setOrderSuccess(true);
      
      // Fire celebration confetti
      confetti({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.6 }
      });

      // Clear cart
      await clearCart();
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during order routing. Please check item stock.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess && createdOrder) {
    return (
      <div className="bg-space-black text-slate-200 min-h-screen flex flex-col font-sans pt-20 justify-between">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto space-y-6">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 10 }}
          >
            <CheckCircle className="text-primary w-24 h-24 text-glow-cyan" />
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black font-display text-white tracking-tight uppercase">TRANSMISSION CONFIRMED</h2>
            <p className="text-xs text-primary font-bold tracking-widest uppercase">Order #{createdOrder.id} successfully created</p>
            <p className="text-sm text-slate-400 max-w-md pt-2">
              Your battle weapons and tactical gears have been sent to shipping. Teleport drop-ship coordinates are logged.
            </p>
          </div>

          {/* Receipt detail snapshot */}
          <div className="w-full p-5 bg-space-slate border border-slate-900 rounded-2xl text-left text-xs font-medium space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Acquisition Receipt</h4>
            <div className="flex justify-between">
              <span className="text-slate-500">Acquirer:</span>
              <span className="text-white font-bold">{createdOrder.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Destination:</span>
              <span className="text-white font-bold">{createdOrder.address}, {createdOrder.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Method:</span>
              <span className="text-white font-bold uppercase">{createdOrder.payment_method}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-black text-white">
              <span>Settled Sum:</span>
              <span className="font-mono text-primary">₹{createdOrder.grand_total}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <Link 
              to="/dashboard?tab=orders"
              className="px-6 py-3 bg-gradient-to-r from-primary to-neon-blue text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-transform"
            >
              Track Coordinates
            </Link>
            <Link 
              to="/shop"
              className="px-6 py-3 bg-space-slate border border-slate-800 hover:border-white text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Continue Shop
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-space-black text-slate-200 min-h-screen flex flex-col font-sans pt-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow flex flex-col space-y-6">
        <h1 className="text-3xl font-black font-display text-white tracking-tight uppercase flex items-center gap-2">
          <Truck className="text-primary" /> SECURE CHECKOUT
        </h1>

        {error && (
          <div className="bg-red-950/40 border border-red-500/50 text-red-200 text-xs px-4 py-3 rounded-xl flex items-center gap-2 max-w-xl">
            <AlertCircle size={18} className="text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8">
          {/* Shipping Form Panel */}
          <div className="flex-grow p-8 glassmorphic border border-slate-900 rounded-2xl space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <Truck size={18} className="text-primary" /> Teleport Coordinates (Shipping)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Acquirer Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Peter Parker"
                  className="w-full bg-space-black border border-slate-800 focus:border-primary focus:outline-none rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Sector Frequency (Email)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="acquirer@sector.com"
                  className="w-full bg-space-black border border-slate-800 focus:border-primary focus:outline-none rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Comm Line (Phone)</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555-0100"
                  className="w-full bg-space-black border border-slate-800 focus:border-primary focus:outline-none rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Postal Code / Zip Code</label>
                <input
                  type="text"
                  required
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="10001"
                  className="w-full bg-space-black border border-slate-800 focus:border-primary focus:outline-none rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Base Details (Street Address)</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="20 Ingram St"
                  className="w-full bg-space-black border border-slate-800 focus:border-primary focus:outline-none rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Sector (City)</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New York"
                  className="w-full bg-space-black border border-slate-800 focus:border-primary focus:outline-none rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            {/* Payment Method Panel */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <CreditCard size={18} className="text-secondary" /> Energy Settlement (Payment)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* COD option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 border rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'COD' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-slate-800 bg-space-black/35 text-slate-400 hover:text-white'
                  }`}
                >
                  <Truck size={18} />
                  <div className="text-left">
                    <p className="text-xs font-bold">Cash on Delivery</p>
                    <p className="text-[9px] text-slate-550">Settle upon portal receipt</p>
                  </div>
                </button>

                {/* Card option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-4 border rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'Card' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-slate-800 bg-space-black/35 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard size={18} />
                  <div className="text-left">
                    <p className="text-xs font-bold">Credit/Debit Card</p>
                    <p className="text-[9px] text-slate-550">Secure payment gateway</p>
                  </div>
                </button>

                {/* UPI option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 border rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'UPI' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-slate-800 bg-space-black/35 text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone size={18} />
                  <div className="text-left">
                    <p className="text-xs font-bold">UPI / Instant Pay</p>
                    <p className="text-[9px] text-slate-550">Scan QR Code coordinates</p>
                  </div>
                </button>
              </div>
            </div>

          </div>

          {/* Invoice Summary Drawer */}
          <div className="w-full lg:w-96 flex-shrink-0 space-y-6">
            <div className="p-6 glassmorphic border border-slate-900 rounded-2xl space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
                <Receipt size={18} className="text-accent-gold" /> Spec List Summary
              </h3>

              {/* Items list */}
              <div className="max-h-48 overflow-y-auto space-y-3 pb-2 border-b border-slate-850">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 justify-between items-center text-xs font-medium">
                    <span className="text-slate-450 truncate flex-1">{item.product.name} <span className="text-slate-600">x{item.quantity}</span></span>
                    <span className="font-mono text-white">₹{((item.product.final_price || item.product.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Financial calculations summary */}
              <div className="space-y-2 text-xs font-bold text-slate-400">
                <div className="flex justify-between">
                  <span>Cargo Subtotal:</span>
                  <span className="font-mono text-white">₹{subtotal.toFixed(2)}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-accent-gold">
                    <span>Discount Coupon ({coupon}):</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tariff Fee (5% Tax):</span>
                  <span className="font-mono text-white">₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-3 text-sm text-white font-black">
                  <span>Total Settlement:</span>
                  <span className="font-mono text-primary text-glow-cyan">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-4 bg-gradient-to-r from-primary to-neon-blue text-black font-bold tracking-wide rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/45 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Routing Teleport...
                  </div>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    Place Order / Drop-Ship
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
