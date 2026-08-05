import React, { createContext, useState, useContext, useCallback } from 'react';
import {
  getHomeFeed,
  executeSearch,
  getSuggestions,
  getCategories,
  getRecommendations,
  getWishlist,
  toggleWishlist,
  getNurseryDetail,
  getCropDetails,
  getMapData,
  addReview,
  getOrders,
} from '../lib/nurseryApi';

export const NurseryContext = createContext();

export function NurseryProvider({ children }) {
  const [nursery, setNursery] = useState(null);
  const [plants, setPlants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);

  // Marketplace state
  const [feed, setFeed] = useState(null);
  const [feedLoading, setFeedLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState({ locations: [], nurseries: [], crops: [] });
  const [filters, setFilters] = useState({});
  const [location, setLocation] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [wishlist, setWishlist] = useState({ nurseries: [], crops: [] });
const [cart, setCart] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [nurseryDetail, setNurseryDetail] = useState(null);
  const [cropDetails, setCropDetails] = useState(null);
  const [mapData, setMapData] = useState({ nurseries: [] });
  const [reviews, setReviews] = useState([]);

  // ============================================================
  // Feed
  // ============================================================
  const loadFeed = useCallback(async (opts = {}) => {
    setFeedLoading(true);
    try {
      const params = {};
      const loc = opts.location || location;
      if (loc?.lat && loc?.lng) {
        params.lat = loc.lat;
        params.lng = loc.lng;
      }
      const res = await getHomeFeed(params);
      setFeed(res.data);
      return res.data;
    } catch (err) {
      console.error('Feed load failed', err);
      return null;
    } finally {
      setFeedLoading(false);
    }
  }, [location]);

  // ============================================================
  // Categories
  // ============================================================
  const loadCategories = useCallback(async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
      return res.data;
    } catch (err) {
      console.error('Categories load failed', err);
      return [];
    }
  }, []);

  // ============================================================
  // Search
  // ============================================================
  const runSearch = useCallback(async (query, overrides = {}) => {
    setSearching(true);
    try {
      const opts = { query, ...location, filters };
      const merged = { ...opts, ...overrides };
      const res = await executeSearch(merged);
      setSearchResults(res.data);
      return res.data;
    } catch (err) {
      console.error('Search failed', err);
      return null;
    } finally {
      setSearching(false);
    }
  }, [location, filters]);

  const fetchSuggestions = useCallback(async (query) => {
    if (!query || !query.trim()) {
      setSuggestions({ locations: [], nurseries: [], crops: [] });
      return;
    }
    try {
      const res = await getSuggestions({ query, ...location });
      setSuggestions(res.data);
    } catch (err) {
      console.error('Suggestions failed', err);
    }
  }, [location]);

  // ============================================================
  // Wishlist
  // ============================================================
  const loadWishlist = useCallback(async () => {
    try {
      const res = await getWishlist({ ...location });
      setWishlist(res.data);
      return res.data;
    } catch (err) {
      console.error('Wishlist load failed', err);
      return { nurseries: [], crops: [] };
    }
  }, [location]);

  const toggleSave = useCallback(async (type, itemId) => {
    try {
      const res = await toggleWishlist({ type, item_id: itemId });
      await loadWishlist();
      return res.data;
    } catch (err) {
      console.error('Toggle wishlist failed', err);
      return { saved: false };
    }
  }, [loadWishlist]);

  // ============================================================
  // AI Recommendations
  // ============================================================
  const loadRecommendations = useCallback(async (limit = 6) => {
    try {
      const res = await getRecommendations({ limit });
      return res.data;
    } catch (err) {
      console.error('Recommendations failed', err);
      return [];
    }
  }, []);

  // ============================================================
  // Cart
  // ============================================================
  const addToCart = useCallback((crop, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.plantId === crop.plantId);
      if (existing) {
        return prev.map((i) => (i.plantId === crop.plantId ? { ...i, quantity: i.quantity + qty } : i));
      }
      return [...prev, { plantId: crop.plantId, nurseryId: crop.nurseryId, name: crop.plantName, price: crop.price, quantity: qty, imageUrl: crop.imageUrl }];
    });
  }, []);

  const removeFromCart = useCallback((plantId) => {
    setCart((prev) => prev.filter((i) => i.plantId !== plantId));
  }, []);

const clearCart = useCallback(() => setCart([]), []);

  // ============================================================
  // Details / Map / Orders / Reviews
  // ============================================================
  const loadNurseryDetail = useCallback(async (id) => {
    try {
      const res = await getNurseryDetail(id);
      setNurseryDetail(res.data);
      return res.data;
    } catch (err) {
      console.error('Nursery detail failed', err);
      return null;
    }
  }, []);

  const loadCropDetails = useCallback(async (id) => {
    try {
      const res = await getCropDetails(id);
      setCropDetails(res.data);
      return res.data;
    } catch (err) {
      console.error('Crop details failed', err);
      return null;
    }
  }, []);

  const loadMapData = useCallback(async () => {
    try {
      const params = {};
      if (location?.lat && location?.lng) {
        params.lat = location.lat;
        params.lng = location.lng;
      }
      const res = await getMapData(params);
      setMapData(res.data || { nurseries: [] });
      return res.data;
    } catch (err) {
      console.error('Map data failed', err);
      return { nurseries: [] };
    }
  }, [location]);

  const loadOrders = useCallback(async () => {
    try {
      const res = await getOrders();
      setOrders(res.data);
      return res.data;
    } catch (err) {
      console.error('Orders load failed', err);
      return [];
    }
  }, []);

  const applyFilters = useCallback(async () => {
    // Re-run search with current filters if a query exists
    if (searchResults?.intent?.originalQuery) {
      await runSearch(searchResults.intent.originalQuery);
    }
  }, [searchResults, runSearch]);

  const resetFilters = useCallback(() => setFilters({}), []);

  const submitReview = useCallback(async (nurseryId, rating, comment) => {
    try {
      const res = await addReview({ nursery_id: nurseryId, rating, comment });
      await loadNurseryDetail(nurseryId);
      return res.data;
    } catch (err) {
      console.error('Review submit failed', err);
      return null;
    }
  }, [loadNurseryDetail]);

  const resetNursery = useCallback(() => {
    setNursery(null);
    setPlants([]);
    setOrders([]);
    setSelectedPlant(null);
    setSearchResults(null);
    setCart([]);
  }, []);

  const value = {
    nursery, setNursery,
    plants, setPlants,
    orders, setOrders,
    selectedPlant, setSelectedPlant,
    resetNursery,
    // marketplace
    feed, feedLoading, loadFeed,
    categories, loadCategories,
    searchResults, searching, runSearch, applyFilters, resetFilters,
    suggestions, fetchSuggestions,
    filters, setFilters,
    location, setLocation,
    darkMode, setDarkMode,
    wishlist, loadWishlist, toggleSave,
    cart, addToCart, removeFromCart, clearCart,
    loadRecommendations,
    notifications, setNotifications,
nurseryDetail, loadNurseryDetail, getNurseryDetail: loadNurseryDetail,
    cropDetails, loadCropDetails, getCropDetails: loadCropDetails,
    mapData, loadMapData, getMapData: loadMapData,
    reviews, submitReview, submissions: { submitReview },
    loadOrders,
  };

  return (
    <NurseryContext.Provider value={value}>
      {children}
    </NurseryContext.Provider>
  );
}

export const useNursery = () => useContext(NurseryContext);
