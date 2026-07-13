import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { ShoppingCart, Heart, Star, Flame } from 'lucide-react';

const ProductCard = ({ product, theme = 'light' }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const isWish = isInWishlist(product.id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    addToast(`${product.name} added to cart!`, 'success');
  };

  const hasDiscount = product.discount > 0;
  const isDark = theme === 'dark';

  const getQualityBadge = () => {
    const priceVal = parseFloat(product.final_price || product.price);
    if (priceVal >= 1000) {
      return (
        <span className="absolute top-3.5 left-3.5 z-10 px-2.5 py-0.5 text-[8px] font-black text-red-600 bg-red-50 border border-red-200 rounded-lg uppercase tracking-wider shadow-sm">
          ★ Legendary
        </span>
      );
    } else if (priceVal >= 400) {
      return (
        <span className="absolute top-3.5 left-3.5 z-10 px-2.5 py-0.5 text-[8px] font-black text-purple-650 bg-purple-50 border border-purple-200 rounded-lg uppercase tracking-wider shadow-sm">
          ✦ Epic
        </span>
      );
    } else {
      return (
        <span className="absolute top-3.5 left-3.5 z-10 px-2.5 py-0.5 text-[8px] font-black text-cyan-600 bg-cyan-50 border border-cyan-200 rounded-lg uppercase tracking-wider shadow-sm">
          ● Rare
        </span>
      );
    }
  };

  return (
    <div className="group relative rounded-xl overflow-hidden transition-all duration-300 flex flex-col font-sans bg-white/70 backdrop-blur-md border border-slate-150 shadow hover:shadow-[0_0_15px_rgba(255,140,0,0.18)] hover:border-orange-500/35 hover:-translate-y-1">
      
      {/* Wishlist Button (Heart Overlay) */}
      <button
        onClick={handleWishlistClick}
        className="absolute top-3.5 right-3.5 z-10 p-2.5 rounded-full cursor-pointer transition-all duration-205 shadow-sm bg-white hover:bg-red-50 border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200"
      >
        <Heart 
          size={14} 
          className={`transition-colors ${isWish ? 'fill-accent-red text-accent-red' : ''}`} 
        />
      </button>

      {/* Discount / Quality Badge */}
      {getQualityBadge()}

      {/* Product Click Area */}
      <div onClick={() => navigate(`/product/${product.slug}`)} className="flex-1 flex flex-col cursor-pointer">
        {/* Product Image */}
        <div className="relative h-44 sm:h-48 md:h-44 overflow-hidden flex items-center justify-center border-b bg-slate-50/50 border-slate-100 shrink-0">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?w=400'}
            alt={product.name}
            className="w-full h-full object-contain p-4"
          />
          {/* Quick View Cover Overlay */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="px-4 py-2 bg-white/95 border border-slate-200 text-slate-800 text-[10px] font-black rounded-xl tracking-wider uppercase hover:bg-slate-100 transition-colors shadow-md">
              Inspect Spec
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-3 sm:p-4 flex-grow flex flex-col justify-between text-left">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              {product.category_name || 'Relic'}
            </span>
            <h3 className="text-xs font-black transition-colors line-clamp-2 leading-snug text-slate-800 group-hover:text-orange-550">
              {product.name}
            </h3>
            
            {/* Star Rating */}
            <div className="flex items-center gap-1 pt-1.5">
              <div className="flex text-accent-gold">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={10} 
                    className={`${i < Math.floor(product.rating || 5) ? 'fill-accent-gold text-accent-gold star-glow' : 'text-slate-200'}`} 
                  />
                ))}
              </div>
              <span className="text-[9px] font-bold ml-0.5 text-slate-500">
                ({product.rating || '5.0'})
              </span>
            </div>
          </div>

          {/* Pricing & Capsule Button */}
          <div className="mt-3">
            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-[10px] font-bold text-slate-450 uppercase">Valuation</span>
              <div className="flex items-baseline gap-1.5">
                {hasDiscount && (
                  <span className="text-[10px] text-slate-400 font-medium line-through">
                    ₹{product.price}
                  </span>
                )}
                <span className="text-sm font-black text-orange-550 drop-shadow-[0_0_4px_rgba(255,140,0,0.15)] text-glow-orange">
                  ₹{product.final_price || product.price}
                </span>
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`mt-3 w-full py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                product.stock <= 0
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-transparent hover:text-white hover:bg-gradient-to-r hover:from-orange-550 hover:to-red-600 hover:shadow-[0_0_15px_rgba(255,140,0,0.3)]'
              }`}
            >
              {product.stock <= 0 ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ProductCard;
