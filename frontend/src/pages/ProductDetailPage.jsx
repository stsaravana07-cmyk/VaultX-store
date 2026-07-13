import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { Star, ShoppingCart, Heart, ShieldAlert, Award, FileText, CheckCircle } from 'lucide-react';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Gallery states
  const [mainImage, setMainImage] = useState('');
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
  const [zoomBackground, setZoomBackground] = useState('');

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const prodRes = await api.get(`products/items/${slug}/`);
        const item = prodRes.data;
        setProduct(item);
        setMainImage(item.image_url);

        // Fetch related products
        const relRes = await api.get('products/items/', {
          params: { category: item.category_name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-') }
        });
        const items = relRes.data.results || relRes.data;
        setRelated(items.filter(p => p.id !== item.id).slice(0, 4));
      } catch (error) {
        console.error('Error fetching product detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [slug]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, 1);
      addToast(`${product.name} added to cart!`, 'success');
    }
  };

  // Image Zoom Lens effect on mouse move
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${mainImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  // Submit Review Handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setSubmittingReview(true);

    try {
      const response = await api.post(`products/items/${product.slug}/add_review/`, {
        rating,
        comment
      });
      setReviewSuccess('Review broadcasted successfully! Product ratings updated.');
      setComment('');
      
      // Update local product reviews and rating list
      const updatedReviews = [response.data, ...(product.reviews || [])];
      setProduct({
        ...product,
        reviews: updatedReviews,
        rating: (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
      });
    } catch (err) {
      setReviewError(err.response?.data?.detail || 'Authentication required to transmit reviews. Please log in.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-space-black text-slate-200 min-h-screen flex flex-col font-sans pt-20 justify-between">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-space-black text-slate-200 min-h-screen flex flex-col font-sans pt-20 justify-between">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-6">
          <ShieldAlert className="text-accent-red w-16 h-16 animate-bounce" />
          <h2 className="text-xl font-bold mt-4">Armament Record Missing</h2>
          <p className="text-xs text-slate-500 mt-2">The record coordinates are out of bounds. Seek other systems.</p>
          <Link to="/shop" className="mt-6 px-6 py-2.5 bg-primary text-black font-bold rounded-xl text-xs uppercase">
            Back to Catalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isWish = isInWishlist(product.id);
  const hasDiscount = product.discount > 0;

  return (
    <div className="bg-space-black text-slate-200 min-h-screen flex flex-col font-sans pt-20">
      <Navbar />

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full text-xs font-bold text-slate-500 uppercase tracking-widest flex gap-2">
        <Link to="/home" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-slate-300 truncate">{product.name}</span>
      </div>

      {/* Main product card detail */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Gallery Column */}
          <div className="space-y-4">
            {/* Main Image View */}
            <div 
              className="relative aspect-square overflow-hidden bg-space-dark border border-slate-900 rounded-2xl flex items-center justify-center p-6"
            >
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,140,0,0.15)]"
              />
            </div>

            {/* Gallery Thumbnails */}
            {product.gallery && product.gallery.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                <button
                  onClick={() => setMainImage(product.image_url)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border bg-space-slate flex-shrink-0 cursor-pointer transition-all ${
                    mainImage === product.image_url ? 'border-primary' : 'border-slate-800'
                  }`}
                >
                  <img src={product.image_url} alt="" className="w-full h-full object-contain p-1" />
                </button>
                {product.gallery.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setMainImage(img.image_url)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border bg-space-slate flex-shrink-0 cursor-pointer transition-all ${
                      mainImage === img.image_url ? 'border-primary' : 'border-slate-800'
                    }`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specs / Buy Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/20">
                {product.category_name}
              </span>
              <h1 className="text-3xl md:text-4xl font-black font-display text-white tracking-tight leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-2 text-sm pt-2">
                <div className="flex text-accent-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className={i < Math.floor(product.rating || 5) ? 'fill-accent-gold text-accent-gold' : 'text-slate-700'} 
                    />
                  ))}
                </div>
                <span className="font-bold text-white">({product.rating || '5.0'})</span>
                <span className="text-slate-650">|</span>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">{product.reviews?.length || 0} Review Transmissions</span>
              </div>
            </div>

            <p className="text-sm text-slate-350 leading-relaxed font-medium">
              {product.description}
            </p>

            {/* Spec Matrix Table */}
            <div className="p-4 bg-space-slate/30 border border-slate-900 rounded-xl space-y-2.5 max-w-sm">
              <div className="flex justify-between text-xs font-bold border-b border-slate-800 pb-2">
                <span className="text-slate-500 uppercase tracking-widest">Frequency SKU</span>
                <span className="font-mono text-white uppercase">{product.SKU}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500 uppercase tracking-widest">Inventory Status</span>
                <span className={`uppercase ${product.stock > 5 ? 'text-emerald-450' : product.stock > 0 ? 'text-accent-gold animate-pulse' : 'text-accent-red font-black'}`}>
                  {product.stock > 5 ? `In Stock (${product.stock} Units)` : product.stock > 0 ? `Low stock (${product.stock} left)` : 'DEPLETED'}
                </span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="flex items-baseline gap-4 pt-2">
              <span className="text-3xl font-black text-white">
                ₹{product.final_price || product.price}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm text-slate-500 line-through font-bold">
                    ₹{product.price}
                  </span>
                  <span className="text-xs font-black text-black bg-accent-gold px-2.5 py-0.5 rounded-lg uppercase">
                    Save {product.discount}%
                  </span>
                </>
              )}
            </div>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 max-w-md">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 py-4 font-bold tracking-wide rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform ${
                  product.stock <= 0 
                    ? 'bg-slate-850 text-slate-500 cursor-not-allowed border border-slate-800' 
                    : 'bg-gradient-to-r from-primary to-neon-blue text-black shadow-lg shadow-primary/20 hover:shadow-primary/40'
                }`}
              >
                <ShoppingCart size={18} />
                Acquire / Add to Cart
              </button>
              
              <button
                onClick={() => toggleWishlist(product)}
                className={`px-6 py-4 rounded-xl border font-bold flex items-center justify-center cursor-pointer transition-colors ${
                  isWish 
                    ? 'bg-accent-red/10 border-accent-red text-accent-red' 
                    : 'border-slate-800 hover:border-white text-white'
                }`}
              >
                <Heart size={18} className={isWish ? 'fill-current' : ''} />
              </button>
            </div>

          </div>
        </div>

        {/* Reviews and Ratings Sub-Section */}
        <section className="border-t border-slate-900 pt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Reviews Column */}
            <div className="md:col-span-2 space-y-6">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">
                Review Logs
              </h3>
              
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map((rev) => (
                    <div key={rev.id} className="p-5 bg-space-slate/30 border border-slate-900 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
                          <Award size={14} className="text-primary" /> {rev.username || 'PeterParker'}
                        </span>
                        <div className="flex text-accent-gold">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={10} 
                              className={i < rev.rating ? 'fill-accent-gold text-accent-gold' : 'text-slate-800'} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-550 font-bold">No telemetry reviews recorded for this item. Be the first to establish signal.</p>
              )}
            </div>

            {/* Write Review Form */}
            <div className="p-6 glassmorphic rounded-2xl border border-slate-900 max-h-[380px]">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">
                Transmit Telemetry
              </h3>

              {reviewSuccess && (
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs rounded-lg mb-4 text-center font-medium flex items-center justify-center gap-1.5">
                  <CheckCircle size={14} />
                  {reviewSuccess}
                </div>
              )}

              {reviewError && (
                <div className="p-2.5 bg-red-950/40 border border-red-500/50 text-red-200 text-xs rounded-lg mb-4 text-center font-medium">
                  {reviewError}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-widest mb-1.5">
                    Select Worthiness Score
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setRating(num)}
                        className="p-1 text-slate-650 hover:text-accent-gold cursor-pointer transition-colors"
                      >
                        <Star size={20} className={num <= rating ? 'fill-accent-gold text-accent-gold' : ''} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-widest mb-1.5">
                    Comments / Feedback
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter battle suit/weapon performance remarks..."
                    className="w-full bg-space-black border border-slate-800 focus:border-primary focus:outline-none rounded-xl p-3 text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-2.5 bg-primary text-black font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                  {submittingReview ? 'Broadcasting...' : 'Transmit review'}
                </button>
              </form>
            </div>

          </div>
        </section>

        {/* Related Products Grid */}
        {related.length > 0 && (
          <section className="border-t border-slate-900 pt-10">
            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-8">
              Related Armaments
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
