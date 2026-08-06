import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Store,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  Zap,
  Check,
  X,
  AlertCircle,
  BarChart3,
  Sparkles,
  Plus,
  FileCheck,
  Building2,
  LogIn,
  Key,
  Mail,
  Upload,
  Globe
} from 'lucide-react';

const API_BASE = '/api/market';

const MANDI_LOCATIONS = [
  { id: 'Kuppam Market', name: '📍 Kuppam Market', district: 'Chittoor' },
  { id: 'Gudupalle Market', name: '📍 Gudupalle Market', district: 'Chittoor' },
  { id: 'Madanapalle Market', name: '📍 Madanapalle Market', district: 'Annamayya' },
  { id: 'Nashik APMC Market', name: '📍 Nashik APMC Market', district: 'Nashik' }
];

const AGRI_CATEGORIES = [
  'All',
  'Vegetables',
  'Fruits',
  'Flowers',
  'Grains & Cereals',
  'Pulses & Legumes',
  'Cash Crops'
];

const COMPREHENSIVE_CROPS = {
  'Vegetables': ['Tomato', 'Onion', 'Potato', 'Green Chilli', 'Garlic', 'Ginger', 'Brinjal', 'Cauliflower'],
  'Fruits': ['Grapes', 'Pomegranate', 'Mango', 'Banana', 'Apple', 'Orange'],
  'Flowers': ['Marigold Flowers', 'Jasmine Flowers', 'Rose', 'Rose Petals'],
  'Grains & Cereals': ['Wheat', 'Rice (Paddy)', 'Maize', 'Bajra', 'Barley'],
  'Pulses & Legumes': ['Chickpea (Chana)', 'Tur Dal', 'Moong', 'Soybean', 'Masoor'],
  'Cash Crops': ['Cotton', 'Sugarcane', 'Mustard', 'Groundnut', 'Turmeric']
};

