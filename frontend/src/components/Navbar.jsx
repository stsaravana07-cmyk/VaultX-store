import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, LogOut, Shield, Menu, X, Search, ChevronDown, ShoppingBag } from 'lucide-react';
import Logo from './Logo';

import api from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [herosDropdownOpen, setHerosDropdownOpen] = useState(false);
  const [heroes, setHeroes] = useState([]);

  const [categories, setCategories] = useState([]);

  React.useEffect(() => {
    const fetchHeroesAndCategories = async () => {
      try {
        const [heroesRes, categoriesRes] = await Promise.all([
          api.get('products/hero-avatars/'),
          api.get('products/categories/')
        ]);
        setHeroes(heroesRes.data);
        setCategories(categoriesRes.data);
      } catch (e) {
        console.error('Failed to fetch navbar data:', e);
      }
    };
    fetchHeroesAndCategories();
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      navigate(`/shop?search=${searchQuery}`);
    }
  };

  // Generate dynamic links from backend categories, and prepend a Home link
  const subNavLinks = [
    { name: 'Home', path: '/home', hasDropdown: false },
    ...categories.map(cat => ({
      name: cat.name,
      path: `/category/${cat.slug}`,
      hasDropdown: false
    }))
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 transition-all font-sans shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      
      {/* Animatic Background Layer */}
      <div className="absolute inset-0 bg-[#050505]/85 backdrop-blur-xl border-b border-white/5 pointer-events-none overflow-hidden">
        {/* Animated Gradient Line at Bottom */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-pulse opacity-50" />
        
        {/* Animated Background Blobs */}
        <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] bg-orange-500/10 blur-[80px] rounded-full animate-[spin_15s_linear_infinite]" />
        <div className="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] bg-purple-500/10 blur-[80px] rounded-full animate-[spin_20s_linear_infinite_reverse]" />
      </div>

      {/* Primary Header Row */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo */}
          <Logo />

          {/* Centered Search Bar */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-8 group">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search Database..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
                className="w-full bg-white/5 text-white placeholder-slate-400 pl-10 pr-4 py-2 rounded-full border border-white/10 focus:outline-none focus:border-orange-500 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(249,115,22,0.3)] text-xs transition-all duration-300"
              />
              <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400 group-focus-within:text-orange-400 transition-colors" />
            </div>
          </div>

          {/* Action Icons & Profile */}
          <div className="hidden md:flex items-center space-x-3.5">
            {/* Wishlist */}
            <div onClick={() => navigate('/dashboard?tab=wishlist')} className="relative p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all cursor-pointer">
              <Heart size={16} />
              {wishlistItems.length > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                >
                  {wishlistItems.length}
                </motion.span>
              )}
            </div>

            {/* Cart */}
            <div onClick={() => navigate('/cart')} className="relative p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/30 hover:shadow-[0_0_10px_rgba(249,115,22,0.3)] transition-all cursor-pointer">
              <ShoppingCart size={16} />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                >
                  {cartCount}
                </motion.span>
              )}
            </div>

            <div className="w-px h-6 bg-white/10 mx-1"></div>

            {/* User Profile / Login */}
            {user ? (
              <div 
                className="relative"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="flex items-center gap-2 cursor-pointer p-1.5 pr-3 rounded-full bg-white/5 border border-white/10 hover:border-white/30 transition-all">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center text-[10px] font-black shadow-[0_0_10px_rgba(249,115,22,0.4)]">
                    {user.username?.substring(0,2).toUpperCase() || 'HV'}
                  </div>
                  <span className="text-[10px] font-bold text-slate-200 hidden lg:block uppercase tracking-wider">{user.username}</span>
                </div>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-[#0f0f0f]/95 backdrop-blur-xl p-2 shadow-2xl z-50"
                    >
                      <div onClick={() => { setDropdownOpen(false); navigate('/dashboard'); }} className="flex items-center gap-2 p-2.5 hover:bg-white/5 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer group">
                        <Shield size={14} className="text-emerald-400 group-hover:text-emerald-300" /> My Dashboard
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 p-2.5 mt-1 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-xs font-bold text-slate-300 transition-colors group"
                      >
                        <LogOut size={14} className="text-red-400 group-hover:text-red-300" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className="px-5 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_15px_rgba(249,115,22,0.5)] hover:scale-105 transition-all duration-300 cursor-pointer">
                Login / Join
              </button>
            )}
          </div>

          {/* Mobile Menu Controls */}
          <div className="flex md:hidden items-center space-x-3">
            <div onClick={() => navigate('/cart')} className="relative p-2 text-slate-300 cursor-pointer">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* Sub-Navigation Bar (Desktop only) */}
      <div className="hidden md:block relative bg-white/5 border-t border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-2.5 flex items-center justify-center space-x-12">
          {/* Heros Dropdown Menu */}
          <div 
            className="relative"
            onMouseEnter={() => setHerosDropdownOpen(true)}
            onMouseLeave={() => setHerosDropdownOpen(false)}
          >
            <button
              onClick={() => setHerosDropdownOpen(!herosDropdownOpen)}
              className="text-[11px] font-extrabold text-slate-400 hover:text-orange-400 tracking-widest uppercase flex items-center gap-1 transition-colors cursor-pointer focus:outline-none hover:drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]"
            >
              Heros <ChevronDown size={11} className="text-slate-500 mt-0.5" />
            </button>

            <AnimatePresence>
              {herosDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 -translate-x-1/2 mt-2 w-52 rounded-xl border border-white/10 bg-[#0f0f0f]/95 backdrop-blur-xl p-2 shadow-2xl z-55"
                >
                  {heroes.length > 0 ? (
                    heroes.map((hero) => (
                      <div
                        key={hero.hero_id}
                        onClick={() => { setHerosDropdownOpen(false); navigate(`/portal/${hero.hero_id}`); }}
                        className="flex items-center gap-2.5 p-2 rounded-lg group transition-colors text-left hover:bg-white/5 mt-1 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden flex-shrink-0 group-hover:border-orange-500/50 transition-colors">
                          <img src={hero.image_url || '/templates/Iron Man.jpg'} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-300 transition-colors uppercase tracking-wider group-hover:text-orange-400 drop-shadow-[0_0_5px_rgba(249,115,22,0)] group-hover:drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]">{hero.name}</p>
                          <p className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest">
                            Exclusive Portal
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-[10px] font-bold text-slate-500 uppercase">
                      No Heroes Active
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {subNavLinks.map((link) => (
            <div
              key={link.name}
              onClick={() => navigate(link.path)}
              className="text-[11px] font-extrabold text-slate-400 hover:text-orange-400 tracking-widest uppercase flex items-center gap-1 transition-colors hover:drop-shadow-[0_0_5px_rgba(249,115,22,0.5)] cursor-pointer"
            >
              {link.name}
              {link.hasDropdown && <ChevronDown size={11} className="text-slate-500 mt-0.5" />}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden relative bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 px-4 pt-2 pb-6 space-y-3 text-left shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
            
            {/* Mobile Search */}
            <div className="relative w-full mb-4 z-10">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
                className="w-full bg-white/5 text-white placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-full border border-white/10 focus:outline-none focus:border-orange-500 focus:bg-white/10 text-xs shadow-inner"
              />
              <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
            </div>

            <div className="z-10 relative">
              {subNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-orange-400 hover:bg-white/5 transition-all"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="border-t border-white/10 pt-2 space-y-1 z-10 relative">
              <p className="px-4 text-[9px] font-mono uppercase tracking-widest text-slate-500 font-black">Super Portals</p>
              <div className="grid grid-cols-2 gap-2">
                {heroes.map(hero => (
                  <Link
                    key={hero.hero_id}
                    to={`/portal/${hero.hero_id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 rounded-xl text-[10px] font-black text-slate-300 hover:text-orange-400 transition-all"
                  >
                    <img src={hero.image_url || '/templates/Iron Man.jpg'} alt="" className="w-5 h-5 rounded-full object-cover" />
                    {hero.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="border-t border-white/10 pt-3 z-10 relative">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-center mb-2"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center block px-4 py-2.5 rounded-xl text-xs font-black text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-red-650 text-white uppercase tracking-wider shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                >
                  Initialize Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
