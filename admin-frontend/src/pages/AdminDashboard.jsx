import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AdminNavbar from '../components/AdminNavbar';
import AdminFooter from '../components/AdminFooter';
import SupportTicketsManager from '../components/SupportTicketsManager';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  LayoutDashboard, ShoppingBag, FolderOpen, ClipboardList, Users, FileBarChart, 
  TrendingUp, Users2, ShieldAlert, BadgePercent, Download, Plus, Pencil, Trash2, CheckCircle, XCircle, RefreshCw, MessageSquare
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Route security check
  useEffect(() => {
    if (!user) {
      navigate('/');
    } else if (!user.is_admin) {
      navigate('/');
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState('overview');

  // Stats and analytical states
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Products CRUD states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', slug: '', category: '', price: '', discount: 0, stock: 10, SKU: '', description: '', image_url: ''
  });

  // Category CRUD states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '', slug: '', description: '', image_url: ''
  });

  // Heroes CRUD states
  const [heroes, setHeroes] = useState([]);
  const [loadingHeroes, setLoadingHeroes] = useState(false);
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [editingHero, setEditingHero] = useState(null);
  const [heroForm, setHeroForm] = useState({
    hero_id: '', name: '', image_url: ''
  });

  // Banners CRUD states
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerForm, setBannerForm] = useState({
    title: '', subtitle: '', banner_type: 'hero_vault', image_url: '', button_text: 'Shop Now', link_url: '/shop', is_active: true
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Custom Alert / Confirm Modal States
  const [customAlert, setCustomAlert] = useState({ show: false, message: '', type: 'info' });
  const [customConfirm, setCustomConfirm] = useState({ show: false, message: '', onConfirm: null, onCancel: null });

  const triggerAlert = (message, type = 'info') => {
    setCustomAlert({ show: true, message, type });
    if (type !== 'error') {
      setTimeout(() => {
        setCustomAlert(prev => prev.message === message ? { ...prev, show: false } : prev);
      }, 3000);
    }
  };

  const triggerConfirm = (message, onConfirm) => {
    setCustomConfirm({
      show: true,
      message,
      onConfirm: () => {
        setCustomConfirm(prev => ({ ...prev, show: false }));
        onConfirm();
      },
      onCancel: () => {
        setCustomConfirm(prev => ({ ...prev, show: false }));
      }
    });
  };

  // Orders control states
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Customers states
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Initial loads
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('dashboard/stats/');
      setStats(res.data);
    } catch (e) {
      console.error('Error fetching dashboard stats:', e);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchProductsAndCategories = async () => {
    try {
      const prodRes = await api.get('products/items/');
      setProducts(prodRes.data.results || prodRes.data);
      
      const catRes = await api.get('products/categories/');
      setCategories(catRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.get('orders/history/');
      setOrders(res.data.results || res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const res = await api.get('dashboard/customers/');
      setCustomers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchBanners = async () => {
    setLoadingBanners(true);
    try {
      const res = await api.get('products/banners/');
      setBanners(res.data);
    } catch (e) {
      console.error('Error fetching banners:', e);
    } finally {
      setLoadingBanners(false);
    }
  };

  const fetchHeroes = async () => {
    setLoadingHeroes(true);
    try {
      const res = await api.get('products/hero-avatars/');
      setHeroes(res.data);
    } catch (e) {
      console.error('Error fetching heroes:', e);
    } finally {
      setLoadingHeroes(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchProductsAndCategories();
    fetchOrders();
    fetchCustomers();
    fetchBanners();
    fetchHeroes();
  }, []);

  const handleOpenAddBannerModal = () => {
    setEditingBanner(null);
    setBannerForm({
      title: 'Unleash Your Inner Hero!',
      subtitle: 'Premium Multiverse Gear for Champions',
      banner_type: 'hero_vault',
      image_url: '',
      button_text: 'Shop Now',
      link_url: '/shop',
      is_active: true
    });
    setShowBannerModal(true);
  };

  const handleOpenEditBannerModal = (banner) => {
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title,
      subtitle: banner.subtitle || '',
      banner_type: banner.banner_type,
      image_url: banner.image_url || '',
      button_text: banner.button_text,
      link_url: banner.link_url,
      is_active: banner.is_active
    });
    setShowBannerModal(true);
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await api.put(`products/banners/${editingBanner.id}/`, bannerForm);
        triggerAlert('Banner updated successfully.', 'success');
      } else {
        await api.post('products/banners/', bannerForm);
        triggerAlert('Banner created successfully.', 'success');
      }
      setShowBannerModal(false);
      fetchBanners();
    } catch (err) {
      triggerAlert('Failed to save banner.', 'error');
    }
  };

  const handleDeleteBanner = (id) => {
    triggerConfirm('Delete this banner permanently?', async () => {
      try {
        await api.delete(`products/banners/${id}/`);
        triggerAlert('Banner deleted successfully.', 'success');
        fetchBanners();
      } catch (e) {
        triggerAlert('Failed to delete banner.', 'error');
      }
    });
  };

  const handleFileUpload = async (e, formType) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await api.post('products/items/upload_image/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const uploadedUrl = res.data.image_url;
      if (formType === 'product') {
        setProductForm(prev => ({ ...prev, image_url: uploadedUrl }));
      } else if (formType === 'banner') {
        setBannerForm(prev => ({ ...prev, image_url: uploadedUrl, banner_type: 'custom' }));
      } else if (formType === 'category') {
        setCategoryForm(prev => ({ ...prev, image_url: uploadedUrl }));
      } else if (formType === 'category_banner') {
        setCategoryForm(prev => ({ ...prev, banner_url: uploadedUrl }));
      } else if (formType === 'hero') {
        setHeroForm(prev => ({ ...prev, image_url: uploadedUrl }));
      } else if (formType === 'hero_video') {
        setHeroForm(prev => ({ ...prev, video_url: uploadedUrl }));
      }
      triggerAlert('File uploaded successfully.', 'success');
    } catch (err) {
      console.error('Image upload failed:', err);
      triggerAlert('Failed to upload image. Please ensure you are logged in as admin.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Product helper slugify
  const handleNameChange = (e) => {
    const nameVal = e.target.value;
    const slugVal = nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setProductForm({ ...productForm, name: nameVal, slug: slugVal });
  };

  // Product CRUD Handlers
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '', slug: '', category: categories[0]?.id || '', price: '', discount: 0, stock: 10, SKU: '', description: '', image_url: ''
    });
    setShowProductModal(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      slug: prod.slug,
      category: prod.category,
      price: prod.price,
      discount: prod.discount,
      stock: prod.stock,
      SKU: prod.SKU,
      description: prod.description,
      image_url: prod.image_url
    });
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Edit Product API
        await api.put(`products/items/${editingProduct.slug}/`, productForm);
        triggerAlert('Product details updated in the database.', 'success');
      } else {
        // Add Product API
        await api.post('products/items/', productForm);
        triggerAlert('New Product enlisted successfully.', 'success');
      }
      setShowProductModal(false);
      fetchProductsAndCategories();
      fetchStats();
    } catch (err) {
      const errMsg = err.response?.data ? Object.values(err.response.data).flat().join(' ') : 'Product CRUD operation failed.';
      triggerAlert(errMsg, 'error');
    }
  };

  const handleDeleteProduct = (slug) => {
    triggerConfirm('Erase this product record permanently?', async () => {
      try {
        await api.delete(`products/items/${slug}/`);
        triggerAlert('Product erased.', 'success');
        fetchProductsAndCategories();
        fetchStats();
      } catch (e) {
        triggerAlert('Failed to delete product.', 'error');
      }
    });
  };

  // Category CRUD Handlers
  const handleOpenAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', slug: '', description: '', image_url: '', banner_url: '' });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, slug: cat.slug, description: cat.description || '', image_url: cat.image_url || '', banner_url: cat.banner_url || '' });
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`products/categories/${editingCategory.slug}/`, categoryForm);
        triggerAlert('Category updated successfully!', 'success');
      } else {
        await api.post('products/categories/', categoryForm);
        triggerAlert('Category added successfully!', 'success');
      }
      setShowCategoryModal(false);
      fetchProductsAndCategories();
    } catch (err) {
      triggerAlert('Failed to save category.', 'error');
    }
  };

  const handleDeleteCategory = (slug) => {
    triggerConfirm('Are you sure you want to delete this category?', async () => {
      try {
        await api.delete(`products/categories/${slug}/`);
        triggerAlert('Category deleted successfully!', 'success');
        fetchProductsAndCategories();
      } catch (err) {
        triggerAlert('Failed to delete category.', 'error');
      }
    });
  };

  // Hero CRUD Handlers
  const handleOpenAddHeroModal = () => {
    setEditingHero(null);
    setHeroForm({ 
      hero_id: '', name: '', image_url: '', video_url: '', 
      description: '', theme_color: '#8b5cf6', audio_cue: 'System interface initialized. Systems online.', product_slugs: ''
    });
    setShowHeroModal(true);
  };

  const handleEditHero = (hero) => {
    setEditingHero(hero);
    setHeroForm({ 
      hero_id: hero.hero_id, name: hero.name, image_url: hero.image_url || '', video_url: hero.video_url || '',
      description: hero.description || '', theme_color: hero.theme_color || '#8b5cf6', audio_cue: hero.audio_cue || 'System interface initialized. Systems online.', product_slugs: hero.product_slugs || ''
    });
    setShowHeroModal(true);
  };

  const handleHeroSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHero) {
        await api.put(`products/hero-avatars/${editingHero.hero_id}/`, heroForm);
        triggerAlert('Hero updated successfully!', 'success');
      } else {
        await api.post('products/hero-avatars/', heroForm);
        triggerAlert('Hero added successfully!', 'success');
      }
      setShowHeroModal(false);
      fetchHeroes();
    } catch (err) {
      triggerAlert('Failed to save hero.', 'error');
    }
  };

  const handleDeleteHero = (hero_id) => {
    triggerConfirm('Are you sure you want to delete this hero?', async () => {
      try {
        await api.delete(`products/hero-avatars/${hero_id}/`);
        triggerAlert('Hero deleted successfully!', 'success');
        fetchHeroes();
      } catch (err) {
        triggerAlert('Failed to delete hero.', 'error');
      }
    });
  };

  // Order status action handlers
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`orders/history/${orderId}/update_status/`, { status: newStatus });
      fetchOrders();
      fetchStats();
      triggerAlert(`Order status updated to: ${newStatus}`, 'success');
    } catch (e) {
      triggerAlert('Failed to update status.', 'error');
    }
  };

  const handleBlockCustomer = async (customerId, action) => {
    try {
      await api.post('dashboard/customers/', { customer_id: customerId, action });
      fetchCustomers();
      triggerAlert(`Customer account status updated: ${action}ed`, 'success');
    } catch (e) {
      triggerAlert('Failed to adjust customer status.', 'error');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await api.get('dashboard/reports/sales/', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'superhero_sales_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      triggerAlert('Sales statement spreadsheet downloaded successfully.', 'success');
    } catch (e) {
      triggerAlert('Failed to export sales spreadsheet. Please try again.', 'error');
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#faf9ff] to-[#f4f3ff] text-slate-800 min-h-screen flex flex-col font-sans pt-20">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="p-4 bg-white/80 border border-slate-200 shadow-sm rounded-2xl space-y-1 backdrop-blur-md">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'overview' ? 'bg-secondary text-white font-black shadow-md shadow-purple-500/20' : 'text-slate-600 hover:text-slate-850 hover:bg-slate-100/80'
              }`}
            >
              <LayoutDashboard size={16} /> Overview Analytics
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full text-left px-4 py-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'products' ? 'bg-secondary text-white font-black shadow-md shadow-purple-500/20' : 'text-slate-600 hover:text-slate-850 hover:bg-slate-100/80'
              }`}
            >
              <ShoppingBag size={16} /> Products Catalog
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full text-left px-4 py-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'categories' ? 'bg-secondary text-white font-black shadow-md shadow-purple-500/20' : 'text-slate-600 hover:text-slate-850 hover:bg-slate-100/80'
              }`}
            >
              <FolderOpen size={16} /> Categories Manager
            </button>

            <button
              onClick={() => setActiveTab('heroes')}
              className={`w-full text-left px-4 py-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'heroes' ? 'bg-secondary text-white font-black shadow-md shadow-purple-500/20' : 'text-slate-600 hover:text-slate-850 hover:bg-slate-100/80'
              }`}
            >
              <Users2 size={16} /> Hero Avatars
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'orders' ? 'bg-secondary text-white font-black shadow-md shadow-purple-500/20' : 'text-slate-600 hover:text-slate-850 hover:bg-slate-100/80'
              }`}
            >
              <ClipboardList size={16} /> Orders Manager
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full text-left px-4 py-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'customers' ? 'bg-secondary text-white font-black shadow-md shadow-purple-500/20' : 'text-slate-600 hover:text-slate-850 hover:bg-slate-100/80'
              }`}
            >
              <Users size={16} /> Customers Manager
            </button>

            <button
              onClick={() => setActiveTab('banners')}
              className={`w-full text-left px-4 py-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'banners' ? 'bg-secondary text-white font-black shadow-md shadow-purple-500/20' : 'text-slate-600 hover:text-slate-850 hover:bg-slate-100/80'
              }`}
            >
              <BadgePercent size={16} /> Banners Manager
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full text-left px-4 py-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'reports' ? 'bg-secondary text-white font-black shadow-md shadow-purple-500/20' : 'text-slate-600 hover:text-slate-850 hover:bg-slate-100/80'
              }`}
            >
              <FileBarChart size={16} /> HQ Sales Reports
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`w-full text-left px-4 py-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'support' ? 'bg-secondary text-white font-black shadow-md shadow-purple-500/20' : 'text-slate-600 hover:text-slate-850 hover:bg-slate-100/80'
              }`}
            >
              <MessageSquare size={16} /> Support Tickets
            </button>
          </div>
        </aside>

        {/* Dashboard Panels */}
        <section className="flex-1 p-8 bg-white/70 border border-slate-200/85 shadow-md rounded-2xl overflow-x-auto backdrop-blur-md">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-3 flex items-center gap-2 font-display">
                <LayoutDashboard className="text-secondary" /> Multiverse Overview Console
              </h2>

              {loadingStats ? (
                <div className="py-20 flex justify-center"><RefreshCw className="animate-spin text-secondary" /></div>
              ) : stats ? (
                <>
                  {/* Stats card Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-5 bg-slate-50/50 border border-slate-200 rounded-2xl shadow-inner">
                      <p className="text-[10px] text-slate-450 font-bold uppercase tracking-widest flex items-center gap-1.5"><TrendingUp size={12} className="text-emerald-600" /> Today's Sales</p>
                      <p className="text-lg font-mono font-black text-slate-800 mt-1">₹{stats.today_sales}</p>
                    </div>

                    <div className="p-5 bg-slate-50/50 border border-slate-200 rounded-2xl shadow-inner">
                      <p className="text-[10px] text-slate-455 font-bold uppercase tracking-widest flex items-center gap-1.5"><TrendingUp size={12} className="text-emerald-600" /> Total Revenue</p>
                      <p className="text-lg font-mono font-black text-slate-800 mt-1">₹{stats.total_revenue}</p>
                    </div>

                    <div className="p-5 bg-slate-50/50 border border-slate-200 rounded-2xl shadow-inner">
                      <p className="text-[10px] text-slate-455 font-bold uppercase tracking-widest flex items-center gap-1.5"><BadgePercent size={12} className="text-secondary" /> Profit (40% Marg.)</p>
                      <p className="text-lg font-mono font-black text-secondary mt-1">₹{stats.total_profit?.toFixed(2)}</p>
                    </div>

                    <div className="p-5 bg-slate-50/50 border border-slate-200 rounded-2xl shadow-inner">
                      <p className="text-[10px] text-slate-455 font-bold uppercase tracking-widest flex items-center gap-1.5"><ShieldAlert size={12} className="text-accent-red animate-pulse" /> Out of stock</p>
                      <p className="text-lg font-mono font-black text-accent-red mt-1">{stats.out_of_stock_count} Items</p>
                    </div>
                  </div>

                  {/* Graphical Charts (Recharts) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white border border-slate-200 rounded-2xl h-[300px] shadow-inner">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Daily Sales Analytics (Last 7 Days)</h4>
                      <ResponsiveContainer width="100%" height="90%">
                        <AreaChart data={stats.chart_data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '10px' }} />
                          <YAxis stroke="#6b7280" style={{ fontSize: '10px' }} />
                          <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                          <Area type="monotone" dataKey="sales" stroke="#bd00ff" fill="rgba(189, 0, 255, 0.08)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="p-6 bg-white border border-slate-200 rounded-2xl h-[300px] shadow-inner">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Daily Orders Volume</h4>
                      <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={stats.chart_data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '10px' }} />
                          <YAxis stroke="#6b7280" style={{ fontSize: '10px' }} />
                          <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                          <Bar dataKey="orders" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top selling table and warnings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Top Products */}
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Top Selling Armaments</h4>
                      <div className="space-y-3 font-bold">
                        {stats.top_products.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-slate-600">{idx+1}. {item.name} <span className="text-[10px] text-slate-400">x{item.sales_count}</span></span>
                            <span className="font-mono text-slate-850">₹{item.revenue}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Low Stock alerts */}
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between shadow-sm">
                      <div>
                        <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2 flex items-center gap-1.5"><ShieldAlert size={14} /> Low Inventory warning</h4>
                        <div className="text-xs font-bold space-y-2 text-slate-600">
                          <p>Database shows <span className="text-amber-600 font-black">{stats.low_stock_count} products</span> are running low on core ammunition reserves (&le;5 units).</p>
                          <p>Coordinate replenishment quickly to avoid defender deployment failures.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('products')} 
                        className="mt-6 w-full py-2 bg-white border border-slate-200 hover:border-amber-500 text-slate-500 hover:text-amber-600 font-bold text-[10px] uppercase rounded-xl transition-all cursor-pointer shadow-sm"
                      >
                        Inventory Restock Hub
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h2 className="text-xl font-black text-slate-850 uppercase tracking-wider flex items-center gap-2 font-display">
                  <ShoppingBag className="text-secondary" /> Enlisted Armaments
                </h2>
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2.5 bg-secondary text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:scale-105 transition-transform flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Enlist Product
                </button>
              </div>

              {/* Products listing table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-widest text-[10px]">
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4">SKU Code</th>
                      <th className="py-3 px-4">Regular price</th>
                      <th className="py-3 px-4">Disc%</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => (
                      <tr key={prod.id} className="border-b border-slate-200/80 hover:bg-slate-55/65 transition-colors font-bold text-slate-800">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img src={prod.image_url} alt="" className="w-9 h-9 object-cover rounded-lg border border-slate-200 shadow-sm" />
                          <div>
                            <p className="text-slate-850 text-xs">{prod.name}</p>
                            <p className="text-[10px] text-slate-450 uppercase">{prod.category_name}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono uppercase text-slate-500">{prod.SKU}</td>
                        <td className="py-3 px-4 font-mono text-slate-850">₹{prod.price}</td>
                        <td className="py-3 px-4 text-amber-600">{prod.discount}%</td>
                        <td className="py-3 px-4">
                          <span className={`${prod.stock <= 0 ? 'text-red-500' : prod.stock <= 5 ? 'text-amber-500' : 'text-emerald-600'}`}>
                            {prod.stock} Units
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleOpenEditModal(prod)} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:border-slate-400 cursor-pointer"><Pencil size={12} /></button>
                            <button onClick={() => handleDeleteProduct(prod.slug)} className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-650 hover:bg-red-500 hover:text-white hover:border-transparent cursor-pointer"><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-slate-850 uppercase tracking-wider border-b border-slate-200 pb-3 flex items-center gap-2 font-display">
                <ClipboardList className="text-secondary" /> Master Orders Manager
              </h2>

              {loadingOrders ? (
                <div className="py-20 flex justify-center"><RefreshCw className="animate-spin text-secondary" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-medium border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-widest text-[10px]">
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Acquirer details</th>
                        <th className="py-3 px-4">Grand Total</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Approve / Cancel Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => (
                        <tr key={ord.id} className="border-b border-slate-200/80 hover:bg-slate-55/65 transition-colors font-bold text-slate-800">
                          <td className="py-3 px-4 font-mono text-slate-850">#00{ord.id}</td>
                          <td className="py-3 px-4 text-slate-500">{new Date(ord.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <p className="text-slate-800 text-xs">{ord.full_name}</p>
                            <p className="text-[10px] text-slate-450">{ord.email}</p>
                          </td>
                          <td className="py-3 px-4 font-mono text-cyan-600 font-black">₹{ord.grand_total}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded-lg border text-[9px] uppercase tracking-wider font-black ${
                              ord.status === 'Delivered' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                              ord.status === 'Cancelled' ? 'bg-red-50 border-red-200 text-red-600' :
                              'bg-amber-50 border-amber-200 text-amber-600'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-2">
                              {ord.status === 'Pending' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(ord.id, 'Packed')}
                                  className="px-2 py-1 bg-emerald-50 border border-emerald-200 hover:bg-emerald-500 hover:text-white hover:border-transparent rounded-lg text-[10px] text-emerald-600 font-bold uppercase cursor-pointer"
                                >
                                  Pack Item
                                </button>
                              )}
                              {ord.status === 'Packed' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(ord.id, 'Shipped')}
                                  className="px-2 py-1 bg-cyan-50 border border-cyan-200 hover:bg-cyan-500 hover:text-white hover:border-transparent rounded-lg text-[10px] text-cyan-600 font-bold uppercase cursor-pointer"
                                >
                                  Ship Item
                                </button>
                              )}
                              {ord.status === 'Shipped' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(ord.id, 'Delivered')}
                                  className="px-2 py-1 bg-emerald-50 border border-emerald-200 hover:bg-emerald-500 hover:text-white hover:border-transparent rounded-lg text-[10px] text-emerald-600 font-bold uppercase cursor-pointer"
                                >
                                  Deliver
                                </button>
                              )}
                              {ord.status !== 'Delivered' && ord.status !== 'Cancelled' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(ord.id, 'Cancelled')}
                                  className="px-2 py-1 bg-red-50 border border-red-200 hover:bg-red-500 hover:text-white hover:border-transparent rounded-lg text-[10px] text-red-550 font-bold uppercase cursor-pointer"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-slate-850 uppercase tracking-wider border-b border-slate-200 pb-3 flex items-center gap-2 font-display">
                <Users className="text-secondary" /> Registered defenders List
              </h2>

              {loadingCustomers ? (
                <div className="py-20 flex justify-center"><RefreshCw className="animate-spin text-secondary" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-medium border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-widest text-[10px]">
                        <th className="py-3 px-4">Codename</th>
                        <th className="py-3 px-4">Frequency Email</th>
                        <th className="py-3 px-4">Logged spent</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Security controls</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((cust) => (
                        <tr key={cust.id} className="border-b border-slate-200/80 hover:bg-slate-55/65 transition-colors font-bold text-slate-800">
                          <td className="py-3 px-4 text-slate-850 uppercase flex items-center gap-2"><Users2 size={14} className="text-cyan-600" /> {cust.username}</td>
                          <td className="py-3 px-4 text-slate-500">{cust.email}</td>
                          <td className="py-3 px-4 font-mono text-cyan-600 font-black">₹{cust.total_spent?.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-black ${
                              cust.is_active ? 'bg-emerald-50 border-emerald-250 text-emerald-600' : 'bg-red-50 border-red-250 text-red-650'
                            }`}>
                              {cust.is_active ? 'Active' : 'BLOCKED'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-2">
                              {cust.is_active ? (
                                <button
                                  onClick={() => handleBlockCustomer(cust.id, 'block')}
                                  className="px-2 py-1.5 bg-red-50 border border-red-200 hover:bg-red-500 hover:text-white rounded-lg text-[9px] text-red-550 font-bold uppercase cursor-pointer"
                                >
                                  Block Customer
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleBlockCustomer(cust.id, 'unblock')}
                                  className="px-2 py-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-500 hover:text-white rounded-lg text-[9px] text-emerald-650 font-bold uppercase cursor-pointer"
                                >
                                  Unblock
                                </button>
                              )}
                              <button
                                  onClick={() => handleBlockCustomer(cust.id, 'delete')}
                                className="px-2 py-1.5 bg-slate-100 border border-slate-200 text-slate-550 hover:bg-slate-200 hover:text-slate-800 rounded-lg text-[9px] font-bold uppercase cursor-pointer"
                              >
                                Delete Record
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-slate-850 uppercase tracking-wider border-b border-slate-200 pb-3 flex items-center gap-2 font-display">
                <FileBarChart className="text-secondary" /> Sales aggregation & reports
              </h2>

              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 max-w-xl font-bold shadow-sm">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Export sales statement</h4>
                <p className="text-xs text-slate-500">
                  Export complete order history database, totals summaries, and shipping details as a formatted MS Excel sheet.
                </p>
                <button
                  onClick={handleDownloadExcel}
                  className="px-6 py-3 bg-secondary text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-purple-500/20"
                >
                  <Download size={16} /> Export Excel Spreadsheet
                </button>
              </div>
            </div>
          )}

          {activeTab === 'banners' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h2 className="text-xl font-black text-slate-850 uppercase tracking-wider flex items-center gap-2 font-display">
                  <BadgePercent className="text-secondary" /> Banners manager
                </h2>
                <button
                  onClick={handleOpenAddBannerModal}
                  className="px-4 py-2.5 bg-secondary text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:scale-105 transition-transform flex items-center gap-1 cursor-pointer shadow-md"
                >
                  <Plus size={14} /> Add Banner
                </button>
              </div>

              {loadingBanners ? (
                <div className="py-20 flex justify-center"><RefreshCw className="animate-spin text-secondary" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-medium border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-650 uppercase tracking-widest text-[10px]">
                        <th className="py-3 px-4">Banner Details</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Link URL</th>
                        <th className="py-3 px-4">Button Text</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {banners.map((banner) => (
                        <tr key={banner.id} className="border-b border-slate-200 hover:bg-slate-55/65 transition-colors font-bold font-sans text-slate-800">
                          <td className="py-3 px-4">
                            <p className="text-slate-800 text-xs">{banner.title}</p>
                            <p className="text-[10px] text-slate-450">{banner.subtitle || 'No subtitle'}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-600 capitalize">
                              {banner.banner_type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">{banner.link_url}</td>
                          <td className="py-3 px-4 text-slate-600">{banner.button_text}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded-lg border text-[9px] uppercase tracking-wider font-black ${
                              banner.is_active ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-600'
                            }`}>
                              {banner.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleOpenEditBannerModal(banner)} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:border-slate-400 cursor-pointer"><Pencil size={12} /></button>
                              <button onClick={() => handleDeleteBanner(banner.id)} className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-650 hover:bg-red-500 hover:text-white hover:border-transparent cursor-pointer"><Trash2 size={12} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 font-display">
                  <FolderOpen className="text-secondary" /> Category Departments
                </h2>
                <button
                  onClick={handleOpenAddCategoryModal}
                  className="px-5 py-2.5 bg-secondary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
                >
                  <Plus size={14} /> Add Category
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase font-black tracking-widest text-slate-455">
                      <th className="py-3 px-4 font-bold">Category Name</th>
                      <th className="py-3 px-4 font-bold">Slug</th>
                      <th className="py-3 px-4 font-bold">Image URL</th>
                      <th className="py-3 px-4 text-center font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.id} className="border-b border-slate-105 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-xs text-slate-800">{cat.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-500 text-xs">{cat.slug}</td>
                        <td className="py-3 px-4 text-xs">
                          {cat.image_url ? (
                            <img src={cat.image_url} alt={cat.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <span className="text-slate-400">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleEditCategory(cat)} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:border-slate-400 cursor-pointer"><Pencil size={12} /></button>
                            <button onClick={() => handleDeleteCategory(cat.slug)} className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-650 hover:bg-red-500 hover:text-white hover:border-transparent cursor-pointer"><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'heroes' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 font-display">
                  <Users2 className="text-secondary" /> Hero Avatars
                </h2>
                <button
                  onClick={handleOpenAddHeroModal}
                  className="px-5 py-2.5 bg-secondary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
                >
                  <Plus size={14} /> Add Hero
                </button>
              </div>

              {loadingHeroes ? (
                <div className="py-20 flex justify-center"><RefreshCw className="animate-spin text-secondary" /></div>
              ) : heroes.length === 0 ? (
                <div className="text-center py-16 bg-slate-50/50 border border-slate-200 rounded-2xl">
                  <Users2 size={32} className="mx-auto text-slate-300 mb-3" />
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider">No hero avatars found</h3>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] uppercase font-black tracking-widest text-slate-455">
                        <th className="py-3 px-4 font-bold">Hero Info</th>
                        <th className="py-3 px-4 font-bold">Hero ID</th>
                        <th className="py-3 px-4 font-bold">Avatar Image</th>
                        <th className="py-3 px-4 text-center font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {heroes.map((hero) => (
                        <tr key={hero.id} className="border-b border-slate-105 hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <p className="text-slate-800 text-xs font-bold">{hero.name}</p>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500 text-xs">{hero.hero_id}</td>
                          <td className="py-3 px-4 text-xs">
                            {hero.image_url ? (
                              <img src={hero.image_url} alt={hero.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                            ) : (
                              <span className="text-slate-400">None</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleEditHero(hero)} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:border-slate-400 cursor-pointer"><Pencil size={12} /></button>
                              <button onClick={() => handleDeleteHero(hero.hero_id)} className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-650 hover:bg-red-500 hover:text-white hover:border-transparent cursor-pointer"><Trash2 size={12} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'support' && (
            <SupportTicketsManager triggerAlert={triggerAlert} />
          )}

        </section>

      </div>

      {/* Category CRUD Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto font-sans">
          <div className="w-full max-w-lg bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider font-display">
                {editingCategory ? `Modify Category: ${editingCategory.name}` : 'Create New Category'}
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4 font-bold text-left text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => {
                      const nameVal = e.target.value;
                      const slugVal = nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setCategoryForm({ ...categoryForm, name: nameVal, slug: slugVal });
                    }}
                    placeholder="e.g. Weapons"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    className="w-full bg-slate-55/65 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Category Image (Upload)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={categoryForm.image_url}
                    onChange={(e) => setCategoryForm({ ...categoryForm, image_url: e.target.value })}
                    placeholder="Image URL or upload..."
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-850 font-bold"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-secondary to-pink-500 hover:shadow-lg text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer select-none transition-all active:scale-95">
                    {uploadingImage ? '...' : 'Upload'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, 'category')} 
                      className="hidden" 
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Banner Image (Upload)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={categoryForm.banner_url}
                    onChange={(e) => setCategoryForm({ ...categoryForm, banner_url: e.target.value })}
                    placeholder="Banner URL or upload..."
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-850 font-bold"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-secondary to-pink-500 hover:shadow-lg text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer select-none transition-all active:scale-95">
                    {uploadingImage ? '...' : 'Upload'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, 'category_banner')} 
                      className="hidden" 
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-2 justify-end">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-slate-400 transition-colors cursor-pointer">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer hover:scale-105 transition-transform">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hero Avatar CRUD Modal */}
      {showHeroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto font-sans">
          <div className="w-full max-w-lg bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider font-display">
                {editingHero ? `Modify Hero: ${editingHero.name}` : 'Add New Hero Avatar'}
              </h3>
              <button onClick={() => setShowHeroModal(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleHeroSubmit} className="space-y-4 font-bold text-left text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1">Hero Name</label>
                  <input
                    type="text"
                    required
                    value={heroForm.name}
                    onChange={(e) => setHeroForm({ ...heroForm, name: e.target.value })}
                    placeholder="e.g. Iron Man"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1">Hero ID</label>
                  <input
                    type="text"
                    required
                    value={heroForm.hero_id}
                    onChange={(e) => setHeroForm({ ...heroForm, hero_id: e.target.value })}
                    placeholder="e.g. ironman"
                    className="w-full bg-slate-55/65 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-600 font-bold"
                  />
                  <p className="text-[9px] text-slate-500 font-normal mt-1">Must match 'ironman' or 'spiderman' for the navbar</p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Description</label>
                <textarea
                  required
                  value={heroForm.description}
                  onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                  placeholder="e.g. Stark Industries heavy-tactical armament system..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Theme Color (Hex)</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={heroForm.theme_color}
                      onChange={(e) => setHeroForm({ ...heroForm, theme_color: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      required
                      value={heroForm.theme_color}
                      onChange={(e) => setHeroForm({ ...heroForm, theme_color: e.target.value })}
                      placeholder="#ef4444"
                      className="flex-1 bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-800 font-bold uppercase"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Audio Cue Text</label>
                  <input
                    type="text"
                    required
                    value={heroForm.audio_cue}
                    onChange={(e) => setHeroForm({ ...heroForm, audio_cue: e.target.value })}
                    placeholder="e.g. System interface initialized..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Product Slugs</label>
                <div className="h-40 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 p-2 space-y-1">
                  {products.map(p => {
                    const slugsArray = heroForm.product_slugs ? heroForm.product_slugs.split(',').map(s=>s.trim()) : [];
                    const isChecked = slugsArray.includes(p.slug);
                    const toggleSlug = () => {
                      let newSlugs = [...slugsArray];
                      if (isChecked) newSlugs = newSlugs.filter(s => s !== p.slug);
                      else newSlugs.push(p.slug);
                      setHeroForm({...heroForm, product_slugs: newSlugs.filter(Boolean).join(', ')});
                    };
                    return (
                      <label key={p.id} className="flex items-center gap-2 text-[10px] text-slate-700 font-medium cursor-pointer p-1.5 hover:bg-slate-100 rounded">
                        <input type="checkbox" checked={isChecked} onChange={toggleSlug} className="rounded text-secondary focus:ring-secondary" />
                        {p.name} <span className="text-slate-400">({p.slug})</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[9px] text-slate-500 font-normal mt-1">Comma-separated product slugs that will appear in this hero's portal.</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Avatar Image (Upload)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={heroForm.image_url}
                    onChange={(e) => setHeroForm({ ...heroForm, image_url: e.target.value })}
                    placeholder="Image URL or upload..."
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-850 font-bold"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-secondary to-pink-500 hover:shadow-lg text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer select-none transition-all active:scale-95">
                    {uploadingImage ? '...' : 'Upload'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, 'hero')} 
                      className="hidden" 
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Background Video (Upload)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={heroForm.video_url}
                    onChange={(e) => setHeroForm({ ...heroForm, video_url: e.target.value })}
                    placeholder="Video URL or upload..."
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-850 font-bold"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-secondary to-pink-500 hover:shadow-lg text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer select-none transition-all active:scale-95">
                    {uploadingImage ? '...' : 'Upload'}
                    <input 
                      type="file" 
                      accept="video/*" 
                      onChange={(e) => handleFileUpload(e, 'hero_video')} 
                      className="hidden" 
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-2 justify-end">
                <button type="button" onClick={() => setShowHeroModal(false)} className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-slate-400 transition-colors cursor-pointer">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer hover:scale-105 transition-transform">Save Hero Avatar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product CRUD Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto font-sans">
          <div className="w-full max-w-2xl bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider font-display">
                {editingProduct ? `Modify Armament: ${editingProduct.name}` : 'Enlist New Armament'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 font-bold text-left text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={handleNameChange}
                    placeholder="Spider Nano Battle Suit"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1">Product Slug</label>
                  <input
                    type="text"
                    required
                    value={productForm.slug}
                    onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                    className="w-full bg-slate-55/65 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-600 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Category Department</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-800 font-bold cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">SKU coordinate code</label>
                  <input
                    type="text"
                    required
                    value={productForm.SKU}
                    onChange={(e) => setProductForm({ ...productForm, SKU: e.target.value })}
                    placeholder="SH-SPDR-NANO"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={productForm.discount}
                    onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Ammunition reserves (Stock)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Image (URL or Local Upload)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-... or Upload"
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-850 font-bold"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-secondary to-pink-500 hover:shadow-lg text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer select-none transition-all active:scale-95">
                    {uploadingImage ? '...' : 'Upload'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, 'product')} 
                      className="hidden" 
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Functional Description</label>
                <textarea
                  required
                  rows="3"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                />
              </div>

              <div className="flex gap-4 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-slate-400 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer hover:scale-105 transition-transform"
                >
                  Save Armament
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Banner CRUD Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto font-sans">
          <div className="w-full max-w-lg bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider font-display">
                {editingBanner ? `Modify Banner: ${editingBanner.title}` : 'Add New Banner'}
              </h3>
              <button onClick={() => setShowBannerModal(false)} className="text-slate-450 hover:text-slate-655 cursor-pointer">
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleBannerSubmit} className="space-y-4 font-bold text-left text-slate-700">
              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Banner Title</label>
                <input
                  type="text"
                  required
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  placeholder="Unleash Your Inner Hero!"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Subtitle / Description</label>
                <input
                  type="text"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  placeholder="Premium Multiverse Gear for Champions"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Banner Type</label>
                  <select
                    value={bannerForm.banner_type}
                    onChange={(e) => setBannerForm({ ...bannerForm, banner_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-800 font-bold cursor-pointer"
                  >
                    <option value="hero_vault">Hero Vault Preset (Spider-Man)</option>
                    <option value="avengers">Avengers Preset (Iron Man)</option>
                    <option value="custom">Custom URL Banner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Active Status</label>
                  <div className="flex items-center mt-2.5">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={bannerForm.is_active}
                      onChange={(e) => setBannerForm({ ...bannerForm, is_active: e.target.checked })}
                      className="w-4 h-4 rounded text-secondary focus:ring-secondary border-slate-200 bg-slate-50"
                    />
                    <label htmlFor="is_active" className="ml-2 text-xs text-slate-500 select-none cursor-pointer">Display on Homepage</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Banner Image (URL or Local Upload)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={bannerForm.image_url}
                    onChange={(e) => setBannerForm({ ...bannerForm, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-... or Upload"
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-850 font-bold"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-secondary to-pink-500 hover:shadow-lg text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer select-none transition-all active:scale-95">
                    {uploadingImage ? '...' : 'Upload'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, 'banner')} 
                      className="hidden" 
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Button Text</label>
                  <input
                    type="text"
                    required
                    value={bannerForm.button_text}
                    onChange={(e) => setBannerForm({ ...bannerForm, button_text: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Target Link URL</label>
                  <input
                    type="text"
                    required
                    value={bannerForm.link_url}
                    onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-secondary focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-slate-400 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer hover:scale-105 transition-transform"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Alert Overlay/Toast */}
      <AnimatePresence>
        {customAlert.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-full bg-white/95 backdrop-blur-md border border-slate-200/80 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in"
          >
            <div className={`p-2 rounded-xl flex-shrink-0 ${
              customAlert.type === 'success' ? 'bg-emerald-50 text-emerald-500' :
              customAlert.type === 'error' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'
            }`}>
              <CheckCircle size={18} />
            </div>
            <div className="flex-grow text-left">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {customAlert.type === 'success' ? 'Notification' :
                 customAlert.type === 'error' ? 'System Error' : 'System Notice'}
              </p>
              <p className="text-xs font-extrabold text-slate-800 leading-snug">{customAlert.message}</p>
            </div>
            <button 
              onClick={() => setCustomAlert({ ...customAlert, show: false })}
              className="text-slate-400 hover:text-slate-655 p-1 cursor-pointer focus:outline-none"
            >
              <XCircle size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Confirm Dialog Modal */}
      <AnimatePresence>
        {customConfirm.show && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 backdrop-blur-[3px] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xl space-y-6 text-center relative overflow-hidden"
            >
              <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <ShieldAlert size={24} className="animate-pulse" />
              </div>
              <div className="space-y-1 text-center">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-550 font-mono">Action Authorization</h3>
                <p className="text-sm font-extrabold text-slate-800 leading-relaxed">{customConfirm.message}</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={customConfirm.onCancel}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-black text-slate-700 uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={customConfirm.onConfirm}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-500 hover:shadow-lg text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  Confirm Action
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AdminFooter />
    </div>
  );
};

export default AdminDashboard;