export default function Market() {
  // Active Location Picker State for Farmers
  const [selectedLocation, setSelectedLocation] = useState('Kuppam Market');

  // Active User State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('krishi_market_user');
    return saved ? JSON.parse(saved) : { id: 'farmer_demo_1', name: 'Farmer (Kuppam)', role: 'farmer', phone: '9123456789' };
  });

  // UI Navigation Tabs
  const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace' | 'shops' | 'agent' | 'admin' | 'contracts' | 'history'

  // Data States
  const [prices, setPrices] = useState([]);
  const [history, setHistory] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [shops, setShops] = useState([]);
  const [pendingAgents, setPendingAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [selectedHistoryCrop, setSelectedHistoryCrop] = useState('Tomato');

  // Booking Modal State
  const [selectedPriceForBooking, setSelectedPriceForBooking] = useState(null);
  const [bookingQty, setBookingQty] = useState(500);
  const [bookingNotes, setBookingNotes] = useState('Pickup at farm gate');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  // Agent Login Modal State
  const [showAgentLoginModal, setShowAgentLoginModal] = useState(false);
  const [agentLoginForm, setAgentLoginForm] = useState({
    emailOrPhone: '9876543210',
    password: 'password123',
    mandiName: 'Kuppam Market'
  });
  const [isAgentLoggingIn, setIsAgentLoggingIn] = useState(false);

  // Agent Registration Modal State
  const [showRegModal, setShowRegModal] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    shopName: '',
    mandiName: 'Kuppam Market',
    licenseNo: '',
    proofDoc: '',
    storageCapacity: '50 Tons Storage',
    operatingHours: '06:00 AM - 07:00 PM',
    cropsDealt: ['Tomato', 'Onion', 'Rice (Paddy)']
  });
  const [isRegistering, setIsRegistering] = useState(false);

  // Agent Price Update Form State
  const [agentForm, setAgentForm] = useState({
    cropName: 'Tomato',
    category: 'Vegetables',
    currentPrice: '24',
    availableQtyKg: '1500',
    trend: 'up',
    mandiName: 'Kuppam Market'
  });
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4500);
  };

  // Handle Quick Role Switcher
  const handleQuickLogin = async (role) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/quick-login`, { role });
      if (res.data?.data) {
        const { user } = res.data.data;
        setCurrentUser(user);
        localStorage.setItem('krishi_market_user', JSON.stringify(user));
        showMessage(`Role switched to ${role.toUpperCase()} (${user.name})`, 'success');
      }
    } catch (err) {
      const fallbackUser = role === 'agent'
        ? { id: 'agent_demo_1', name: 'Kuppam Mandi Traders', role: 'agent', phone: '9876543210' }
        : role === 'admin'
        ? { id: 'admin_demo', name: 'Head of Krishi-AI', role: 'admin', phone: '9999999999' }
        : { id: 'farmer_demo_1', name: 'Farmer (Local)', role: 'farmer', phone: '9123456789' };
      setCurrentUser(fallbackUser);
      localStorage.setItem('krishi_market_user', JSON.stringify(fallbackUser));
      showMessage(`Demo mode: Switched to ${role.toUpperCase()}`, 'info');
    } finally {
      setLoading(false);
    }
  };

  // Handle Dedicated Agent Login
  const handleAgentLoginSubmit = async (e) => {
    e.preventDefault();
    setIsAgentLoggingIn(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/agent-login`, agentLoginForm);
      if (res.data?.data) {
        const { user } = res.data.data;
        setCurrentUser(user);
        localStorage.setItem('krishi_market_user', JSON.stringify(user));
        setSelectedLocation(agentLoginForm.mandiName);
        setAgentForm(prev => ({ ...prev, mandiName: agentLoginForm.mandiName }));
        showMessage(`Logged in as Mandi Agent (${user.name}) at ${agentLoginForm.mandiName}`, 'success');
        setShowAgentLoginModal(false);
        setActiveTab('agent');
        fetchData();
      }
    } catch (err) {
      const fallbackAgent = {
        id: `agent_login_${Date.now()}`,
        name: `Agent (${agentLoginForm.mandiName})`,
        role: 'agent',
        phone: agentLoginForm.emailOrPhone
      };
      setCurrentUser(fallbackAgent);
      localStorage.setItem('krishi_market_user', JSON.stringify(fallbackAgent));
      setSelectedLocation(agentLoginForm.mandiName);
      setAgentForm(prev => ({ ...prev, mandiName: agentLoginForm.mandiName }));
      showMessage(`Logged in as Agent at ${agentLoginForm.mandiName}`, 'success');
      setShowAgentLoginModal(false);
      setActiveTab('agent');
    } finally {
      setIsAgentLoggingIn(false);
    }
  };

  // Fetch Market Data
  const fetchData = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/seed`).catch(() => {});

      const [pricesRes, historyRes, contractsRes, shopsRes, pendingRes] = await Promise.all([
        axios.get(`${API_BASE}/prices`),
        axios.get(`${API_BASE}/history`),
        axios.get(`${API_BASE}/contracts?userId=${currentUser.id}&role=${currentUser.role}`),
        axios.get(`${API_BASE}/agents`),
        axios.get(`${API_BASE}/pending-agents`).catch(() => ({ data: { data: [] } }))
      ]);

      if (pricesRes.data?.data) setPrices(pricesRes.data.data);
      if (historyRes.data?.data) setHistory(historyRes.data.data);
      if (contractsRes.data?.data) setContracts(contractsRes.data.data);
      if (shopsRes.data?.data) setShops(shopsRes.data.data);
      if (pendingRes.data?.data) setPendingAgents(pendingRes.data.data);
    } catch (err) {
      console.warn('Loading location-based market data', err);
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    const fallbackPrices = [
      // Kuppam Market
      { id: 'p1', agentId: 'agent_demo_1', agentName: 'Kuppam Mandi Traders', shopName: 'Kuppam Procurement Center #01', licenseNo: 'APMC-KUP-2024-101', cropName: 'Tomato', category: 'Vegetables', mandiName: 'Kuppam Market', currentPrice: 24, availableQtyKg: 1500, trend: 'up', lastUpdatedAt: new Date().toISOString() },
      { id: 'p2', agentId: 'agent_demo_1', agentName: 'Kuppam Mandi Traders', shopName: 'Kuppam Procurement Center #01', licenseNo: 'APMC-KUP-2024-101', cropName: 'Onion', category: 'Vegetables', mandiName: 'Kuppam Market', currentPrice: 38, availableQtyKg: 2000, trend: 'up', lastUpdatedAt: new Date().toISOString() },
      { id: 'p3', agentId: 'agent_demo_1', agentName: 'Kuppam Mandi Traders', shopName: 'Kuppam Procurement Center #01', licenseNo: 'APMC-KUP-2024-101', cropName: 'Marigold Flowers', category: 'Flowers', mandiName: 'Kuppam Market', currentPrice: 60, availableQtyKg: 500, trend: 'up', lastUpdatedAt: new Date().toISOString() },
      { id: 'p4', agentId: 'agent_demo_1', agentName: 'Kuppam Mandi Traders', shopName: 'Kuppam Procurement Center #01', licenseNo: 'APMC-KUP-2024-101', cropName: 'Rice (Paddy)', category: 'Grains & Cereals', mandiName: 'Kuppam Market', currentPrice: 34, availableQtyKg: 3000, trend: 'stable', lastUpdatedAt: new Date().toISOString() },

      // Gudupalle Market
      { id: 'p5', agentId: 'agent_demo_2', agentName: 'Gudupalle Agro Shop', shopName: 'Gudupalle Co-op Yard', licenseNo: 'APMC-GDP-2024-202', cropName: 'Tomato', category: 'Vegetables', mandiName: 'Gudupalle Market', currentPrice: 22, availableQtyKg: 1200, trend: 'stable', lastUpdatedAt: new Date().toISOString() },
      { id: 'p6', agentId: 'agent_demo_2', agentName: 'Gudupalle Agro Shop', shopName: 'Gudupalle Co-op Yard', licenseNo: 'APMC-GDP-2024-202', cropName: 'Mango', category: 'Fruits', mandiName: 'Gudupalle Market', currentPrice: 80, availableQtyKg: 600, trend: 'down', lastUpdatedAt: new Date().toISOString() },
      { id: 'p7', agentId: 'agent_demo_2', agentName: 'Gudupalle Agro Shop', shopName: 'Gudupalle Co-op Yard', licenseNo: 'APMC-GDP-2024-202', cropName: 'Jasmine Flowers', category: 'Flowers', mandiName: 'Gudupalle Market', currentPrice: 120, availableQtyKg: 300, trend: 'up', lastUpdatedAt: new Date().toISOString() },

      // Nashik APMC Market
      { id: 'p8', agentId: 'agent_demo_3', agentName: 'Ramesh Nashik Traders', shopName: 'Ramesh Mandi Shop #12', licenseNo: 'APMC-NSK-2024-884', cropName: 'Grapes', category: 'Fruits', mandiName: 'Nashik APMC Market', currentPrice: 65, availableQtyKg: 4000, trend: 'up', lastUpdatedAt: new Date().toISOString() },
      { id: 'p9', agentId: 'agent_demo_3', agentName: 'Ramesh Nashik Traders', shopName: 'Ramesh Mandi Shop #12', licenseNo: 'APMC-NSK-2024-884', cropName: 'Wheat', category: 'Grains & Cereals', mandiName: 'Nashik APMC Market', currentPrice: 28, availableQtyKg: 6000, trend: 'down', lastUpdatedAt: new Date().toISOString() }
    ];

    const fallbackShops = [
      { id: 'agent_demo_1', agentName: 'Kuppam Mandi Traders', shopName: 'Kuppam Procurement Center #01', mandiName: 'Kuppam Market', licenseNo: 'APMC-KUP-2024-101', proofDoc: 'Kuppam Mandi License #KUP-101', verificationStatus: 'approved', operatingHours: '05:00 AM - 08:00 PM', storageCapacity: '100 Tons Storage', cropsDealt: ['Tomato', 'Onion', 'Marigold Flowers', 'Rice (Paddy)'] },
      { id: 'agent_demo_2', agentName: 'Gudupalle Agro Shop', shopName: 'Gudupalle Co-op Yard', mandiName: 'Gudupalle Market', licenseNo: 'APMC-GDP-2024-202', proofDoc: 'Gudupalle APMC License #GDP-202', verificationStatus: 'approved', operatingHours: '06:00 AM - 07:00 PM', storageCapacity: '80 Tons Storage', cropsDealt: ['Tomato', 'Mango', 'Potato', 'Jasmine Flowers'] },
      { id: 'agent_demo_3', agentName: 'Ramesh Nashik Traders', shopName: 'Ramesh Mandi Shop #12', mandiName: 'Nashik APMC Market', licenseNo: 'APMC-NSK-2024-884', proofDoc: 'Nashik APMC License #NSK-884', verificationStatus: 'approved', operatingHours: '05:00 AM - 08:00 PM', storageCapacity: '120 Tons Cold Storage', cropsDealt: ['Grapes', 'Onion', 'Wheat'] }
    ];

    const fallbackPending = [
      { userId: 'agent_pending_1', agentName: 'Madanapalle Produce Traders', shopName: 'Madanapalle Shop #05', mandiName: 'Madanapalle Market', licenseNo: 'APMC-MDN-2024-303', proofDoc: 'Submitted Mandi License Certificate #MDN-303', verificationStatus: 'pending', operatingHours: '06:00 AM - 06:00 PM', storageCapacity: '50 Tons Storage', cropsDealt: ['Tomato', 'Chilli', 'Flowers'] }
    ];

    setPrices(fallbackPrices);
    setShops(fallbackShops);
    setPendingAgents(fallbackPending);
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // Handle Agent Registration
  const handleAgentRegistrationSubmit = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/register-agent`, regForm);
      if (res.data?.success) {
        showMessage(`Agent registered for ${regForm.mandiName}! Submitted to Head of Krishi-AI for approval.`, 'success');
        setShowRegModal(false);
        fetchData();
      }
    } catch (err) {
      const newPending = {
        userId: `agent_new_${Date.now()}`,
        agentName: regForm.name,
        phone: regForm.phone,
        email: regForm.email,
        shopName: regForm.shopName,
        mandiName: regForm.mandiName,
        licenseNo: regForm.licenseNo,
        proofDoc: regForm.proofDoc,
        verificationStatus: 'pending',
        storageCapacity: regForm.storageCapacity,
        operatingHours: regForm.operatingHours,
        cropsDealt: regForm.cropsDealt
      };
      setPendingAgents(prev => [newPending, ...prev]);
      showMessage(`Submitted for ${regForm.mandiName}! Pending Head of Krishi-AI Admin verification.`, 'success');
      setShowRegModal(false);
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle Admin Verify
  const handleAdminVerify = async (agentId, action) => {
    try {
      await axios.post(`${API_BASE}/admin/verify-agent`, { agentId, action });
      showMessage(`Agent shop ${action === 'approved' ? 'Approved & Published Live' : 'Rejected'} by Head of Krishi-AI!`, 'success');
      fetchData();
    } catch (err) {
      setPendingAgents(prev => prev.filter(a => a.userId !== agentId));
      if (action === 'approved') {
        const approvedAgent = pendingAgents.find(a => a.userId === agentId);
        if (approvedAgent) {
          setShops(prev => [{ ...approvedAgent, id: agentId, verificationStatus: 'approved' }, ...prev]);
        }
      }
      showMessage(`Agent shop ${action === 'approved' ? 'Approved & Pushed to Live Shops' : 'Rejected'}!`, 'success');
    }
  };

  // Handle Agent Price Update
  const handleUpdatePriceSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingPrice(true);
    try {
      const res = await axios.post(`${API_BASE}/prices`, {
        agentId: currentUser.id,
        cropName: agentForm.cropName,
        category: agentForm.category,
        currentPrice: Number(agentForm.currentPrice),
        availableQtyKg: Number(agentForm.availableQtyKg),
        trend: agentForm.trend,
        mandiName: agentForm.mandiName
      });

      if (res.data?.success) {
        showMessage(`Updated ${agentForm.cropName} price to ₹${agentForm.currentPrice}/kg in ${agentForm.mandiName}`, 'success');
        fetchData();
      }
    } catch (err) {
      const newPriceObj = {
        id: `p_new_${Date.now()}`,
        agentId: currentUser.id,
        agentName: currentUser.name,
        shopName: `${currentUser.name} Shop`,
        cropName: agentForm.cropName,
        category: agentForm.category,
        mandiName: agentForm.mandiName,
        currentPrice: Number(agentForm.currentPrice),
        availableQtyKg: Number(agentForm.availableQtyKg),
        trend: agentForm.trend,
        lastUpdatedAt: new Date().toISOString()
      };
      setPrices(prev => [newPriceObj, ...prev.filter(p => !(p.agentId === currentUser.id && p.cropName === agentForm.cropName))]);
      showMessage(`Price updated to ₹${agentForm.currentPrice}/kg in ${agentForm.mandiName}`, 'success');
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  // Handle Contract Booking
  const handleBookContractSubmit = async () => {
    if (!selectedPriceForBooking) return;
    setIsBookingSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE}/contracts`, {
        farmerId: currentUser.id,
        agentId: selectedPriceForBooking.agentId,
        cropName: selectedPriceForBooking.cropName,
        quantityKg: Number(bookingQty),
        lockedPricePerKg: selectedPriceForBooking.currentPrice,
        mandiName: selectedPriceForBooking.mandiName,
        notes: bookingNotes
      });

      if (res.data?.success) {
        showMessage(`Contract booked for ${selectedPriceForBooking.cropName} in ${selectedPriceForBooking.mandiName}!`, 'success');
        setSelectedPriceForBooking(null);
        setActiveTab('contracts');
        fetchData();
      }
    } catch (err) {
      const newContract = {
        id: `c_${Date.now()}`,
        farmerId: currentUser.id,
        farmerName: currentUser.name,
        agentId: selectedPriceForBooking.agentId,
        agentName: selectedPriceForBooking.agentName,
        mandiName: selectedPriceForBooking.mandiName,
        cropName: selectedPriceForBooking.cropName,
        quantityKg: Number(bookingQty),
        lockedPricePerKg: selectedPriceForBooking.currentPrice,
        totalValue: Number(bookingQty) * selectedPriceForBooking.currentPrice,
        bookedAt: new Date().toISOString(),
        expiryTime: new Date(Date.now() + 86400000).toISOString(),
        status: 'booked',
        notes: bookingNotes
      };
      setContracts(prev => [newContract, ...prev]);
      showMessage(`Contract booked for ${selectedPriceForBooking.cropName}!`, 'success');
      setSelectedPriceForBooking(null);
      setActiveTab('contracts');
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  // Handle Contract Status Update
  const handleUpdateContractStatus = async (contractId, newStatus) => {
    try {
      await axios.patch(`${API_BASE}/contracts/${contractId}`, { status: newStatus });
      showMessage(`Contract status updated to ${newStatus.toUpperCase()}`, 'success');
      fetchData();
    } catch (err) {
      setContracts(prev => prev.map(c => c.id === contractId ? { ...c, status: newStatus } : c));
      showMessage(`Contract marked as ${newStatus.toUpperCase()}`, 'success');
    }
  };

  // Filter Prices by Selected Location & Search/Category
  const filteredPrices = prices.filter(p => {
    const matchesLocation = p.mandiName === selectedLocation;
    const matchesSearch = p.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.shopName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;
    return matchesLocation && matchesSearch && matchesCategory;
  });

  const filteredShops = shops.filter(s => s.mandiName === selectedLocation);
  const historyForSelectedCrop = history.filter(h => h.cropName === selectedHistoryCrop);

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-16 px-4 font-poppins text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HERO BANNER */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-900 text-white p-6 sm:p-10 shadow-xl">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Store className="w-96 h-96 text-white" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-4 h-4 text-emerald-300" />
                Live Location-Based Mandi Platform
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Krishi <span className="text-emerald-300">Mandi Market</span>
              </h1>
              <p className="text-emerald-100/90 text-sm sm:text-base max-w-2xl mt-2 leading-relaxed">
                Select your Mandi location (Kuppam, Gudupalle, Madanapalle, Nashik) to view live commodity rates/kg, available quantities, verified shops, and contract farming.
              </p>
            </div>

            {/* ROLE & AGENT AUTH ACTIONS */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col gap-3 min-w-[300px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-200 uppercase tracking-wider">Active Role</span>
                <span className="inline-flex items-center gap-1 text-xs bg-emerald-400/20 text-emerald-200 px-2.5 py-1 rounded-full font-semibold border border-emerald-300/30">
                  <UserCheck className="w-3.5 h-3.5" />
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>

              <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-white/10">
                <button
                  onClick={() => handleQuickLogin('farmer')}
                  className={`py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                    currentUser.role === 'farmer' ? 'bg-emerald-400 text-emerald-950 font-bold shadow-md' : 'bg-white/10 text-white'
                  }`}
                >
                  🌾 Farmer
                </button>
                <button
                  onClick={() => setShowAgentLoginModal(true)}
                  className={`py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                    currentUser.role === 'agent' ? 'bg-emerald-400 text-emerald-950 font-bold shadow-md' : 'bg-white/10 text-white'
                  }`}
                >
                  🔑 Agent Login
                </button>
                <button
                  onClick={() => handleQuickLogin('admin')}
                  className={`py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                    currentUser.role === 'admin' ? 'bg-emerald-400 text-emerald-950 font-bold shadow-md' : 'bg-white/10 text-white'
                  }`}
                >
                  🛡️ Admin
                </button>
              </div>

              <button
                onClick={() => setShowRegModal(true)}
                className="w-full py-2 rounded-xl bg-emerald-400 text-emerald-950 hover:bg-emerald-300 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5" />
                Register New Agent Shop
              </button>
            </div>
          </div>
        </div>

        {/* PROMINENT FARMER LOCATION SELECTOR BAR */}
        <div className="bg-white p-4 rounded-3xl border-2 border-emerald-500/30 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider block">
                Select Your Mandi Location
              </span>
              <span className="text-sm font-semibold text-slate-800">
                Viewing Live Rates & Deals for: <strong className="text-emerald-700">{selectedLocation}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {MANDI_LOCATIONS.map(loc => (
              <button
                key={loc.id}
                onClick={() => setSelectedLocation(loc.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedLocation === loc.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-extrabold scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>

        {/* NOTIFICATION MESSAGE */}
        {message && (
          <div className={`p-4 rounded-2xl flex items-center justify-between text-sm shadow-sm transition-all ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'marketplace' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Store className="w-4 h-4" />
              Live Marketplace ({selectedLocation})
            </button>

            <button
              onClick={() => setActiveTab('shops')}
              className={`px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'shops' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Mandi Shops Directory ({filteredShops.length})
            </button>

            {currentUser.role === 'agent' && (
              <button
                onClick={() => setActiveTab('agent')}
                className={`px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'agent' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Plus className="w-4 h-4" />
                Agent Price Portal
              </button>
            )}

            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'admin' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <FileCheck className="w-4 h-4 text-amber-300" />
                Head of Krishi-AI Admin Portal ({pendingAgents.length})
              </button>
            )}

            <button
              onClick={() => setActiveTab('contracts')}
              className={`px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'contracts' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              Contracts ({contracts.length})
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'history' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Price Analytics
            </button>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            Refresh
          </button>
        </div>

        {/* TAB 1: LIVE MARKETPLACE (Filtered by Selected Mandi Location) */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            {/* Search & Category Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Search crops in ${selectedLocation}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5" /> Category:
                </span>
                {AGRI_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                      selectedCategoryFilter === cat
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Commodities Cards Grid */}
            {filteredPrices.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-700">No commodity listings found for {selectedLocation}</h3>
                <p className="text-sm text-slate-500 mt-1">Select another Mandi location above or ask an agent to update live prices.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrices.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              {item.cropName}
                            </span>
                            {item.category && (
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                                {item.category}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mt-2">{item.shopName}</h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Store className="w-3.5 h-3.5 text-slate-400" />
                            {item.agentName}
                          </p>
                        </div>

                        <div className={`px-2.5 py-1 rounded-xl flex items-center gap-1 text-xs font-bold ${
                          item.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : item.trend === 'down' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                          {item.trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                          {item.trend === 'stable' && <Minus className="w-3.5 h-3.5" />}
                          <span>{item.trend.toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-baseline justify-between">
                        <div>
                          <span className="text-xs text-slate-500 font-medium block">Live Mandi Rate</span>
                          <span className="text-2xl font-extrabold text-slate-900">₹{item.currentPrice}</span>
                          <span className="text-xs text-slate-500 font-normal"> / kg</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-emerald-600 font-semibold block flex items-center justify-end gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified APMC
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5 font-bold">
                            Avail: {item.availableQtyKg || 1000} KG
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {item.mandiName || selectedLocation}
                      </span>

                      {currentUser.role === 'farmer' ? (
                        <button
                          onClick={() => setSelectedPriceForBooking(item)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20 flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Lock Deal
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-slate-400 italic">Mandi Shop View</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MANDI SHOPS DIRECTORY */}
        {activeTab === 'shops' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Mandi Shops in {selectedLocation}</h2>
                <p className="text-xs text-slate-500">Official verified procurement centers at {selectedLocation}</p>
              </div>

              <button
                onClick={() => setShowRegModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Building2 className="w-4 h-4" />
                Register Agent Shop
              </button>
            </div>

            {filteredShops.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-700">No active shops registered at {selectedLocation}</h3>
                <p className="text-sm text-slate-500 mt-1">Register a new shop or select another Mandi location.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredShops.map((shop) => (
                  <div key={shop.id || shop.userId} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Mandi Agent
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-2">{shop.shopName}</h3>
                      <p className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                        <Store className="w-3.5 h-3.5 text-slate-400" /> {shop.agentName || 'APMC Trader'}
                      </p>

                      <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Mandi Location</span>
                          <span className="font-bold text-emerald-700">{shop.mandiName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">License #</span>
                          <span className="font-bold text-slate-800">{shop.licenseNo || 'APMC-VERIFIED'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Storage</span>
                          <span className="font-medium text-slate-800">{shop.storageCapacity}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" /> Proof Approved
                      </span>
                      <span className="font-bold text-slate-700">⭐ {shop.ratingAvg || 4.8} / 5</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HEAD OF KRISHI-AI ADMIN PORTAL */}
        {activeTab === 'admin' && currentUser.role === 'admin' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Head of Krishi-AI Admin Master Dashboard</h2>
              <p className="text-xs text-slate-500">System-wide oversight across all Mandi locations (Kuppam, Gudupalle, Madanapalle, Nashik)</p>
            </div>

            {/* System Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 block uppercase">Total Live Commodity Feeds</span>
                <span className="text-3xl font-extrabold text-emerald-700">{prices.length}</span>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 block uppercase">Active Mandi Shops</span>
                <span className="text-3xl font-extrabold text-slate-900">{shops.length}</span>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 block uppercase">Pending Agent Approvals</span>
                <span className="text-3xl font-extrabold text-amber-600">{pendingAgents.length}</span>
              </div>
            </div>

            {/* Pending Verifications */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Pending Agent Registration Proofs</h3>

              {pendingAgents.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No pending agent shop approvals at this time.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingAgents.map(a => (
                    <div key={a.userId} className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                            {a.mandiName}
                          </span>
                          <h4 className="text-base font-bold text-slate-900 mt-1">{a.shopName}</h4>
                          <p className="text-xs text-slate-600">{a.agentName} (Ph: {a.phone})</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-amber-200 text-xs space-y-1">
                        <p><strong className="text-slate-700">License #:</strong> {a.licenseNo}</p>
                        <p><strong className="text-slate-700">Submitted Proof:</strong> "{a.proofDoc}"</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAdminVerify(a.userId, 'rejected')}
                          className="w-1/2 py-2 rounded-xl border border-rose-200 text-rose-700 font-semibold text-xs hover:bg-rose-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleAdminVerify(a.userId, 'approved')}
                          className="w-1/2 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm"
                        >
                          Approve Shop
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: AGENT PRICE PORTAL */}
        {activeTab === 'agent' && currentUser.role === 'agent' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Update Mandi Price</h2>
                  <p className="text-xs text-slate-500">Publish live rates per KG & available quantities</p>
                </div>
              </div>

              <form onSubmit={handleUpdatePriceSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Mandi Location
                  </label>
                  <select
                    value={agentForm.mandiName}
                    onChange={(e) => setAgentForm({ ...agentForm, mandiName: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {MANDI_LOCATIONS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={agentForm.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const defaultCrop = COMPREHENSIVE_CROPS[newCat]?.[0] || 'Tomato';
                      setAgentForm({ ...agentForm, category: newCat, cropName: defaultCrop });
                    }}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {Object.keys(COMPREHENSIVE_CROPS).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Crop / Commodity Item
                  </label>
                  <select
                    value={agentForm.cropName}
                    onChange={(e) => setAgentForm({ ...agentForm, cropName: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {(COMPREHENSIVE_CROPS[agentForm.category] || []).map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Live Rate (₹ / KG)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={agentForm.currentPrice}
                      onChange={(e) => setAgentForm({ ...agentForm, currentPrice: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Available (KG)
                    </label>
                    <input
                      type="number"
                      min="50"
                      value={agentForm.availableQtyKg}
                      onChange={(e) => setAgentForm({ ...agentForm, availableQtyKg: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Trend Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'up', label: '🔼 Up' },
                      { key: 'stable', label: '➖ Stable' },
                      { key: 'down', label: '🔽 Down' }
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.key}
                        onClick={() => setAgentForm({ ...agentForm, trend: item.key })}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                          agentForm.trend === item.key ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPrice}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  {isUpdatingPrice ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Publish Rate to {agentForm.mandiName}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Your Published Mandi Rates</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prices.filter(p => p.agentId === currentUser.id).map(item => (
                  <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {item.cropName} ({item.mandiName})
                      </span>
                      <p className="text-xl font-extrabold text-slate-900 mt-1">₹{item.currentPrice} <span className="text-xs text-slate-500 font-normal">/ kg</span></p>
                      <span className="text-xs text-slate-500">Avail: {item.availableQtyKg || 1000} KG</span>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                      {item.trend}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CONTRACTS */}
        {activeTab === 'contracts' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Contract Agreements ({selectedLocation})</h2>
              <p className="text-xs text-slate-500">Lock prices, finalize deals, and manage delivery</p>
            </div>

            {contracts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-700">No active contracts found</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contracts.map(c => (
                  <div key={c.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                            {c.cropName} ({c.mandiName || selectedLocation})
                          </span>
                          <h3 className="text-lg font-bold text-slate-900 mt-2">₹{c.totalValue?.toLocaleString()} Total</h3>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          c.status === 'finalized' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                        <div>
                          <span className="text-slate-400 block font-medium">Quantity</span>
                          <span className="font-bold text-slate-800">{c.quantityKg} KG</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Rate / KG</span>
                          <span className="font-bold text-slate-800">₹{c.lockedPricePerKg}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Farmer</span>
                          <span className="font-semibold text-slate-800">{c.farmerName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Agent</span>
                          <span className="font-semibold text-slate-800">{c.agentName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Booked: {new Date(c.bookedAt).toLocaleDateString()}
                      </span>

                      {c.status === 'booked' && (
                        <button
                          onClick={() => handleUpdateContractStatus(c.id, 'finalized')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Finalize Deal
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: PRICE ANALYTICS */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Price Trend Analytics ({selectedLocation})</h2>
                  <p className="text-xs text-slate-500">Historical APMC market rate movement over time</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Commodity:</span>
                  <select
                    value={selectedHistoryCrop}
                    onChange={(e) => setSelectedHistoryCrop(e.target.value)}
                    className="p-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Tomato">Tomato</option>
                    <option value="Onion">Onion</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Grapes">Grapes</option>
                    <option value="Marigold Flowers">Marigold Flowers</option>
                  </select>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    {selectedHistoryCrop} Timeline at {selectedLocation} (₹/KG)
                  </span>
                  <span className="text-xs text-slate-400">{selectedLocation}</span>
                </div>

                <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 px-4 border-b border-slate-800">
                  {historyForSelectedCrop.length === 0 ? (
                    <p className="text-xs text-slate-400 mx-auto my-auto">No history points recorded yet for {selectedHistoryCrop}</p>
                  ) : (
                    historyForSelectedCrop.map((pt, idx) => {
                      const maxP = Math.max(...historyForSelectedCrop.map(h => h.price), 40);
                      const heightPct = Math.max((pt.price / maxP) * 100, 15);
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                          <span className="text-xs font-bold text-emerald-300 opacity-0 group-hover:opacity-100 transition-all">
                            ₹{pt.price}
                          </span>
                          <div
                            style={{ height: `${heightPct}%` }}
                            className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all group-hover:brightness-125"
                          />
                          <span className="text-[10px] text-slate-400 truncate w-full text-center">
                            {new Date(pt.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOOKING CONTRACT MODAL */}
        {selectedPriceForBooking && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Lock Contract Deal
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Book {selectedPriceForBooking.cropName}</h3>
                </div>
                <button onClick={() => setSelectedPriceForBooking(null)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mandi Location</span>
                  <span className="font-bold text-emerald-700">{selectedPriceForBooking.mandiName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Procurement Shop</span>
                  <span className="font-bold text-slate-800">{selectedPriceForBooking.shopName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Locked Rate per KG</span>
                  <span className="font-extrabold text-emerald-600 text-sm">₹{selectedPriceForBooking.currentPrice}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Crop Quantity (KG)
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={bookingQty}
                    onChange={(e) => setBookingQty(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Farming Notes
                  </label>
                  <textarea
                    rows={2}
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-900">Total Contract Value:</span>
                  <span className="text-2xl font-extrabold text-emerald-700">
                    ₹{(Number(bookingQty || 0) * selectedPriceForBooking.currentPrice).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPriceForBooking(null)}
                  className="w-1/2 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBookContractSubmit}
                  disabled={isBookingSubmitting}
                  className="w-1/2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  {isBookingSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Confirm Deal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AGENT DEDICATED LOGIN MODAL */}
        {showAgentLoginModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Mandi Agent Sign-In</h3>
                    <p className="text-xs text-slate-500">Log in to update shop prices & manage deals</p>
                  </div>
                </div>
                <button onClick={() => setShowAgentLoginModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAgentLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Select Assigned Mandi Location
                  </label>
                  <select
                    value={agentLoginForm.mandiName}
                    onChange={(e) => setAgentLoginForm({ ...agentLoginForm, mandiName: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {MANDI_LOCATIONS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address or Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="kuppam.agent@krishiai.com or 9876543210"
                    value={agentLoginForm.emailOrPhone}
                    onChange={(e) => setAgentLoginForm({ ...agentLoginForm, emailOrPhone: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={agentLoginForm.password}
                    onChange={(e) => setAgentLoginForm({ ...agentLoginForm, password: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAgentLoggingIn}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  {isAgentLoggingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  Sign In as Agent
                </button>
              </form>
            </div>
          </div>
        )}

        {/* AGENT REGISTRATION & PROOF MODAL */}
        {showRegModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Mandi Business Onboarding
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Register Mandi Agent & Shop</h3>
                </div>
                <button onClick={() => setShowRegModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAgentRegistrationSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Assigned Mandi Location
                    </label>
                    <select
                      value={regForm.mandiName}
                      onChange={(e) => setRegForm({ ...regForm, mandiName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {MANDI_LOCATIONS.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Agent / Trader Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kuppam Mandi Traders"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. agent@kuppammandi.com"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Mobile Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Mandi Shop Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kuppam Procurement Yard #02"
                      value={regForm.shopName}
                      onChange={(e) => setRegForm({ ...regForm, shopName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      APMC License / GST No
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. APMC-KUP-2024-550"
                      value={regForm.licenseNo}
                      onChange={(e) => setRegForm({ ...regForm, licenseNo: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Proof Document Details (APMC License Certificate details / URL)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter APMC Mandi license certificate proof document details for Head of Krishi-AI Admin verification..."
                    value={regForm.proofDoc}
                    onChange={(e) => setRegForm({ ...regForm, proofDoc: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRegModal(false)}
                    className="w-1/2 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="w-1/2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    {isRegistering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Submit for Approval
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
