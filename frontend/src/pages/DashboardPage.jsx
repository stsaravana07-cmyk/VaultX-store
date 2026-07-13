import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, ShoppingBag, MapPin, Bell, Star, HelpCircle, CheckCircle, RefreshCw, XCircle, Clock, Package, ChevronRight, Settings, LogOut, MessageSquare, Heart, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';

const DashboardPage = () => {
  const { user, updateProfile, logout } = useAuth();
  const { addToast, showConfirm } = useToast();
  const navigate = useNavigate();
  const { wishlistItems } = useWishlist();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';
  const hasTabParam = !!searchParams.get('tab');

  // State Variables
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Support Form State
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportImage, setSupportImage] = useState(null);
  const [submittingSupport, setSubmittingSupport] = useState(false);
  
  // Profile Update fields
  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  // Address fields
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [zipCode, setZipCode] = useState(user?.zip_code || '');
  
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Sync profile fields on user change
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCity(user.city || '');
      setZipCode(user.zip_code || '');
    }
  }, [user]);

  // Fetch Order History
  const fetchOrderHistory = async () => {
    setLoadingOrders(true);
    try {
      const response = await api.get('orders/history/');
      setOrders(response.data.results || response.data);
    } catch (e) {
      console.error('Error loading order history:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch notifications on mount to get the unread count
  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrderHistory();
    } else if (activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [activeTab]);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await api.get('support/notifications/');
      setNotifications(response.data.results || response.data);
    } catch (e) {
      console.error('Error loading notifications:', e);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await api.patch(`support/notifications/${notifId}/`, { read: true });
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    } catch (e) {
      console.error('Error marking notification as read:', e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('support/notifications/mark_all_read/');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      addToast('All notifications marked as read.', 'success');
    } catch (e) {
      console.error('Error marking all notifications as read:', e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;


  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setSubmittingSupport(true);
    try {
      const formData = new FormData();
      formData.append('subject', supportSubject);
      formData.append('message', supportMessage);
      if (supportImage) formData.append('image', supportImage);

      await api.post('support/tickets/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      addToast('Support ticket submitted successfully.', 'success');
      setIsSupportModalOpen(false);
      setSupportSubject('');
      setSupportMessage('');
      setSupportImage(null);
    } catch (err) {
      addToast('Failed to submit support ticket.', 'error');
    } finally {
      setSubmittingSupport(false);
    }
  };

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
    setProfileSuccess('');
    setProfileError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setUpdatingProfile(true);

    const result = await updateProfile({ username, phone, address, city, zip_code: zipCode });
    setUpdatingProfile(false);

    if (result.success) {
      setProfileSuccess('Details updated successfully!');
      addToast('Profile updated.', 'success');
    } else {
      setProfileError(result.message);
    }
  };

  const handleCancelOrder = (orderId) => {
    showConfirm('Initiate order cancellation sequence?', async () => {
      try {
        await api.post(`orders/history/${orderId}/cancel_order/`);
        fetchOrderHistory();
        addToast('Order cancelled successfully.', 'success');
      } catch (err) {
        addToast(err.response?.data?.detail || 'Failed to cancel order.', 'error');
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/50';
      case 'Packed': return 'text-blue-400 bg-blue-500/10 border-blue-500/50';
      case 'Shipped': return 'text-purple-400 bg-purple-500/10 border-purple-500/50';
      case 'Delivered': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/50';
      case 'Cancelled': return 'text-red-400 bg-red-500/10 border-red-500/50';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/50';
    }
  };

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'wishlist', label: 'My Wishlist', icon: Heart },
    { id: 'profile', label: 'Edit Profile', icon: User },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'reviews', label: 'My Reviews', icon: Star },
    { id: 'help', label: 'Help Center', icon: HelpCircle },
  ];

  return (
    <div className="bg-[#080808] text-slate-200 min-h-screen flex flex-col font-sans pt-20">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className={`w-full md:w-72 flex-shrink-0 ${hasTabParam ? 'hidden md:block' : 'block'}`}>
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 sticky top-28 shadow-2xl">
            <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-xl font-black text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-white font-black text-lg tracking-wide">{user?.username}</h2>
                <p className="text-xs text-slate-400 font-medium">{user?.email}</p>
              </div>
            </div>

            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isNotifications = tab.id === 'notifications';
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all relative ${
                      isActive 
                        ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-[inset_0_0_10px_rgba(249,115,22,0.1)]' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-orange-500' : 'text-slate-500'} />
                    <span>{tab.label}</span>
                    {isNotifications && unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-black bg-orange-500 text-black rounded-full min-w-[18px] text-center">
                        {unreadCount}
                      </span>
                    )}
                    {isActive && <ChevronRight size={16} className="ml-auto" />}
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 pt-6 border-t border-white/10">
              <button 
                onClick={() => {
                  showConfirm("Are you sure you want to logout?", () => {
                    logout();
                    navigate('/login');
                  });
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className={`flex-grow ${hasTabParam ? 'block' : 'hidden md:block'}`}>
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 md:p-8 min-h-[600px] shadow-2xl">
            {hasTabParam && (
              <button 
                onClick={() => setSearchParams({})} 
                className="md:hidden flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-xs uppercase tracking-widest font-black transition-all cursor-pointer border border-white/10 bg-[#1a1a1a]/50 hover:bg-[#1a1a1a] px-4 py-2.5 rounded-xl shadow-lg shadow-black/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowLeft size={14} className="text-orange-500" /> Back to Dashboard
              </button>
            )}
            
            {/* --- TAB: ORDERS --- */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-white uppercase tracking-wider font-display">Order History</h3>
                  <button onClick={fetchOrderHistory} className="text-slate-400 hover:text-orange-500 p-2 rounded-full hover:bg-white/5 transition-all">
                    <RefreshCw size={18} className={loadingOrders ? 'animate-spin' : ''} />
                  </button>
                </div>

                {loadingOrders ? (
                  <div className="py-20 flex justify-center"><RefreshCw size={32} className="animate-spin text-orange-500" /></div>
                ) : orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map((ord) => (
                      <div key={ord.id} className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors">
                        
                        {/* Order Header */}
                        <div className="px-6 py-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 bg-black/20">
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Order ID</p>
                            <p className="text-sm text-white font-bold tracking-wider">#{ord.id}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Date Placed</p>
                            <p className="text-sm text-slate-300 font-medium">{new Date(ord.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Amount</p>
                            <p className="text-sm text-orange-500 font-black tracking-wider">₹{ord.grand_total}</p>
                          </div>
                          <div>
                            <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider border ${getStatusColor(ord.status)}`}>
                              {ord.status}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-6 space-y-4">
                          {ord.items?.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
                              <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                                {item.image_url ? (
                                  <img src={item.image_url} alt={item.product_name} className="w-full h-full object-contain" />
                                ) : (
                                  <Package size={24} className="text-slate-600" />
                                )}
                              </div>
                              <div className="flex-grow">
                                <h4 className="text-sm font-bold text-white truncate max-w-[200px] md:max-w-[400px]">{item.product_name}</h4>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-slate-200">₹{item.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Actions */}
                        {(ord.status === 'Pending' || ord.status === 'Packed') && (
                          <div className="px-6 py-4 bg-black/20 border-t border-white/5 flex justify-end">
                            <button
                              onClick={() => handleCancelOrder(ord.id)}
                              className="text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-widest flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
                            >
                              <XCircle size={14} /> Cancel Order
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-black/20 border border-white/5 rounded-2xl relative overflow-hidden"
                  >
                    <motion.div 
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-2"
                    >
                      <ShoppingBag size={32} className="text-slate-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                    </motion.div>
                    <p className="text-white font-black text-lg uppercase tracking-wider">No Orders Found</p>
                    <p className="text-slate-400 font-medium max-w-sm text-xs px-4">You haven't placed any orders yet. Discover premium gear in the shop.</p>
                    <button onClick={() => navigate('/shop')} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-orange-500/20">
                      Start Shopping
                    </button>
                  </motion.div>
                )}
              </div>
            )}

            {/* --- TAB: WISHLIST --- */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-white uppercase tracking-wider font-display">My Wishlist</h3>
                </div>

                {wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => (
                      <ProductCard key={item.id} product={item.product} theme="dark" />
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-20 bg-black/20 border border-white/5 rounded-2xl relative overflow-hidden"
                  >
                    {/* Animated background neon circles */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />
                    
                    {/* Pulsating Glowing Heart Icon */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.15, 1],
                        filter: ["drop-shadow(0 0 10px rgba(239,68,68,0.3))", "drop-shadow(0 0 25px rgba(239,68,68,0.7))", "drop-shadow(0 0 10px rgba(239,68,68,0.3))"]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      className="inline-block relative mb-6"
                    >
                      <Heart className="h-16 w-16 text-red-500 fill-red-500/20" />
                    </motion.div>

                    <motion.p 
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-white font-black text-xl mb-2 uppercase tracking-wider text-glow-purple"
                    >
                      Your Wishlist is Empty
                    </motion.p>
                    
                    <motion.p 
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-sm text-slate-400 font-bold mb-8"
                    >
                      You haven't flagged any weapons or gear for cataloging yet.
                    </motion.p>
                    
                    <motion.div
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <button 
                        onClick={() => navigate('/shop')}
                        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        Discover Gear
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            )}

            {/* --- TAB: PROFILE --- */}
            {activeTab === 'profile' && (
              <div className="space-y-8 max-w-lg">
                <h3 className="text-xl font-black text-white uppercase tracking-wider font-display mb-2">Edit Profile</h3>
                
                {profileSuccess && <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 text-xs rounded-xl text-center font-bold">{profileSuccess}</div>}
                {profileError && <div className="p-3 bg-red-950/40 border border-red-500/50 text-red-400 text-xs rounded-xl text-center font-bold">{profileError}</div>}

                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Username</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full bg-black/40 border border-white/10 focus:border-orange-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-white transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                    <input type="email" disabled value={user?.email || ''} className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phone Number</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-black/40 border border-white/10 focus:border-orange-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-white transition-colors" />
                  </div>
                  <button type="submit" disabled={updatingProfile} className="px-6 py-3 bg-orange-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-orange-400 transition-all w-full mt-4">
                    {updatingProfile ? 'Saving Changes...' : 'Save Profile Details'}
                  </button>
                </form>
              </div>
            )}

            {/* --- TAB: ADDRESSES --- */}
            {activeTab === 'addresses' && (
              <div className="space-y-8 max-w-lg">
                <h3 className="text-xl font-black text-white uppercase tracking-wider font-display mb-2">Saved Addresses</h3>
                <p className="text-xs text-slate-400 font-medium mb-6">Manage your shipping and billing coordinates.</p>

                {profileSuccess && <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 text-xs rounded-xl text-center font-bold">{profileSuccess}</div>}

                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Street Address</label>
                    <textarea rows="3" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-black/40 border border-white/10 focus:border-orange-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-white transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">City</label>
                      <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-black/40 border border-white/10 focus:border-orange-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-white transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Zip Code</label>
                      <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="w-full bg-black/40 border border-white/10 focus:border-orange-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-white transition-colors" />
                    </div>
                  </div>
                  <button type="submit" disabled={updatingProfile} className="px-6 py-3 bg-orange-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-orange-400 transition-all w-full mt-4">
                    {updatingProfile ? 'Saving Address...' : 'Update Default Address'}
                  </button>
                </form>
              </div>
            )}

            {/* --- TAB: NOTIFICATIONS --- */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-2">
                  <h3 className="text-xl font-black text-white uppercase tracking-wider font-display">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-bold text-orange-500 hover:text-orange-400 uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                {loadingNotifications ? (
                  <div className="py-20 flex justify-center"><RefreshCw size={32} className="animate-spin text-orange-500" /></div>
                ) : notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notif, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                        className={`p-4 rounded-2xl border transition-all ${notif.read ? 'bg-black/20 border-white/5' : 'bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20 cursor-pointer'} flex gap-4 items-start`}
                      >
                        <div className="mt-1"><Bell size={16} className={notif.read ? "text-slate-500" : "text-orange-500"} /></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className={`text-sm font-bold ${notif.read ? 'text-slate-300' : 'text-white'}`}>{notif.title}</h4>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0 animate-pulse" />
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{notif.message}</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-2">{new Date(notif.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                      <Bell size={32} className="text-slate-500" />
                    </div>
                    <p className="text-slate-400 font-medium max-w-sm">You have no new notifications.</p>
                  </div>
                )}
              </div>
            )}

            {/* --- TAB: REVIEWS --- */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h3 className="text-xl font-black text-white uppercase tracking-wider font-display mb-2">My Reviews</h3>
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                    <Star size={32} className="text-slate-500" />
                  </div>
                  <p className="text-slate-400 font-medium max-w-sm">You haven't submitted any reviews yet. Share your experience on products you've purchased.</p>
                </div>
              </div>
            )}

            {/* --- TAB: HELP CENTER --- */}
            {activeTab === 'help' && (
              <div className="space-y-8">
                <h3 className="text-xl font-black text-white uppercase tracking-wider font-display mb-2">Help Center</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black/40 border border-white/5 p-5 rounded-2xl">
                    <MessageSquare size={24} className="text-orange-500 mb-3" />
                    <h4 className="text-sm font-bold text-white mb-2">Contact Support</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">Our tactical response team is available 24/7 for any inquiries regarding your gear.</p>
                    <button onClick={() => setIsSupportModalOpen(true)} className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-400">Message Support &rarr;</button>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-5 rounded-2xl">
                    <Package size={24} className="text-orange-500 mb-3" />
                    <h4 className="text-sm font-bold text-white mb-2">Shipping Policies</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">Review our multiverse shipping terms, return policies, and tracking procedures.</p>
                    <button onClick={() => setIsPolicyModalOpen(true)} className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-400 cursor-pointer">View Policies &rarr;</button>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Frequently Asked Questions</h4>
                  {[
                    { q: "How long does inter-dimensional shipping take?", a: "Standard shipping takes 3-5 business cycles depending on your sector." },
                    { q: "Can I cancel an order?", a: "Orders can be cancelled from the 'My Orders' tab before they enter the 'Packed' status phase." },
                    { q: "Are tactical suits machine washable?", a: "Most suits require specialized dry cleaning. Check the product specifications for exact details." }
                  ].map((faq, i) => (
                    <div key={i} className="bg-white/5 p-4 rounded-xl">
                      <p className="text-xs font-bold text-white mb-1">Q: {faq.q}</p>
                      <p className="text-xs text-slate-400">A: {faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>

      </main>
      <Footer />

      {/* Support Form Modal */}
      <AnimatePresence>
        {isSupportModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative"
            >
              <button onClick={() => setIsSupportModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors">
                <XCircle size={20} />
              </button>
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-black text-white uppercase tracking-wider font-display mb-2 flex items-center gap-2">
                  <HelpCircle className="text-orange-500" /> New Support Ticket
                </h3>
                <p className="text-xs text-slate-400 mb-6 font-medium">Describe your issue in detail. Our agents will respond shortly.</p>
                <form onSubmit={handleSupportSubmit} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Subject / Order ID</label>
                    <input type="text" value={supportSubject} onChange={(e) => setSupportSubject(e.target.value)} required placeholder="e.g. Defective Arc Reactor" className="w-full bg-black/40 border border-white/10 focus:border-orange-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-white transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Detailed Message</label>
                    <textarea rows="4" value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} required placeholder="Describe the issue..." className="w-full bg-black/40 border border-white/10 focus:border-orange-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-white transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Attach Image (Optional)</label>
                    <input type="file" accept="image/*" onChange={(e) => setSupportImage(e.target[0] || e.target.files[0])} className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange-500/10 file:text-orange-500 hover:file:bg-orange-500/20" />
                  </div>
                  <div className="pt-4">
                    <button type="submit" disabled={submittingSupport} className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all">
                      {submittingSupport ? 'Transmitting...' : 'Submit Ticket'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Policies Modal */}
      <AnimatePresence>
        {isPolicyModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative"
            >
              <button onClick={() => setIsPolicyModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors">
                <XCircle size={20} />
              </button>
              <div className="p-6 md:p-8 space-y-6">
                <h3 className="text-xl font-black text-white uppercase tracking-wider font-display mb-2 flex items-center gap-2">
                  <Package className="text-orange-500" /> Multiverse Dispatch & Security Policies
                </h3>
                <p className="text-xs text-slate-400 font-medium pb-2 border-b border-white/5">Official protocols governing tactical gear shipments and acquisitions across all sectors.</p>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1.5">1. Inter-Dimensional Transit</h4>
                    <p className="text-xs text-slate-350 leading-relaxed">
                      All shipments are routed through the Multiverse Transit Matrix. Standard dispatch to Earth Sectors takes 3-5 standard planetary cycles. Outer-Rim sectors or alternate dimensions may incur extended quantum delay.
                    </p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1.5">2. Return & Exchange Clearances</h4>
                    <p className="text-xs text-slate-350 leading-relaxed">
                      Operatives can initiate exchange requests within 14 cycles of receipt. Items such as active Arc Reactors, custom-fit vibranium armor, or magical artifacts must have their seals/containment chambers unbroken. Defensive gear with battle damage is non-refundable.
                    </p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1.5">3. Sub-Space Tracking</h4>
                    <p className="text-xs text-slate-350 leading-relaxed">
                      Your cargo is equipped with a quantum-encrypted sub-space tracking beacon. Tracking telemetry is accessible strictly within your command hub dashboard under orders, keeping coordinates hidden from hostile entities.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={() => setIsPolicyModalOpen(false)}
                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Acknowledge Protocol
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;
