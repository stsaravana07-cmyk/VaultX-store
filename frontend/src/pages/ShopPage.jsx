import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { useToast } from '../context/ToastContext';
import { Search, Mic, MicOff, SlidersHorizontal, ArrowUpDown, RefreshCw, Star, X, Check, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();
  
  // Search and Filter States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [ordering, setOrdering] = useState('newest');

  // AI & Voice Search States
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Comparison State
  const [compareList, setCompareList] = useState([]);
  const [showCompareDrawer, setShowCompareDrawer] = useState(false);

  // Sync state from query params on mount/change
  useEffect(() => {
    setCategoryFilter(searchParams.get('category') || '');
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('products/categories/');
        setCategories(res.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCats();
  }, []);

  // Fetch Products based on filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (ratingFilter) params.rating = ratingFilter;
      if (ordering) params.ordering = ordering;

      const response = await api.get('products/items/', { params });
      setProducts(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search input fetching
    const timer = setTimeout(() => {
      fetchProducts();
    }, 400);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, minPrice, maxPrice, ratingFilter, ordering]);

  // Fetch Autocomplete suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (search.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await api.get(`products/items/suggestions/?q=${search}`);
        setSuggestions(res.data);
      } catch (e) {
        // Suggestions fail silently
      }
    };
    fetchSuggestions();
  }, [search]);

  // Initialize Speech Recognition for Voice Search
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onresult = (e) => {
        const spokenText = e.results[0][0].transcript;
        // Clean speech text
        const cleaned = spokenText.replace(/[.?!]/g, '').trim();
        setSearch(cleaned);
        // Update URL
        setSearchParams(prev => {
          if (cleaned) prev.set('search', cleaned);
          else prev.delete('search');
          return prev;
        });
      };

      recognitionRef.current = rec;
    }
  }, [setSearchParams]);

  const toggleVoiceSearch = () => {
    if (!recognitionRef.current) {
      addToast('Voice protocols not supported in this browser. Try Chrome/Edge.', 'error');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Handle clicking a suggestion
  const handleSelectSuggestion = (sug) => {
    if (sug.is_prompt) {
      setSearch(sug.theme);
    } else {
      setSearch(sug.name);
    }
    setShowSuggestions(false);
  };

  const handleCategorySelect = (slug) => {
    const newSlug = categoryFilter === slug ? '' : slug;
    setCategoryFilter(newSlug);
    setSearchParams(prev => {
      if (newSlug) prev.set('category', newSlug);
      else prev.delete('category');
      return prev;
    });
  };

  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setMinPrice('');
    setMaxPrice('');
    setRatingFilter('');
    setOrdering('newest');
    setSearchParams({});
  };

  // Product Comparison Handlers
  const toggleComparison = (product) => {
    const exists = compareList.some(item => item.id === product.id);
    if (exists) {
      setCompareList(prev => prev.filter(item => item.id !== product.id));
    } else {
      if (compareList.length >= 3) {
        addToast('Multiverse limits comparison matrix to 3 items.', 'error');
        return;
      }
      setCompareList(prev => [...prev, product]);
      setShowCompareDrawer(true);
    }
  };

  const isCompared = (productId) => compareList.some(item => item.id === productId);

  return (
    <div className="bg-space-black text-slate-200 min-h-screen flex flex-col font-sans pt-20">
      <Navbar />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="p-6 glassmorphic rounded-2xl border border-slate-900">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-primary" /> Filter Console
              </span>
              <button 
                onClick={resetFilters}
                className="text-[10px] text-slate-550 hover:text-primary font-bold uppercase transition-colors cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* Category selection */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Departments</h4>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                      categoryFilter === cat.slug 
                        ? 'bg-primary text-black' 
                        : 'bg-space-slate/40 text-slate-400 hover:text-white hover:bg-space-slate/60'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {categoryFilter === cat.slug && <Check size={12} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price filter inputs */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price Matrix</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-space-black border border-slate-800 focus:border-primary focus:outline-none rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-space-black border border-slate-800 focus:border-primary focus:outline-none rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            {/* Rating Filter Selection */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Minimum Star rating</h4>
              <div className="space-y-1.5">
                {[4, 3, 2].map((num) => (
                  <button
                    key={num}
                    onClick={() => setRatingFilter(ratingFilter === String(num) ? '' : String(num))}
                    className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                      ratingFilter === String(num) 
                        ? 'bg-secondary text-white' 
                        : 'bg-space-slate/40 text-slate-400 hover:text-white hover:bg-space-slate/60'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {num}+ <Star size={12} className="fill-current text-accent-gold" />
                    </span>
                    {ratingFilter === String(num) && <Check size={12} />}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Products Grid & Filters */}
        <main className="flex-1 space-y-6">
          {/* Top Search / Voice and sorting bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 glassmorphic rounded-2xl border border-slate-900">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-550">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Live search multiverse gear..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full bg-space-black/50 border border-slate-800 focus:border-primary focus:outline-none rounded-xl py-3 pl-10 pr-20 text-sm text-white placeholder-slate-600"
              />
              
              {/* Mic Icon for voice search */}
              <button
                type="button"
                onClick={toggleVoiceSearch}
                className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isListening 
                    ? 'bg-red-500/20 text-red-400 animate-pulse' 
                    : 'text-slate-550 hover:text-white'
                }`}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              {/* Suggestions dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 right-0 mt-2 bg-space-dark border border-slate-800 rounded-2xl shadow-2xl p-2 z-30"
                  >
                    <div className="flex justify-between items-center px-3 py-1 border-b border-slate-800 mb-1 text-[10px] text-slate-550 font-bold uppercase">
                      <span>AI Suggestions</span>
                      <button onClick={() => setShowSuggestions(false)} className="hover:text-white">
                        <X size={12} />
                      </button>
                    </div>
                    {suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSuggestion(sug)}
                        className="w-full text-left px-3 py-2.5 text-xs rounded-xl hover:bg-space-slate flex items-center justify-between text-slate-300 hover:text-white cursor-pointer"
                      >
                        <span className="font-medium">{sug.name}</span>
                        {sug.price && <span className="font-mono text-primary">₹{sug.price}</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <ArrowUpDown size={16} className="text-slate-500" />
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="w-full sm:w-44 bg-space-black border border-slate-800 focus:border-primary focus:outline-none rounded-xl py-3 px-3 text-xs text-white cursor-pointer"
              >
                <option value="newest">Sort: New Arrivals</option>
                <option value="price_asc">Sort: Price Low-High</option>
                <option value="price_desc">Sort: Price High-Low</option>
                <option value="rating">Sort: High Rating</option>
              </select>
            </div>
          </div>

          {/* Catalog grid */}
          {loading ? (
            // Skeleton loader layout
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-space-slate/30 animate-pulse rounded-2xl aspect-square h-80" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  
                  {/* Compare Selection Overlay */}
                  <button
                    onClick={() => toggleComparison(product)}
                    className={`absolute bottom-5 left-5 z-10 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all ${
                      isCompared(product.id)
                        ? 'bg-secondary border-secondary text-white shadow-md shadow-secondary/20'
                        : 'bg-space-black/80 hover:bg-space-black border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <RefreshCw size={10} className={isCompared(product.id) ? 'animate-spin' : ''} />
                    {isCompared(product.id) ? 'Compared' : 'Compare'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-space-dark rounded-2xl border border-slate-900">
              <p className="text-slate-450 font-bold text-base mb-2">No matching armaments found</p>
              <p className="text-xs text-slate-550">Adjust your shields or clear filters to try again.</p>
              <button 
                onClick={resetFilters}
                className="mt-6 px-6 py-2.5 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-black rounded-xl text-xs font-bold text-primary transition-colors cursor-pointer"
              >
                Clear Search Matrix
              </button>
            </div>
          )}

        </main>
      </div>

      {/* Floating Product Comparison Drawer */}
      <AnimatePresence>
        {showCompareDrawer && compareList.length > 0 && (
          <motion.div
            initial={{ y: 250 }}
            animate={{ y: 0 }}
            exit={{ y: 250 }}
            className="fixed bottom-0 inset-x-0 z-45 bg-space-dark/95 border-t border-slate-800 shadow-2xl glassmorphic p-6 max-h-[350px] overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <RefreshCw size={16} className="text-primary animate-spin" /> Spec Comparison Matrix
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">{compareList.length} of 3 items selected</span>
                  <button 
                    onClick={() => { setCompareList([]); setShowCompareDrawer(false); }}
                    className="p-1 rounded-lg bg-space-black hover:bg-space-slate text-slate-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Comparison grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {compareList.map((item) => (
                  <div key={item.id} className="p-4 bg-space-slate/30 border border-slate-850 rounded-xl flex flex-col justify-between space-y-2 relative">
                    <button
                      onClick={() => toggleComparison(item)}
                      className="absolute top-2 right-2 p-1 text-slate-500 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                    <div className="flex gap-3 items-center">
                      <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-slate-800" />
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{item.name}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{item.category_name}</p>
                      </div>
                    </div>
                    
                    <table className="w-full text-[10px] text-slate-400 mt-2 border-t border-slate-800/80 pt-2 space-y-1">
                      <tbody>
                        <tr className="flex justify-between border-b border-slate-850 py-1">
                          <td className="font-bold">Price:</td>
                          <td className="font-mono font-bold text-white">₹{item.final_price || item.price}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-slate-850 py-1">
                          <td className="font-bold">Rating:</td>
                          <td className="text-accent-gold font-bold">{item.rating || '5.0'}★</td>
                        </tr>
                        <tr className="flex justify-between border-b border-slate-850 py-1">
                          <td className="font-bold">SKU:</td>
                          <td className="font-mono uppercase text-slate-500">{item.SKU}</td>
                        </tr>
                        <tr className="flex justify-between py-1">
                          <td className="font-bold">Availability:</td>
                          <td className={`font-bold ${item.stock > 0 ? 'text-emerald-450' : 'text-accent-red'}`}>
                            {item.stock > 0 ? `${item.stock} Units` : 'Out of Stock'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default ShopPage;
