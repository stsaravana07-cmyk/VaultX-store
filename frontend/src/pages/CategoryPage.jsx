import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { useToast } from '../context/ToastContext';
import { SlidersHorizontal, ArrowUpDown, RefreshCw, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryPage = () => {
  const { slug } = useParams();
  const { addToast } = useToast();
  
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Custom Filtering States
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [ordering, setOrdering] = useState('newest');

  // Pill filter state
  const [activePricePill, setActivePricePill] = useState('all');

  // Fetch Category info
  useEffect(() => {
    const fetchCategoryInfo = async () => {
      try {
        const res = await api.get('products/categories/');
        const cats = res.data;
        const matched = cats.find(c => c.slug === slug);
        setCategory(matched || { name: slug.replace('-', ' '), slug: slug });
      } catch (e) {
        console.error('Error fetching categories:', e);
      }
    };
    fetchCategoryInfo();
  }, [slug]);

  // Fetch Products based on filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { category: slug };
      
      if (activePricePill === 'under1000') {
        params.max_price = 1000;
      } else if (activePricePill === '1000to3000') {
        params.min_price = 1000;
        params.max_price = 3000;
      } else if (activePricePill === 'over3000') {
        params.min_price = 3000;
      }

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
    fetchProducts();
  }, [slug, activePricePill, ratingFilter, ordering]);

  const clearFilters = () => {
    setActivePricePill('all');
    setRatingFilter('');
    setOrdering('newest');
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen text-slate-800 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-14">
        
        {/* Dynamic Category Hero Banner */}
        <div className="relative w-full h-[250px] md:h-[300px] overflow-hidden flex items-center justify-center">
          {(category?.banner_url || category?.image_url) ? (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${category.banner_url || category.image_url})` }}
            >
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900"></div>
          )}
          
          <div className="relative z-10 text-center px-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black text-white uppercase tracking-widest font-display drop-shadow-2xl"
            >
              {category?.name || 'Category'}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-sm font-bold text-slate-300 max-w-xl mx-auto uppercase tracking-widest"
            >
              Explore our curated selection of top-tier {category?.name || 'gear'} tailored for heroes.
            </motion.p>
          </div>
        </div>

        {/* Horizontal Filters Bar */}
        <div className="border-b border-slate-200 bg-white sticky top-14 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest mr-2 flex items-center gap-1">
                <SlidersHorizontal size={14} /> Filters:
              </span>
              
              <button 
                onClick={() => setActivePricePill('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activePricePill === 'all' ? 'bg-secondary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                All Prices
              </button>
              <button 
                onClick={() => setActivePricePill('under1000')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activePricePill === 'under1000' ? 'bg-secondary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Under ₹1000
              </button>
              <button 
                onClick={() => setActivePricePill('1000to3000')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activePricePill === '1000to3000' ? 'bg-secondary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                ₹1000 - ₹3000
              </button>
              <button 
                onClick={() => setActivePricePill('over3000')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activePricePill === 'over3000' ? 'bg-secondary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                ₹3000+
              </button>

              <div className="h-6 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>

              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="bg-slate-100 border-none text-slate-600 focus:ring-0 rounded-full px-4 py-1.5 text-xs font-bold cursor-pointer"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
              </select>

              {(activePricePill !== 'all' || ratingFilter !== '') && (
                <button 
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-xs font-black text-red-500 hover:text-red-700 flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest flex items-center gap-1">
                <ArrowUpDown size={14} /> Sort By:
              </span>
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary cursor-pointer shadow-sm"
              >
                <option value="newest">New Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
            
          </div>
        </div>

        {/* Product Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {loading ? (
            <div className="flex justify-center items-center py-32">
              <RefreshCw className="animate-spin text-secondary w-10 h-10" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <FileText size={48} className="text-slate-300 mb-4" />
              <h3 className="text-xl font-black text-slate-800 tracking-wider">No matching armaments found</h3>
              <p className="text-sm text-slate-500 mt-2">Adjust your filters to try again.</p>
              <button 
                onClick={clearFilters}
                className="mt-6 px-6 py-2.5 border border-secondary text-secondary font-bold text-xs uppercase tracking-wider rounded-full hover:bg-secondary hover:text-white transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              <AnimatePresence>
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
