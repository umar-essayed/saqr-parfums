import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, supabaseAdmin, config, saveSupabaseConfig } from '../lib/supabase';
import {
  Shield,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Settings,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  Eye,
  LogOut,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  Loader2,
  Key,
  Sparkles,
  Video,
  Copy,
  Check,
  Upload
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('saqr_admin_auth') === 'true';
  });

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'perfumes' | 'customers' | 'settings'

  // Data states
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalCustomers: 0,
    totalPerfumes: 0
  });

  const [orders, setOrders] = useState([]);
  const [perfumes, setPerfumes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [stories, setStories] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Story modal state
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isUploadingPerfumeImage, setIsUploadingPerfumeImage] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [storyForm, setStoryForm] = useState({
    title: '',
    caption: '',
    media_type: 'image',
    media_url: '',
    duration_seconds: 7,
    perfume_id: ''
  });

  // New perfume modal form state
  const [isPerfumeModalOpen, setIsPerfumeModalOpen] = useState(false);
  const [editingPerfume, setEditingPerfume] = useState(null);
  const [perfumeForm, setPerfumeForm] = useState({
    name: '',
    tagline: '',
    description: '',
    price: '',
    sale_price: '',
    volume_ml: 100,
    top_notes: '',
    heart_notes: '',
    base_notes: '',
    intensity: 'مكثف وثابت 24 ساعة',
    gender: 'للجنسين',
    image_url: '',
    stock: 50,
    is_active: true
  });

  // Settings form
  const [settingsUrl, setSettingsUrl] = useState(config.url || '');
  const [settingsKey, setSettingsKey] = useState(config.key || '');

  // 1. Authentication Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    // Fast admin passcode or Supabase Auth
    if (authPassword === 'saqr2026' || authPassword === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('saqr_admin_auth', 'true');
      setAuthLoading(false);
      return;
    }

    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });
        if (error) throw error;

        setIsAuthenticated(true);
        localStorage.setItem('saqr_admin_auth', 'true');
      } catch (err) {
        setAuthError(err.message || 'فشل تسجيل الدخول. تأكد من البيانات أو استخدم كلمة سر المدير الافتراضية.');
      }
    } else {
      setAuthError('كلمة المرور غير صحيحة.');
    }
    setAuthLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('saqr_admin_auth');
    if (supabase) supabase.auth.signOut();
  };

  // 2. Fetch all admin data
  const loadAdminData = async () => {
    setLoading(true);
    setErrorMessage(null);

    const client = supabaseAdmin || supabase;
    if (!config.isConfigured || !client) {
      setErrorMessage('قاعدة بيانات Supabase غير متصلة. يرجى إدخال الرابط والمفتاح في تبويب الإعدادات.');
      setLoading(false);
      return;
    }

    try {
      // Fetch Orders
      const { data: ordersData, error: ordersErr } = await client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersErr) throw ordersErr;
      const allOrders = ordersData || [];
      setOrders(allOrders);

      // Fetch Perfumes
      const { data: perfumesData, error: perfErr } = await client
        .from('perfumes')
        .select('*')
        .order('created_at', { ascending: false });

      if (perfErr) throw perfErr;
      const allPerfumes = perfumesData || [];
      setPerfumes(allPerfumes);

      // Fetch Customers
      const { data: customersData, error: custErr } = await client
        .from('customers')
        .select('*')
        .order('total_spent', { ascending: false });

      if (!custErr) {
        setCustomers(customersData || []);
      }

      // Calculate Real Analytics
      const rev = allOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      
      const pendingCount = allOrders.filter(o => o.status === 'pending').length;
      const deliveredCount = allOrders.filter(o => o.status === 'delivered').length;

      setStats({
        totalRevenue: rev,
        totalOrders: allOrders.length,
        pendingOrders: pendingCount,
        deliveredOrders: deliveredCount,
        totalCustomers: customersData?.length || new Set(allOrders.map(o => o.customer_phone)).size,
        totalPerfumes: allPerfumes.filter(p => p.is_active).length
      });

      // Fetch real bestsellers via view_bestsellers
      const { data: bestData } = await client
        .from('view_bestsellers')
        .select('*')
        .limit(5);

      if (bestData) {
        setBestsellers(bestData);
      }

      // Fetch Stories
      try {
        const { data: storiesData } = await client
          .from('stories')
          .select('*')
          .order('created_at', { ascending: false });

        if (storiesData) {
          setStories(storiesData);
        }
      } catch (sErr) {
        console.warn('Stories table not yet created in Supabase:', sErr);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
      setErrorMessage('فشل جلب البيانات من قاعدة بيانات Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  // 3. Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const client = supabaseAdmin || supabase;
    if (!client) return;
    setActionLoading(true);

    try {
      const { error } = await client
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('فشل تحديث حالة الطلب: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // View Order Details
  const handleViewOrder = async (order) => {
    setSelectedOrder(order);
    setSelectedOrderItems([]);

    const client = supabaseAdmin || supabase;
    if (client) {
      const { data } = await client
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);
      setSelectedOrderItems(data || []);
    }
  };

  // 4. Save / Create Perfume
  const handleSavePerfume = async (e) => {
    e.preventDefault();
    const client = supabaseAdmin || supabase;
    if (!client) return;

    setActionLoading(true);

    try {
      const payload = {
        name: perfumeForm.name.trim(),
        tagline: perfumeForm.tagline.trim(),
        description: perfumeForm.description.trim(),
        price: Number(perfumeForm.price),
        sale_price: perfumeForm.sale_price ? Number(perfumeForm.sale_price) : null,
        volume_ml: Number(perfumeForm.volume_ml) || 100,
        top_notes: perfumeForm.top_notes ? perfumeForm.top_notes.split(',').map(s => s.trim()) : [],
        heart_notes: perfumeForm.heart_notes ? perfumeForm.heart_notes.split(',').map(s => s.trim()) : [],
        base_notes: perfumeForm.base_notes ? perfumeForm.base_notes.split(',').map(s => s.trim()) : [],
        intensity: perfumeForm.intensity,
        gender: perfumeForm.gender,
        image_url: perfumeForm.image_url.trim(),
        stock: Number(perfumeForm.stock) || 0,
        is_active: perfumeForm.is_active
      };

      if (editingPerfume) {
        const { error } = await client
          .from('perfumes')
          .update(payload)
          .eq('id', editingPerfume.id);
        if (error) throw error;
      } else {
        const { error } = await client
          .from('perfumes')
          .insert(payload);
        if (error) throw error;
      }

      setIsPerfumeModalOpen(false);
      setEditingPerfume(null);
      loadAdminData();
    } catch (err) {
      alert('حدث خطأ أثناء حفظ العطر: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Perfume
  const handleDeletePerfume = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العطر؟')) return;
    const client = supabaseAdmin || supabase;
    if (!client) return;

    try {
      const { error } = await client.from('perfumes').delete().eq('id', id);
      if (error) throw error;
      setPerfumes(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('فشل حذف العطر: ' + err.message);
    }
  };

  // Open Edit Perfume
  const handleEditPerfume = (perfume) => {
    setEditingPerfume(perfume);
    setPerfumeForm({
      name: perfume.name,
      tagline: perfume.tagline || '',
      description: perfume.description || '',
      price: perfume.price,
      sale_price: perfume.sale_price || '',
      volume_ml: perfume.volume_ml || 100,
      top_notes: Array.isArray(perfume.top_notes) ? perfume.top_notes.join(', ') : '',
      heart_notes: Array.isArray(perfume.heart_notes) ? perfume.heart_notes.join(', ') : '',
      base_notes: Array.isArray(perfume.base_notes) ? perfume.base_notes.join(', ') : '',
      intensity: perfume.intensity || 'مكثف وثابت 24 ساعة',
      gender: perfume.gender || 'للجنسين',
      image_url: perfume.image_url,
      stock: perfume.stock || 0,
      is_active: perfume.is_active
    });
    setIsPerfumeModalOpen(true);
  };

  // Upload Story Media directly to Supabase Storage
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const client = supabaseAdmin || supabase;
    if (!client) {
      alert('قاعدة بيانات Supabase غير متصلة.');
      return;
    }

    setIsUploadingMedia(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const cleanName = `story_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

      const { data: uploadData, error: uploadError } = await client.storage
        .from('stories')
        .upload(cleanName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = client.storage
        .from('stories')
        .getPublicUrl(cleanName);

      if (publicUrlData && publicUrlData.publicUrl) {
        setStoryForm(prev => ({
          ...prev,
          media_url: publicUrlData.publicUrl,
          media_type: file.type.startsWith('video') ? 'video' : 'image'
        }));
        alert('تم رفع الملف بنجاح إلى Supabase Storage وحفظ رابطه!');
      }
    } catch (err) {
      alert('فشل رفع الملف إلى Supabase Storage: ' + err.message);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  // Upload Perfume Image directly to Supabase Storage
  const handlePerfumeImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const client = supabaseAdmin || supabase;
    if (!client) {
      alert('قاعدة بيانات Supabase غير متصلة.');
      return;
    }

    setIsUploadingPerfumeImage(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const cleanName = `perfume_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

      const { data: uploadData, error: uploadError } = await client.storage
        .from('stories')
        .upload(cleanName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = client.storage
        .from('stories')
        .getPublicUrl(cleanName);

      if (publicUrlData && publicUrlData.publicUrl) {
        setPerfumeForm(prev => ({
          ...prev,
          image_url: publicUrlData.publicUrl
        }));
        alert('تم رفع صورة العطر بنجاح وتحديث الرابط!');
      }
    } catch (err) {
      alert('فشل رفع صورة العطر: ' + err.message);
    } finally {
      setIsUploadingPerfumeImage(false);
    }
  };

  // 5. Create Story Handler (Expires in 24 hours)
  const handleCreateStory = async (e) => {
    e.preventDefault();
    const client = supabaseAdmin || supabase;
    if (!client) return;

    setActionLoading(true);

    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

      const payload = {
        title: storyForm.title.trim(),
        caption: storyForm.caption.trim() || null,
        media_type: storyForm.media_type,
        media_url: storyForm.media_url.trim(),
        duration_seconds: storyForm.media_type === 'image' ? 7 : (Number(storyForm.duration_seconds) || 15),
        perfume_id: storyForm.perfume_id || null,
        views_count: 0,
        is_active: true,
        created_at: now.toISOString(),
        expires_at: expiresAt
      };

      const { data, error } = await client.from('stories').insert(payload).select().single();
      if (error) throw error;

      setStories(prev => [data, ...prev]);
      setIsStoryModalOpen(false);
      setStoryForm({
        title: '',
        caption: '',
        media_type: 'image',
        media_url: '',
        duration_seconds: 7,
        perfume_id: ''
      });
      alert('تم نشر الستوري بنجاح! ستظهر للعملاء ومبرمجة للحذف التلقائي بعد 24 ساعة.');
    } catch (err) {
      alert('حدث خطأ أثناء حفظ الستوري: ' + err.message + '\nتأكد من تشغيل كود SQL لجدول الستوريز في Supabase.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Story Handler
  const handleDeleteStory = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الستوري الآن؟')) return;
    const client = supabaseAdmin || supabase;
    if (!client) return;

    try {
      const { error } = await client.from('stories').delete().eq('id', id);
      if (error) throw error;
      setStories(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert('فشل حذف الستوري: ' + err.message);
    }
  };

  // -------------------------------------------------------------
  // LOGIN SCREEN
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-saqr-base flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#0F0F12] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-saqr-gold/10 text-saqr-gold flex items-center justify-center mx-auto mb-4 border border-saqr-gold/30">
            <Shield className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-extrabold text-white text-center mb-1">
            بوابة إدارة صقر
          </h2>
          <p className="text-xs text-saqr-gray text-center mb-6">
            لوحة تحكم مؤمنة لإدارة العطور والمبيعات والطلبات
          </p>

          {authError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs mb-4">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] text-saqr-gray block mb-1">
                البريد الإلكتروني (أو اتركه فارغاً)
              </label>
              <input
                type="email"
                placeholder="admin@saqr.eg"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 text-xs focus:outline-none focus:border-saqr-gold"
              />
            </div>

            <div>
              <label className="text-[11px] text-saqr-gray block mb-1">
                كلمة المرور
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 text-xs focus:outline-none focus:border-saqr-gold"
              />
              <span className="text-[10px] text-saqr-gray/60 block mt-1">
                (كلمة المرور الافتراضية للوحة: saqr2026)
              </span>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-full bg-saqr-gold hover:bg-saqr-goldLight text-black font-bold text-xs tracking-wide transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              <span>تسجيل الدخول</span>
            </button>
          </form>

          <div className="text-center mt-6">
            <Link to="/" className="text-xs text-saqr-gray hover:text-white transition-colors">
              ← العودة لمتجر صقر
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-saqr-base text-saqr-appleLight flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0A0A0C] border-b md:border-b-0 md:border-l border-white/5 p-5 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/logo.png" alt="صقر" className="w-7 h-7 object-contain" />
              <span className="font-extrabold text-base tracking-wider bg-gradient-to-l from-white to-saqr-gold bg-clip-text text-transparent">
                إدارة صَقْر
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-saqr-gray hover:text-red-400 hover:bg-white/5 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'bg-saqr-gold text-black shadow-md'
                  : 'text-saqr-gray hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>نظرة عامة والتحليلات</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'orders'
                  ? 'bg-saqr-gold text-black shadow-md'
                  : 'text-saqr-gray hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                <span>إدارة الطلبات</span>
              </div>
              {stats.pendingOrders > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'orders' ? 'bg-black text-white' : 'bg-saqr-gold text-black'
                }`}>
                  {stats.pendingOrders}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('perfumes')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'perfumes'
                  ? 'bg-saqr-gold text-black shadow-md'
                  : 'text-saqr-gray hover:text-white hover:bg-white/5'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>تشكيلة العطور والمخزون</span>
            </button>

            <button
              onClick={() => setActiveTab('stories')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'stories'
                  ? 'bg-saqr-gold text-black shadow-md'
                  : 'text-saqr-gray hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4" />
                <span>إدارة الستوريز</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'stories' ? 'bg-black text-white' : 'bg-saqr-gold/20 text-saqr-gold'
              }`}>
                {stories.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'customers'
                  ? 'bg-saqr-gold text-black shadow-md'
                  : 'text-saqr-gray hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>سجل العملاء</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'settings'
                  ? 'bg-saqr-gold text-black shadow-md'
                  : 'text-saqr-gray hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>إعدادات Supabase</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-white/5">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-saqr-gray hover:text-white transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>معاينة المتجر المباشر</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-h-screen no-scrollbar">
        
        {/* Top Action Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              {activeTab === 'overview' && 'لوحة التحليلات والمبيعات'}
              {activeTab === 'orders' && 'سجل وإدارة الطلبات'}
              {activeTab === 'perfumes' && 'إدارة العطور والمخزون'}
              {activeTab === 'stories' && 'إدارة الستوريز المؤقتة (24 ساعة)'}
              {activeTab === 'customers' && 'قاعدة بيانات عملاء صقر'}
              {activeTab === 'settings' && 'ربط وتكوين Supabase'}
            </h1>
            <span className="text-xs text-saqr-gray">
              بيانات حقيقية مسترجعة من Supabase مباشرة
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              disabled={loading}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-saqr-gray hover:text-white transition-colors"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {activeTab === 'stories' && (
              <button
                onClick={() => setIsStoryModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-saqr-gold hover:bg-saqr-goldLight text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة ستوري جديدة</span>
              </button>
            )}

            {activeTab === 'perfumes' && (
              <button
                onClick={() => {
                  setEditingPerfume(null);
                  setPerfumeForm({
                    name: '',
                    tagline: '',
                    description: '',
                    price: '',
                    sale_price: '',
                    volume_ml: 100,
                    top_notes: '',
                    heart_notes: '',
                    base_notes: '',
                    intensity: 'مكثف وثابت 24 ساعة',
                    gender: 'للجنسين',
                    image_url: '',
                    stock: 50,
                    is_active: true
                  });
                  setIsPerfumeModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-saqr-gold hover:bg-saqr-goldLight text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة عطر جديد</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Error Banner if any */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="underline text-saqr-gold text-xs font-semibold"
            >
              ضبط الإعدادات الآن
            </button>
          </div>
        )}

        {/* ----------------- TAB: OVERVIEW ----------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5">
                <span className="text-[11px] text-saqr-gray block mb-1">إجمالي الإيرادات</span>
                <span className="text-xl sm:text-2xl font-bold text-saqr-gold">
                  {stats.totalRevenue.toLocaleString()} ج.م
                </span>
                <span className="text-[10px] text-emerald-400 block mt-1">الدفع عند الاستلام</span>
              </div>

              <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5">
                <span className="text-[11px] text-saqr-gray block mb-1">إجمالي الطلبات</span>
                <span className="text-xl sm:text-2xl font-bold text-white">
                  {stats.totalOrders}
                </span>
                <span className="text-[10px] text-saqr-gray block mt-1">كافة الحالات</span>
              </div>

              <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5">
                <span className="text-[11px] text-saqr-gray block mb-1">طلبات قيد المراجعة</span>
                <span className="text-xl sm:text-2xl font-bold text-amber-400">
                  {stats.pendingOrders}
                </span>
                <span className="text-[10px] text-amber-400/80 block mt-1">بحاجة لتأكيد الهاتف</span>
              </div>

              <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5">
                <span className="text-[11px] text-saqr-gray block mb-1">العملاء المسجلين</span>
                <span className="text-xl sm:text-2xl font-bold text-white">
                  {stats.totalCustomers}
                </span>
                <span className="text-[10px] text-saqr-gray block mt-1">تتبع آلي</span>
              </div>

            </div>

            {/* Bestsellers Ranking from actual order volume */}
            <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-saqr-gold" />
                  <h3 className="text-sm font-bold text-white">
                    الأكثر طلباً ومبيعاً (إحصائيات حقيقية)
                  </h3>
                </div>
                <span className="text-xs text-saqr-gray">محتسبة من واقع عناصر الأوردرات</span>
              </div>

              {bestsellers.length === 0 ? (
                <div className="py-8 text-center text-xs text-saqr-gray">
                  لم يتم تسجيل مبيعات كافية بعد لحساب الإحصائيات.
                </div>
              ) : (
                <div className="space-y-3">
                  {bestsellers.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 border-b border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center font-bold text-saqr-gold">
                          {idx + 1}
                        </span>
                        {item.image_url && (
                          <img src={item.image_url} alt={item.name} className="w-8 h-8 object-contain" />
                        )}
                        <div>
                          <span className="font-bold text-white block">{item.name}</span>
                          <span className="text-[10px] text-saqr-gray">{item.tagline}</span>
                        </div>
                      </div>

                      <div className="text-left">
                        <span className="font-semibold text-saqr-gold block">
                          {item.total_sold} زجاجة مباعة
                        </span>
                        <span className="text-[10px] text-saqr-gray">
                          {Number(item.price).toLocaleString()} ج.م للقطعة
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">أحدث الطلبات الواردة</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-saqr-gold hover:underline"
                >
                  عرض كافة الطلبات ({orders.length})
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="py-8 text-center text-xs text-saqr-gray">
                  لا توجد طلبات واردة حالياً.
                </div>
              ) : (
                <div className="space-y-2">
                  {orders.slice(0, 5).map(o => (
                    <div
                      key={o.id}
                      onClick={() => handleViewOrder(o)}
                      className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 flex items-center justify-between cursor-pointer transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-saqr-gold">{o.order_code}</span>
                        <span className="text-white font-medium">{o.customer_name}</span>
                        <span className="text-saqr-gray font-mono">{o.customer_phone}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-bold text-white">
                          {Number(o.total_amount).toLocaleString()} ج.م
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                          o.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-300' :
                          o.status === 'cancelled' ? 'bg-red-500/20 text-red-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {o.status === 'pending' ? 'قيد المراجعة' :
                           o.status === 'confirmed' ? 'تم التأكيد' :
                           o.status === 'processing' ? 'جاري التجهيز' :
                           o.status === 'shipped' ? 'خرج للتوصيل' :
                           o.status === 'delivered' ? 'تم التسليم' : 'ملغي'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ----------------- TAB: ORDERS ----------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            {orders.length === 0 ? (
              <div className="py-24 text-center bg-[#0F0F12] border border-white/5 rounded-3xl">
                <ShoppingBag className="w-12 h-12 text-saqr-gray mx-auto mb-3 opacity-30" />
                <h3 className="text-sm font-bold text-white mb-1">لا توجد طلبات مسجلة</h3>
                <p className="text-xs text-saqr-gray">ستظهر جميع طلبات العملاء فور إتمامها من المتجر.</p>
              </div>
            ) : (
              <div className="bg-[#0F0F12] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-white/5 text-saqr-gray uppercase tracking-wider text-[10px] border-b border-white/5">
                      <tr>
                        <th className="p-4">كود الطلب</th>
                        <th className="p-4">العميل</th>
                        <th className="p-4">الهاتف</th>
                        <th className="p-4">المحافظة</th>
                        <th className="p-4">المبلغ</th>
                        <th className="p-4">الحالة</th>
                        <th className="p-4">التاريخ</th>
                        <th className="p-4 text-center">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-mono font-bold text-saqr-gold">{o.order_code}</td>
                          <td className="p-4 font-medium text-white">{o.customer_name}</td>
                          <td className="p-4 font-mono text-saqr-gray">{o.customer_phone}</td>
                          <td className="p-4 text-white">{o.governorate}</td>
                          <td className="p-4 font-bold text-white">
                            {Number(o.total_amount).toLocaleString()} ج.م
                          </td>
                          <td className="p-4">
                            <select
                              value={o.status}
                              disabled={actionLoading}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className="px-2.5 py-1 rounded-lg bg-[#15151A] border border-white/10 text-[11px] text-white focus:outline-none focus:border-saqr-gold"
                            >
                              <option value="pending">قيد المراجعة</option>
                              <option value="confirmed">تم التأكيد</option>
                              <option value="processing">جاري التجهيز</option>
                              <option value="shipped">خرج للتوصيل</option>
                              <option value="delivered">تم التسليم</option>
                              <option value="cancelled">ملغي</option>
                            </select>
                          </td>
                          <td className="p-4 text-saqr-gray text-[11px]">
                            {new Date(o.created_at).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleViewOrder(o)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-saqr-gray hover:text-white transition-colors"
                              title="عرض التفاصيل"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB: PERFUMES ----------------- */}
        {activeTab === 'perfumes' && (
          <div className="space-y-6 animate-fade-in">
            {perfumes.length === 0 ? (
              <div className="py-24 text-center bg-[#0F0F12] border border-white/5 rounded-3xl">
                <Package className="w-12 h-12 text-saqr-gray mx-auto mb-3 opacity-30" />
                <h3 className="text-sm font-bold text-white mb-1">لا توجد عطور مضافة</h3>
                <p className="text-xs text-saqr-gray mb-4">
                  أضف أول عطر أو قم بتشغيل سكريبت البيانات الأولية من supabase_schema.sql.
                </p>
                <button
                  onClick={() => setIsPerfumeModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-saqr-gold text-black font-bold text-xs"
                >
                  إضافة عطر الآن
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {perfumes.map((perfume) => (
                  <div
                    key={perfume.id}
                    className="bg-[#0F0F12] border border-white/5 rounded-2xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 rounded-xl bg-black overflow-hidden flex items-center justify-center mb-3 relative">
                        <img
                          src={perfume.image_url}
                          alt={perfume.name}
                          className={`w-full h-full object-cover object-top ${
                            perfume.name === 'قريباً' ? 'filter blur-md scale-110' : ''
                          }`}
                        />
                        {!perfume.is_active && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 text-[10px] font-bold">
                            غير معروض
                          </span>
                        )}
                        {perfume.name === 'قريباً' && (
                          <span className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold text-saqr-gold">
                            قريباً (مموه)
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-saqr-gold block">{perfume.tagline}</span>
                      <h4 className="text-sm font-bold text-white">{perfume.name}</h4>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-white">
                          الأحجام: 50 مل • 100 مل
                        </span>
                        <span className="text-[10px] text-saqr-gray mr-auto">
                          المخزون: {perfume.stock}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-white/5">
                      <button
                        onClick={() => handleEditPerfume(perfume)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-saqr-gray hover:text-white transition-colors"
                        title="تعديل العطر"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePerfume(perfume.id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-saqr-gray hover:text-red-400 transition-colors"
                        title="حذف العطر"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB: STORIES ----------------- */}
        {activeTab === 'stories' && (
          <div className="space-y-6 animate-fade-in">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5">
                <span className="text-[11px] text-saqr-gray block mb-1">الستوريز النشطة</span>
                <span className="text-2xl font-bold text-saqr-gold">{stories.length}</span>
                <span className="text-[10px] text-saqr-gray block mt-1">تختفي آلياً بعد 24 ساعة</span>
              </div>

              <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5">
                <span className="text-[11px] text-saqr-gray block mb-1">إجمالي المشاهدات</span>
                <span className="text-2xl font-bold text-white">
                  {stories.reduce((sum, s) => sum + (s.views_count || 0), 0)}
                </span>
                <span className="text-[10px] text-emerald-400 block mt-1">مسجلة بالكامل</span>
              </div>

              <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5">
                <span className="text-[11px] text-saqr-gray block mb-1">مدة عرض الصور</span>
                <span className="text-2xl font-bold text-white">7 ثوانٍ</span>
                <span className="text-[10px] text-saqr-gray block mt-1">انتقال انسيابي تلقائي</span>
              </div>
            </div>

            {/* Stories Grid */}
            {stories.length === 0 ? (
              <div className="py-24 text-center bg-[#0F0F12] border border-white/5 rounded-3xl">
                <Sparkles className="w-12 h-12 text-saqr-gold mx-auto mb-3 opacity-30" />
                <h3 className="text-sm font-bold text-white mb-1">لا توجد ستوريز نشطة</h3>
                <p className="text-xs text-saqr-gray mb-4">
                  أضف ستوري جديدة بالصور أو الفيديو وستظهر فوراً في الدوائر الذهبية أعلى المتجر وتختفي بعد 24 ساعة.
                </p>
                <button
                  onClick={() => setIsStoryModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-saqr-gold text-black font-bold text-xs"
                >
                  إضافة أول ستوري الآن
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stories.map((story) => {
                  const hoursLeft = story.expires_at
                    ? Math.max(0, Math.round((new Date(story.expires_at) - new Date()) / (1000 * 60 * 60)))
                    : 24;

                  return (
                    <div
                      key={story.id}
                      className="bg-[#0F0F12] border border-white/5 rounded-2xl p-4 flex flex-col justify-between"
                    >
                      <div>
                        {/* Media Preview */}
                        <div className="h-48 rounded-xl bg-black overflow-hidden flex items-center justify-center mb-3 relative">
                          {story.media_type === 'video' ? (
                            <video
                              src={story.media_url}
                              className="w-full h-full object-cover"
                              muted
                            />
                          ) : (
                            <img
                              src={story.media_url}
                              alt={story.title}
                              className="w-full h-full object-cover object-top"
                            />
                          )}

                          {/* Media Type Badge */}
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                            {story.media_type === 'video' ? <Video className="w-3 h-3 text-saqr-gold" /> : <Sparkles className="w-3 h-3 text-saqr-gold" />}
                            <span>{story.media_type === 'video' ? 'فيديو' : 'صورة (7 ثوانٍ)'}</span>
                          </span>

                          {/* Views Count Badge */}
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                            <Eye className="w-3 h-3 text-saqr-gold" />
                            <span>{story.views_count || 0} مشاهدة</span>
                          </span>
                        </div>

                        {/* Story Info */}
                        <h4 className="text-sm font-bold text-white">{story.title}</h4>
                        {story.caption && (
                          <p className="text-xs text-saqr-gray line-clamp-2 mt-1">{story.caption}</p>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-saqr-gray mt-3 pt-3 border-t border-white/5">
                          <span className="text-saqr-gold font-medium">
                            {hoursLeft > 0 ? `متبقي: ${hoursLeft} ساعة` : 'منتهية الصلاحية'}
                          </span>
                          <span>
                            {new Date(story.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Delete */}
                      <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-white/5">
                        <button
                          onClick={() => handleDeleteStory(story.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف الستوري</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Supabase SQL Instructions if table not yet run */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-saqr-gold block mb-1">
                  تفعيل جدول الستوريز في Supabase (في حالة لم تكن قمت بتشغيله):
                </span>
                <p className="text-[11px] text-saqr-gray leading-relaxed">
                  تم تضمين كود إنشاء جدول الستوريز داخل <code className="text-white">supabase_schema.sql</code>. اضغط زر النسخ وشغله في SQL Editor بضغطة واحدة.
                </p>
              </div>
              <button
                onClick={() => {
                  const sql = `create table if not exists public.stories (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  caption text,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  media_url text not null,
  perfume_id uuid references public.perfumes(id) on delete set null,
  views_count int default 0,
  duration_seconds int default 7,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  expires_at timestamp with time zone default (timezone('utc'::text, now()) + interval '24 hours')
);

create or replace function public.increment_story_views(p_story_id uuid)
returns void as $$
begin
  update public.stories
  set views_count = coalesce(views_count, 0) + 1
  where id = p_story_id;
end;
$$ language plpgsql security definer;

alter table public.stories enable row level security;
create policy "الجميع يمكنهم مشاهدة الستوريز النشطة" on public.stories for select using (true);
create policy "المدير يتحكم بالستوريز" on public.stories for all using (true);`;
                  navigator.clipboard.writeText(sql);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 2500);
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-colors"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-saqr-gold" />}
                <span>{copiedSql ? 'تم نسخ الـ SQL!' : 'نسخ كود الـ SQL للستوريز'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ----------------- TAB: CUSTOMERS ----------------- */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-fade-in">
            {customers.length === 0 ? (
              <div className="py-24 text-center bg-[#0F0F12] border border-white/5 rounded-3xl">
                <Users className="w-12 h-12 text-saqr-gray mx-auto mb-3 opacity-30" />
                <h3 className="text-sm font-bold text-white mb-1">لا يوجد عملاء بعد</h3>
                <p className="text-xs text-saqr-gray">يتم حفظ العملاء تلقائياً بمجرد إتمام أول طلب.</p>
              </div>
            ) : (
              <div className="bg-[#0F0F12] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-white/5 text-saqr-gray uppercase tracking-wider text-[10px] border-b border-white/5">
                      <tr>
                        <th className="p-4">الاسم</th>
                        <th className="p-4">الهاتف</th>
                        <th className="p-4">المحافظة</th>
                        <th className="p-4">عدد الطلبات</th>
                        <th className="p-4">إجمالي المشتريات</th>
                        <th className="p-4">آخر طلب</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {customers.map((c) => (
                        <tr key={c.id} className="hover:bg-white/[0.02]">
                          <td className="p-4 font-bold text-white">{c.name}</td>
                          <td className="p-4 font-mono text-saqr-gray">{c.phone}</td>
                          <td className="p-4 text-white">{c.governorate || '—'}</td>
                          <td className="p-4 text-saqr-gold font-bold">{c.orders_count}</td>
                          <td className="p-4 font-bold text-white">
                            {Number(c.total_spent).toLocaleString()} ج.م
                          </td>
                          <td className="p-4 text-saqr-gray text-[11px]">
                            {new Date(c.last_order_at || c.created_at).toLocaleDateString('ar-EG')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB: SETTINGS ----------------- */}
        {activeTab === 'settings' && (
          <div className="max-w-xl bg-[#0F0F12] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
            <div>
              <h3 className="text-base font-bold text-white mb-1">بيانات ربط Supabase</h3>
              <p className="text-xs text-saqr-gray leading-relaxed">
                يمكنك تحديث رابط المشروع ومفتاح Anon مباشرة هنا ليتم تفعيل الحفظ المباشر والاستعلام دون الحاجة لإعادة البناء.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-saqr-gray block mb-1">
                  Project URL (رابط المشروع)
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={settingsUrl}
                  onChange={(e) => setSettingsUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 text-xs font-mono focus:outline-none focus:border-saqr-gold"
                />
              </div>

              <div>
                <label className="text-[11px] text-saqr-gray block mb-1">
                  Anon Public Key (مفتاح الـ Anon)
                </label>
                <textarea
                  rows={3}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  value={settingsKey}
                  onChange={(e) => setSettingsKey(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 text-xs font-mono focus:outline-none focus:border-saqr-gold resize-none"
                />
              </div>

              <button
                onClick={() => saveSupabaseConfig(settingsUrl, settingsKey)}
                className="w-full py-3 rounded-full bg-saqr-gold hover:bg-saqr-goldLight text-black font-bold text-xs transition-all active:scale-95"
              >
                حفظ وإعادة الاتصال
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <span className="text-xs font-bold text-saqr-gold block">
                ملف الاسكيما المتكامل:
              </span>
              <p className="text-[11px] text-saqr-gray leading-relaxed">
                تم تجهيز ملف <code className="text-white">supabase_schema.sql</code> في مجلد المشروع الرئيسي. فقط انسخ محتواه والصقه داخل Supabase SQL Editor واضغط Run لإنشاء الجداول والـ Views ودوال الأكثر مبيعاً وعطور صقر الأولية.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* -------------------------------------------------------------
          MODAL: ADD / EDIT PERFUME
      ------------------------------------------------------------- */}
      {isPerfumeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsPerfumeModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg bg-[#0F0F12] border border-white/10 rounded-3xl p-6 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingPerfume ? 'تعديل العطر' : 'إضافة عطر ملكي جديد'}
            </h3>

            <form onSubmit={handleSavePerfume} className="space-y-3 text-xs">
              <div>
                <label className="text-saqr-gray block mb-1">اسم العطر</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: صقر النيل"
                  value={perfumeForm.name}
                  onChange={(e) => setPerfumeForm({ ...perfumeForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-saqr-gold"
                />
              </div>

              <div>
                <label className="text-saqr-gray block mb-1">العبارة الوصفية (كلمة أو كلمتين)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: حضور طاغٍ"
                  value={perfumeForm.tagline}
                  onChange={(e) => setPerfumeForm({ ...perfumeForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-saqr-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-saqr-gray block mb-1">السعر (ج.م)</label>
                  <input
                    type="number"
                    required
                    placeholder="1850"
                    value={perfumeForm.price}
                    onChange={(e) => setPerfumeForm({ ...perfumeForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-saqr-gold"
                  />
                </div>
                <div>
                  <label className="text-saqr-gray block mb-1">سعر الخصم (اختياري)</label>
                  <input
                    type="number"
                    placeholder="1650"
                    value={perfumeForm.sale_price}
                    onChange={(e) => setPerfumeForm({ ...perfumeForm, sale_price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-saqr-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-saqr-gray block mb-1">الحجم (مل)</label>
                  <input
                    type="number"
                    value={perfumeForm.volume_ml}
                    onChange={(e) => setPerfumeForm({ ...perfumeForm, volume_ml: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-saqr-gold"
                  />
                </div>
                <div>
                  <label className="text-saqr-gray block mb-1">المخزون المتوفر</label>
                  <input
                    type="number"
                    value={perfumeForm.stock}
                    onChange={(e) => setPerfumeForm({ ...perfumeForm, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-saqr-gold"
                  />
                </div>
              </div>

              <div>
                <label className="text-saqr-gray block mb-1">صورة الزجاجة (رفع مباشر أو رابط مباشر)</label>
                
                {/* Upload Button */}
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white cursor-pointer transition-all active:scale-98">
                    {isUploadingPerfumeImage ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-saqr-gold" />
                        <span className="text-[11px]">جارِ الرفع إلى Supabase...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-saqr-gold" />
                        <span className="text-[11px] font-bold">رفع صورة من جهازك</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingPerfumeImage}
                      onChange={handlePerfumeImageUpload}
                      className="hidden"
                    />
                  </label>
                  {perfumeForm.image_url && (
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/20 bg-black/40 flex-shrink-0">
                      <img src={perfumeForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  required
                  placeholder="أو اكتب الرابط هنا: https://..."
                  value={perfumeForm.image_url}
                  onChange={(e) => setPerfumeForm({ ...perfumeForm, image_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-saqr-gold font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-saqr-gray block mb-1">قمة العطر (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  placeholder="هيل، زعفران، فلفل وردي"
                  value={perfumeForm.top_notes}
                  onChange={(e) => setPerfumeForm({ ...perfumeForm, top_notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-saqr-gold"
                />
              </div>

              <div>
                <label className="text-saqr-gray block mb-1">قلب العطر (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  placeholder="عود، خشب الصندل، ورد"
                  value={perfumeForm.heart_notes}
                  onChange={(e) => setPerfumeForm({ ...perfumeForm, heart_notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-saqr-gold"
                />
              </div>

              <div>
                <label className="text-saqr-gray block mb-1">قاعدة العطر (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  placeholder="عنبر، مسك، فانيليا"
                  value={perfumeForm.base_notes}
                  onChange={(e) => setPerfumeForm({ ...perfumeForm, base_notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-saqr-gold"
                />
              </div>

              <div>
                <label className="text-saqr-gray block mb-1">الوصف</label>
                <textarea
                  rows={2}
                  placeholder="وصف مختصر للعطر..."
                  value={perfumeForm.description}
                  onChange={(e) => setPerfumeForm({ ...perfumeForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-saqr-gold resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={perfumeForm.is_active}
                  onChange={(e) => setPerfumeForm({ ...perfumeForm, is_active: e.target.checked })}
                  className="rounded text-saqr-gold"
                />
                <label htmlFor="is_active" className="text-white cursor-pointer">
                  معروض ونشط في المتجر
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-saqr-gold hover:bg-saqr-goldLight text-black font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  {actionLoading ? 'جاري الحفظ...' : 'حفظ العطر'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPerfumeModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: ADD NEW STORY (24h)
      ------------------------------------------------------------- */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setIsStoryModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-[#0F0F12] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-saqr-gold" />
              <span>إضافة ستوري جديدة (تختفي بعد 24 ساعة)</span>
            </h3>

            <form onSubmit={handleCreateStory} className="space-y-3 text-xs">
              <div>
                <label className="text-saqr-gray block mb-1">عنوان الستوري (يظهر أسفل الدائرة)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: كواليس صقر"
                  value={storyForm.title}
                  onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-saqr-gold"
                />
              </div>

              <div>
                <label className="text-saqr-gray block mb-1">نوع الميديا</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStoryForm({ ...storyForm, media_type: 'image', duration_seconds: 7 })}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      storyForm.media_type === 'image'
                        ? 'bg-saqr-gold text-black shadow-md'
                        : 'bg-white/5 text-saqr-gray hover:text-white'
                    }`}
                  >
                    صورة (7 ثوانٍ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoryForm({ ...storyForm, media_type: 'video', duration_seconds: 15 })}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      storyForm.media_type === 'video'
                        ? 'bg-saqr-gold text-black shadow-md'
                        : 'bg-white/5 text-saqr-gray hover:text-white'
                    }`}
                  >
                    فيديو
                  </button>
                </div>
              </div>

              {/* Direct Supabase Storage File Upload */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-dashed border-white/15 text-center">
                <input
                  type="file"
                  id="story-file-upload"
                  accept="image/*,video/mp4,video/webm"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploadingMedia}
                />
                <label
                  htmlFor="story-file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1.5 py-1 text-saqr-gray hover:text-white transition-colors"
                >
                  {isUploadingMedia ? (
                    <div className="flex items-center gap-2 text-saqr-gold font-bold">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري رفع الميديا إلى Supabase Storage...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-saqr-gold" />
                      <span className="text-xs font-semibold text-white">
                        رفع صورة أو فيديو مباشرة من جهازك
                      </span>
                      <span className="text-[10px] text-saqr-gray">
                        يتم حفظها في Supabase Storage وإنشاء الرابط آلياً
                      </span>
                    </>
                  )}
                </label>
              </div>

              <div>
                <label className="text-saqr-gray block mb-1">
                  أو أدخل رابط الميديا المباشر ({storyForm.media_type === 'image' ? 'رابط الصورة' : 'رابط الفيديو MP4'})
                </label>
                <input
                  type="url"
                  required
                  placeholder={storyForm.media_type === 'image' ? 'https://...' : 'https://.../video.mp4'}
                  value={storyForm.media_url}
                  onChange={(e) => setStoryForm({ ...storyForm, media_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-[11px] focus:outline-none focus:border-saqr-gold"
                />
              </div>

              <div>
                <label className="text-saqr-gray block mb-1">الوصف / العبارة (تظهر أسفل الشاشة بالستوري)</label>
                <textarea
                  rows={2}
                  placeholder="مثال: قطرات نادرة من أخشاب العود المعتق..."
                  value={storyForm.caption}
                  onChange={(e) => setStoryForm({ ...storyForm, caption: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-saqr-gold resize-none"
                />
              </div>

              <div>
                <label className="text-saqr-gray block mb-1">ربط بعطر للشراء السريع (اختياري)</label>
                <select
                  value={storyForm.perfume_id}
                  onChange={(e) => setStoryForm({ ...storyForm, perfume_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#15151A] border border-white/10 text-white focus:outline-none focus:border-saqr-gold"
                >
                  <option value="">بدون ربط بعطر</option>
                  {perfumes.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-saqr-gold hover:bg-saqr-goldLight text-black font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  {actionLoading ? 'جاري النشر...' : 'نشر الستوري الآن'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsStoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: VIEW ORDER DETAILS
      ------------------------------------------------------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative z-10 w-full max-w-md bg-[#0F0F12] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <span className="text-[10px] text-saqr-gray block">تفاصيل الطلب</span>
                <span className="text-base font-mono font-bold text-saqr-gold">
                  {selectedOrder.order_code}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full text-saqr-gray hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-saqr-gray">العميل:</span>
                <span className="text-white font-bold">{selectedOrder.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-saqr-gray">الهاتف:</span>
                <a href={`tel:${selectedOrder.customer_phone}`} className="text-saqr-gold font-mono hover:underline">
                  {selectedOrder.customer_phone}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-saqr-gray">المحافظة:</span>
                <span className="text-white">{selectedOrder.governorate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-saqr-gray">العنوان:</span>
                <span className="text-white text-left">{selectedOrder.shipping_address}</span>
              </div>
              {selectedOrder.notes && (
                <div className="flex justify-between">
                  <span className="text-saqr-gray">ملاحظات:</span>
                  <span className="text-amber-300 text-left">{selectedOrder.notes}</span>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="pt-3 border-t border-white/5">
              <span className="text-[11px] font-bold text-saqr-gold block mb-2">العطور المطلوبة:</span>
              <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar text-xs">
                {selectedOrderItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-white">{item.perfume_name} (×{item.quantity})</span>
                    <span className="font-semibold text-white">
                      {(Number(item.unit_price) * item.quantity).toLocaleString()} ج.م
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="font-bold text-white">الإجمالي:</span>
              <span className="text-sm font-bold text-saqr-gold">
                {Number(selectedOrder.total_amount).toLocaleString()} ج.م
              </span>
            </div>

            {/* Change Status Inside Modal */}
            <div className="pt-3 border-t border-white/5">
              <label className="text-[11px] text-saqr-gray block mb-1">تحديث الحالة:</label>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#15151A] border border-white/10 text-white text-xs focus:outline-none focus:border-saqr-gold"
              >
                <option value="pending">قيد المراجعة</option>
                <option value="confirmed">تم التأكيد</option>
                <option value="processing">جاري التجهيز</option>
                <option value="shipped">خرج للتوصيل</option>
                <option value="delivered">تم التسليم</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
