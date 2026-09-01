import { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  CakeSlice,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  Edit3,
  ExternalLink,
  Facebook,
  Flame,
  Gift,
  Globe2,
  Heart,
  Home,
  Instagram,
  LayoutGrid,
  Leaf,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  History,
  Minus,
  Package,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Timer,
  Truck,
  User,
  X,
  Zap,
  Trash2,
  Info,
  LogOut,
  Navigation,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import CategoryManager from '../components/admin/CategoryManager';
import AddonManager from '../components/admin/AddonManager';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_BASE_URL = API_URL.replace(/\/api\/?$/, '');

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_BASE_URL}${cleanPath}`;
};

const checkoutOptions = [
  { key: 'name', requiredByDefault: true },
  { key: 'phone', requiredByDefault: true },
  { key: 'email' },
  { key: 'address', requiredByDefault: true },
  { key: 'deliveryDate', requiredByDefault: true },
  { key: 'dob' },
  { key: 'anniversaryDate' },
  { key: 'specialDate' },
  { key: 'specialDateDescription' },
  { key: 'orderNotes' }
];

const defaultCheckoutFields = checkoutOptions.reduce((acc, item) => ({
  ...acc,
  [item.key]: { visible: true, required: Boolean(item.requiredByDefault) }
}), {});

const normalizeCheckoutFields = (fields = {}) => checkoutOptions.reduce((acc, item) => {
  const saved = fields?.[item.key];
  if (typeof saved === 'boolean') {
    acc[item.key] = { visible: saved, required: saved && Boolean(item.requiredByDefault) };
    return acc;
  }

  acc[item.key] = {
    visible: saved?.visible !== false,
    required: saved?.required === true
  };
  return acc;
}, {});

const defaultSettings = {
  bakeryName: 'Oneness Bakery',
  appName: 'Oneness Bakery',
  address: 'Ramnagar chowk, 617, Ambar Talab West, Ganeshpur, Roorkee, Shafipur, Uttarakhand 247667',
  phone: '079008 42550',
  whatsappNumber: '079008 42550',
  instagram: 'https://www.instagram.com/onenessbakery/',
  facebook: 'https://www.facebook.com/OnenessBakeryCafe/',
  googleReviewUrl: 'https://share.google/CuRx6C3eNHDyasuC2',
  openingHours: 'Tuesday – Monday: 10:00 AM – 10:00 PM',
  aboutText: "Indulge in the sweetness of Oneness Bakery Cafe, Roorkee's premier eggless cake shop, where traditional baking meets innovative flavors. Our expert bakers craft delicious, allergy-friendly treats that will delight your senses. Visit us in the heart of Roorkee, Uttarakhand, and discover a world of eggless wonders. Treat yourself to a slice of heaven, and let us make your special moments unforgettable. Come, taste the difference, and experience the Oneness!",
  appIcon: '',
  currency: '₹',
  offerBanners: [],
  quickLinks: [],
  checkoutFields: defaultCheckoutFields
};

const FREE_DELIVERY_MINIMUM = 499;
const DELIVERY_CHARGE = 35;
const SAVED_CUSTOMER_KEY = 'bakeryStoreCustomerProfile';
const CUSTOMER_TOKEN_KEY = 'bakeryStoreCustomerToken';
const DISMISSED_FIELDS_KEY = 'bakeryStoreDismissedProfileFields';

const categoryStyles = {
  all: { label: 'All', icon: CakeSlice, emoji: '🎂', subtitle: 'Explore our complete freshly baked artisanal collection' },
  Bestsellers: { label: 'Bestsellers', icon: Flame, emoji: '🔥', subtitle: 'Customer favorites & highest rated bakery delights' },
  'Bestsellers 🔥': { label: 'Bestsellers', icon: Flame, emoji: '🔥', subtitle: 'Customer favorites & highest rated bakery delights' },
  Cakes: { label: 'Cakes', icon: CakeSlice, emoji: '🎂', subtitle: 'Handcrafted celebration cakes baked fresh every morning' },
  'Bento Cakes': { label: 'Bento', icon: Package, emoji: '🍱', subtitle: 'Cute 250g mini bento cakes with custom messages & designs' },
  'Theme Cakes': { label: 'Theme', icon: Sparkles, emoji: '✨', subtitle: 'Stunning 3D designer & handcrafted theme cakes for special events' },
  'Photo Cakes': { label: 'Photo', icon: Heart, emoji: '📸', subtitle: 'Personalized edible high-definition photo printed cakes' },
  Cupcakes: { label: 'Cupcakes', icon: CakeSlice, emoji: '🧁', subtitle: 'Soft & fluffy frosted cupcakes in delicious gourmet flavors' },
  Pastries: { label: 'Pastries', icon: Sparkles, emoji: '🥐', subtitle: 'Rich layered cream slices & authentic European pastries' },
  Breads: { label: 'Breads', icon: Flame, emoji: '🍞', subtitle: 'Freshly baked whole wheat, sourdough & garlic breads' },
  Cookies: { label: 'Cookies', icon: Star, emoji: '🍪', subtitle: 'Crispy butter cookies, choco-chip biscuits & savory bites' },
  Desserts: { label: 'Desserts', icon: Heart, emoji: '🍮', subtitle: 'Decadent jar cakes, tiramisu & sweet dessert cups' },
  Snacks: { label: 'Snacks', icon: ShoppingBag, emoji: '🥪', subtitle: 'Hot savory bakery puffs, quiches & fresh paneer rolls' },
  'Dry Cakes': { label: 'Dry Cakes', icon: Package, emoji: '🎁', subtitle: 'Classic tea-time fruit cakes, walnut cakes & dry sponges' },
  Donuts: { label: 'Donuts', icon: CakeSlice, emoji: '🍩', subtitle: 'Soft, fluffy & delicious glazed gourmet donuts' },
};

const getProductCardBadge = (product, index) => {
  // Do NOT put badge on every card! Only show on ~30% of cards (beech-beech mai)
  if (index % 3 !== 0 && !product.isBestseller && !product.isPopular) {
    return null;
  }
  if (product.isBestseller || index % 6 === 0) return '🔥 Bestseller';
  if (product.isPopular || index % 6 === 3) return '✨ Top Rated';
  return '🌟 Most Popular';
};

const formatWeight = (product) => {
  const weight = [product.weight, product.weightUnit].filter(Boolean).join(' ').trim();
  return weight || 'Fresh batch';
};

const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const defaultBanners = [
  { image: '/upload/banners/hero_birthday.png', badge: 'Make Birthdays Magical', title: 'Handcrafted Fresh Eggless Cakes', description: 'Celebrate every birthday with custom baked eggless cakes.' },
  { image: '/upload/banners/hero_designer.png', badge: 'Custom Designer Cakes', title: 'Made For Your Special Moments', description: 'Intricate 3D theme cakes, photo cakes, and designer creations.' },
  { image: '/upload/banners/hero_anniversary.png', badge: 'Celebrate Love & Togetherness', title: 'Express Same Day Cake Delivery', description: 'Romantic anniversary cakes baked fresh & delivered fast.' },
  { image: '/upload/banners/hero_hampers.png', badge: 'Sweet Delights & Gift Hampers', title: 'Share Happiness Every Day', description: 'Gourmet dessert hampers, brownies, macarons & jar cakes.' }
];

const Store = () => {
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [cart, setCart] = useState([]);
  const [pendingCartAction, setPendingCartAction] = useState(null);
  const [authExists, setAuthExists] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showQuickLinks, setShowQuickLinks] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [savedCustomerProfile, setSavedCustomerProfile] = useState(null);
  const [showCustomerProfile, setShowCustomerProfile] = useState(false);
  const [customerToken, setCustomerToken] = useState('');
  const [dismissedProfileFields, setDismissedProfileFields] = useState({});
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('bakeryStoreWishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const triggerAuthFlow = (callback = null) => {
    setAuthCallback(() => callback);
    setAuthStep(1);
    setAuthTab('login');
    setAuthIdentifier('');
    setAuthRegisterEmail('');
    setAuthRegisterPhone('');
    setAuthOtp('');
    setAuthExists(true);
    setAuthProfileData({ name: '', phone: '', email: '', dob: '', anniversary: '', specialDate: '', specialDateDescription: '', address: '' });
    setShowAuthModal(true);
  };

  const toggleWishlist = (e, product) => {
    e.stopPropagation();
    if (!customerToken && !savedCustomerProfile) {
      triggerAuthFlow(() => {
        setWishlist(prev => {
          const exists = prev.includes(product._id);
          const updated = exists ? prev.filter(id => id !== product._id) : [...prev, product._id];
          
          const now = Date.now();
          if (lastToastRef.current.id !== product._id || now - lastToastRef.current.time > 500) {
            lastToastRef.current = { id: product._id, time: now };
            if (exists) {
              toast.success(`${product.name} removed from Wishlist`);
            } else {
              toast.success(`❤️ ${product.name} saved to Wishlist!`);
            }
          }

          try {
            localStorage.setItem('bakeryStoreWishlist', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      });
      return;
    }
    setWishlist(prev => {
      const exists = prev.includes(product._id);
      const updated = exists ? prev.filter(id => id !== product._id) : [...prev, product._id];

      const now = Date.now();
      if (lastToastRef.current.id !== product._id || now - lastToastRef.current.time > 500) {
        lastToastRef.current = { id: product._id, time: now };
        if (exists) {
          toast.success(`${product.name} removed from Wishlist`);
        } else {
          toast.success(`❤️ ${product.name} saved to Wishlist!`);
        }
      }

      try {
        localStorage.setItem('bakeryStoreWishlist', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [infoModal, setInfoModal] = useState(null);
  const [isStandaloneApp, setIsStandaloneApp] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedDetailVariant, setSelectedDetailVariant] = useState(null);
  const [cakeMessage, setCakeMessage] = useState('');
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [descExpanded, setDescExpanded] = useState(false);
  const [selectedFlavour, setSelectedFlavour] = useState(null);
  const [variantProduct, setVariantProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [activeBanner, setActiveBanner] = useState(0);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [activeView, setActiveView] = useState('store');
  const [loginPhone, setLoginPhone] = useState('');
  const [publicCoupons, setPublicCoupons] = useState([]);
  
  // Custom auth modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState(1); // 1: Identifier/Method, 2: Verify OTP, 3: Register details
  const [authTab, setAuthTab] = useState('login'); // 'login' or 'register'
  const [authIdentifier, setAuthIdentifier] = useState(''); // email or phone for login
  const [authRegisterEmail, setAuthRegisterEmail] = useState('');
  const [authRegisterPhone, setAuthRegisterPhone] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authProfileData, setAuthProfileData] = useState({
    name: '',
    phone: '',
    email: '',
    dob: '',
    anniversary: '',
    specialDate: '',
    specialDateDescription: '',
    address: ''
  });
  const [authCallback, setAuthCallback] = useState(null);
  const [authMethod, setAuthMethod] = useState('whatsapp'); // 'whatsapp' or 'email'
  const [authTargetEmail, setAuthTargetEmail] = useState('');
  const [authVerifiedProfile, setAuthVerifiedProfile] = useState(null);
  const [showProfilePreviewModal, setShowProfilePreviewModal] = useState(false);

  // Profile sidebar active tab state
  const [activeProfileTab, setActiveProfileTab] = useState('orders'); // 'orders', 'wishlist', 'wallet', 'address', 'upi', 'settings'

  // Stepper checkout state
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [checkoutAuthStep, setCheckoutAuthStep] = useState(1); // 1: input, 2: verify OTP
  const [checkoutAuthMethod, setCheckoutAuthMethod] = useState('whatsapp'); // 'whatsapp' or 'email'
  const [checkoutIdentifier, setCheckoutIdentifier] = useState('');
  const [checkoutOtp, setCheckoutOtp] = useState('');
  const [checkoutTargetEmail, setCheckoutTargetEmail] = useState('');
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackPhone, setTrackPhone] = useState('');
  const [trackOrderId, setTrackOrderId] = useState('');
  const [customCakeProduct, setCustomCakeProduct] = useState(null);
  const [customCakeForm, setCustomCakeForm] = useState({
    flavour: 'Chocolate',
    shape: 'Round',
    message: '',
    eggless: false,
    referenceImage: '',
    variant: null
  });
  const [redeemingPoints, setRedeemingPoints] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [showPwaBanner, setShowPwaBanner] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [egglessFilter, setEgglessFilter] = useState(false);
  const [complimentaryProducts, setComplimentaryProducts] = useState([]);
  const [activeBottomTab, setActiveBottomTab] = useState('home');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [openDropdownGroup, setOpenDropdownGroup] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(() => localStorage.getItem('user_location') || 'Jaipur - Select Area / Pincode');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectingLocId, setDetectingLocId] = useState(null);
  const [sortBy, setSortBy] = useState('popular');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [subCategoryFilter, setSubCategoryFilter] = useState('all');
  const [subSubCategoryFilter, setSubSubCategoryFilter] = useState('all');
  const [categoryTree, setCategoryTree] = useState([]);

  const displayCategoryTree = useMemo(() => {
    if (categoryTree && categoryTree.length > 0) {
      return categoryTree.map(cat => ({
        ...cat,
        subcategories: cat.subcategories || []
      }));
    }

    // Only derive from real products if categoryTree is not loaded yet
    const uniqueCats = [...new Set((products || []).map(p => p.category || p.mainCategory).filter(Boolean))];
    return uniqueCats.map((catName, idx) => {
      const catProducts = (products || []).filter(p => (p.category || p.mainCategory || '').toLowerCase() === catName.toLowerCase());
      const subNames = [...new Set(catProducts.map(p => p.subCategory).filter(Boolean))];
      return {
        _id: `prod-cat-${idx}`,
        name: catName,
        image: catProducts[0]?.images?.[0] || catProducts[0]?.image || '',
        subcategories: subNames.map((s, sIdx) => ({
          _id: `prod-sub-${idx}-${sIdx}`,
          name: s
        }))
      };
    });
  }, [categoryTree, products]);
  const [availableAddons, setAvailableAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState({});
  const [showAllAddons, setShowAllAddons] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showAddonManager, setShowAddonManager] = useState(false);
  const pwaBannerShown = useRef(false);
  const lastToastRef = useRef({ id: '', time: 0 });
  const [showMobileScrollSearch, setShowMobileScrollSearch] = useState(false);
  const [showMobileCategoriesModal, setShowMobileCategoriesModal] = useState(false);
  const [activeNavPopover, setActiveNavPopover] = useState(null);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem('bakeryStoreCart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setShowMobileScrollSearch(scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isPopstateHandlingRef = useRef(false);
  const pushedHistoryCountRef = useRef(0);

  const currentNavKey = useMemo(() => {
    // 1. All Modals and Overlays
    if (infoModal) return `infoModal_${infoModal}`;
    if (showUpiModal) return 'showUpiModal';
    if (showTrackModal) return 'showTrackModal';
    if (showProfilePreviewModal) return 'showProfilePreviewModal';
    if (showAuthModal) return `showAuthModal_${authStep}`;
    if (customCakeProduct) return 'customCakeProduct';
    if (variantProduct) return 'variantProduct';
    if (selectedProduct) return `selectedProduct_${selectedProduct._id || '1'}`;
    if (showCheckout) return `showCheckout_step_${checkoutStep}`;
    if (showCart) return 'showCart';
    if (showSearchModal) return 'showSearchModal';
    if (showLocationModal) return 'showLocationModal';
    if (showMobileCategoriesModal) return 'showMobileCategoriesModal';
    if (showQuickLinks) return 'showQuickLinks';
    if (showSortMenu) return 'showSortMenu';

    // 2. Profile Sidebars / Drawers & Subtabs
    if (showCustomerProfile) return `showCustomerProfile_${activeProfileTab}`;

    // 3. Main Page Views
    if (activeView !== 'store') return `view_${activeView}`;

    // 4. Bottom Navbar Tabs
    if (activeBottomTab !== 'home') return `tab_${activeBottomTab}`;

    // 5. Dropdowns, Category & Search Filters
    if (openDropdownGroup) return `dropdown_${openDropdownGroup}`;
    if (subCategoryFilter !== 'all') return `subCategory_${subCategoryFilter}`;
    if (filterCategory !== 'all') return `category_${filterCategory}`;
    if (searchTerm !== '') return `search_${searchTerm}`;

    return 'home';
  }, [
    infoModal,
    showUpiModal,
    showTrackModal,
    showProfilePreviewModal,
    showAuthModal,
    authStep,
    customCakeProduct,
    variantProduct,
    selectedProduct,
    showCheckout,
    checkoutStep,
    showCart,
    showSearchModal,
    showLocationModal,
    showMobileCategoriesModal,
    showQuickLinks,
    showSortMenu,
    showCustomerProfile,
    activeProfileTab,
    activeView,
    activeBottomTab,
    openDropdownGroup,
    subCategoryFilter,
    filterCategory,
    searchTerm
  ]);

  const prevNavKeyRef = useRef('home');

  // Listen for browser popstate (mobile side-swipe back or device back button)
  useEffect(() => {
    const handlePopState = () => {
      isPopstateHandlingRef.current = true;

      // Close topmost active modal or view
      if (infoModal) { setInfoModal(null); }
      else if (showUpiModal) { setShowUpiModal(false); }
      else if (showTrackModal) { setShowTrackModal(false); }
      else if (showProfilePreviewModal) { setShowProfilePreviewModal(false); }
      else if (showAuthModal) {
        if (authStep > 1) { setAuthStep(prev => prev - 1); }
        else { setShowAuthModal(false); }
      }
      else if (customCakeProduct) { setCustomCakeProduct(null); }
      else if (variantProduct) { setVariantProduct(null); }
      else if (selectedProduct) { setSelectedProduct(null); setActiveView('store'); }
      else if (showCheckout) {
        if (checkoutStep > 1) { setCheckoutStep(prev => prev - 1); }
        else { setShowCheckout(false); }
      }
      else if (showCart) { setShowCart(false); }
      else if (showSearchModal) { setShowSearchModal(false); }
      else if (showLocationModal) { setShowLocationModal(false); }
      else if (showMobileCategoriesModal) { setShowMobileCategoriesModal(false); }
      else if (showQuickLinks) { setShowQuickLinks(false); }
      else if (showSortMenu) { setShowSortMenu(false); }
      else if (openDropdownGroup) { setOpenDropdownGroup(null); }
      else if (showCustomerProfile) { setShowCustomerProfile(false); }
      else if (activeView !== 'store') { setActiveView('store'); setActiveBottomTab('home'); }
      else if (activeBottomTab !== 'home') { setActiveBottomTab('home'); setActiveView('store'); }
      else if (subCategoryFilter !== 'all') { setSubCategoryFilter('all'); }
      else if (filterCategory !== 'all') { setFilterCategory('all'); }
      else if (searchTerm !== '') { setSearchTerm(''); }

      if (pushedHistoryCountRef.current > 0) {
        pushedHistoryCountRef.current -= 1;
      }

      setTimeout(() => {
        isPopstateHandlingRef.current = false;
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [
    infoModal,
    showUpiModal,
    showTrackModal,
    showProfilePreviewModal,
    showAuthModal,
    authStep,
    customCakeProduct,
    variantProduct,
    selectedProduct,
    showCheckout,
    checkoutStep,
    showCart,
    showSearchModal,
    showLocationModal,
    showMobileCategoriesModal,
    showQuickLinks,
    showSortMenu,
    showCustomerProfile,
    activeView,
    activeBottomTab,
    openDropdownGroup,
    subCategoryFilter,
    filterCategory,
    searchTerm
  ]);

  // Synchronize history.pushState when modals/tabs change via UI clicks
  useEffect(() => {
    if (isPopstateHandlingRef.current) {
      prevNavKeyRef.current = currentNavKey;
      return;
    }

    if (currentNavKey !== 'home' && prevNavKeyRef.current === 'home') {
      window.history.pushState({ bakeryState: currentNavKey }, '', window.location.href);
      pushedHistoryCountRef.current += 1;
    } else if (currentNavKey !== 'home' && prevNavKeyRef.current !== 'home' && currentNavKey !== prevNavKeyRef.current) {
      window.history.pushState({ bakeryState: currentNavKey }, '', window.location.href);
      pushedHistoryCountRef.current += 1;
    } else if (currentNavKey === 'home' && prevNavKeyRef.current !== 'home') {
      if (pushedHistoryCountRef.current > 0) {
        pushedHistoryCountRef.current -= 1;
        window.history.back();
      }
    }

    prevNavKeyRef.current = currentNavKey;
  }, [currentNavKey]);

  const cityLocalities = [
    { name: 'Malviya Nagar', pincode: '302017' },
    { name: 'Vaishali Nagar', pincode: '302021' },
    { name: 'Mansarovar', pincode: '302020' },
    { name: 'Raja Park', pincode: '302004' },
    { name: 'C Scheme', pincode: '302001' },
    { name: 'Jagatpura', pincode: '302017' },
    { name: 'Tonk Road', pincode: '302018' },
    { name: 'Bani Park', pincode: '302016' },
    { name: 'Vidhyadhar Nagar', pincode: '302039' },
    { name: 'Sodala', pincode: '302006' }
  ];

  const handleSelectLocality = (locObj) => {
    const locStr = `Jaipur, ${locObj.name} (${locObj.pincode})`;
    setSelectedLocation(locStr);
    localStorage.setItem('user_location', locStr);
    setShowLocationModal(false);
    toast.success(`Delivery area set to ${locObj.name}`);
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      const a = data.address || {};
      const suburb = a.suburb || a.neighbourhood || a.village || a.town || '';
      const city = a.city || a.county || a.state_district || '';
      const postcode = a.postcode || '';
      const road = a.road || '';
      // Build a readable short string
      const parts = [road, suburb, city, postcode].filter(Boolean);
      return parts.join(', ') || data.display_name?.split(',').slice(0, 3).join(',') || 'Live Location';
    } catch {
      return 'Live Location';
    }
  };

  const fallbackIpLocation = async (targetId = null) => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data.city) {
        const locStr = [data.city, data.region, data.postal].filter(Boolean).join(', ');
        if (targetId) {
          const box = document.getElementById(targetId);
          if (box) {
            box.value = locStr;
            box.dispatchEvent(new Event('input', { bubbles: true }));
          }
          toast.success(`Approximate location filled: ${data.city}`);
        } else {
          setSelectedLocation(locStr);
          localStorage.setItem('user_location', locStr);
          setShowLocationModal(false);
          toast.success(`Approximate location set: ${data.city}`);
        }
        setIsDetectingLocation(false);
        setDetectingLocId(null);
        return;
      }
    } catch (e) {}
    setIsDetectingLocation(false);
    setDetectingLocId(null);
    toast.error('Unable to detect location. Please select area manually.');
  };

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);

    const onSuccess = async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const address = await reverseGeocode(latitude, longitude);
        setIsDetectingLocation(false);
        const locStr = address;
        setSelectedLocation(locStr);
        localStorage.setItem('user_location', locStr);
        setShowLocationModal(false);
        toast.success('Live location detected!');
      } catch {
        fallbackIpLocation();
      }
    };

    if (!navigator.geolocation) {
      fallbackIpLocation();
      return;
    }

    // Tier 1: High Accuracy GPS (6s timeout) -> Tier 2: Low Accuracy Wi-Fi/Cell (10s) -> Tier 3: IP Fallback
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      () => {
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          () => fallbackIpLocation(),
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 120000 }
        );
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
    );
  };

  const handleDetectLocationForAddress = (targetId) => {
    setDetectingLocId(targetId);

    const onSuccess = async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        const a = data.address || {};
        const parts = [
          a.house_number ? `${a.house_number}, ${a.road || ''}` : (a.road || ''),
          a.suburb || a.neighbourhood || a.village || '',
          a.city || a.county || '',
          a.state || '',
          a.postcode || ''
        ].map(s => s.trim()).filter(Boolean);
        const fullAddr = parts.join(', ');
        const box = document.getElementById(targetId);
        if (box) {
          box.value = fullAddr;
          box.dispatchEvent(new Event('input', { bubbles: true }));
          if (targetId.startsWith('profile-address-extra-') && savedCustomerProfile) {
            const idx = parseInt(targetId.replace('profile-address-extra-', ''), 10);
            const list = JSON.parse(localStorage.getItem(`addresses_${savedCustomerProfile.phone}`) || '[]');
            list[idx] = fullAddr;
            localStorage.setItem(`addresses_${savedCustomerProfile.phone}`, JSON.stringify(list));
          }
        }
        toast.success('Address filled from live location!');
      } catch {
        fallbackIpLocation(targetId);
      }
      setDetectingLocId(null);
    };

    if (!navigator.geolocation) {
      fallbackIpLocation(targetId);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      () => {
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          () => fallbackIpLocation(targetId),
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 120000 }
        );
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
    );
  };

  const getCustomerAddresses = () => {
    if (!savedCustomerProfile) return [];
    const list = [];
    if (savedCustomerProfile.address?.trim()) {
      list.push({ type: 'Default Address', address: savedCustomerProfile.address });
    }
    try {
      const extras = JSON.parse(localStorage.getItem(`addresses_${savedCustomerProfile.phone}`) || '[]');
      extras.forEach((addr, idx) => {
        if (addr?.trim()) {
          list.push({ type: `Address ${idx + 2}`, address: addr });
        }
      });
    } catch (e) {}
    return list;
  };
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    deliveryDate: '',
    dob: '',
    anniversaryDate: '',
    specialDate: '',
    specialDateDescription: '',
    notes: ''
  });

  useEffect(() => {
    fetchStoreData();
    const storedProfile = localStorage.getItem(SAVED_CUSTOMER_KEY);
    const storedToken = localStorage.getItem(CUSTOMER_TOKEN_KEY);
    const storedDismissedFields = localStorage.getItem(DISMISSED_FIELDS_KEY);
    if (storedToken) setCustomerToken(storedToken);
    if (storedDismissedFields) {
      try {
        setDismissedProfileFields(JSON.parse(storedDismissedFields));
      } catch {
        localStorage.removeItem(DISMISSED_FIELDS_KEY);
      }
    }
    if (storedProfile) {
      try {
        applyCustomerProfile(JSON.parse(storedProfile), false);
      } catch {
        localStorage.removeItem(SAVED_CUSTOMER_KEY);
      }
    }
  }, []);

  useEffect(() => {
    const standalone = window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandaloneApp(standalone);

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event);
      // Auto-show premium PWA banner after 4 seconds (only once)
      if (!standalone && !pwaBannerShown.current) {
        setTimeout(() => {
          pwaBannerShown.current = true;
          setShowPwaBanner(true);
        }, 4000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    const appName = settings.appName || settings.bakeryName || 'Sweet Bakery';
    const rawIcon = settings.appIcon || settings.logo || '/vite.svg';
    document.title = appName;

    const origin = window.location.origin;
    const absoluteIcon = (rawIcon.startsWith('http://') || rawIcon.startsWith('https://') || rawIcon.startsWith('data:'))
      ? rawIcon
      : `${origin}${rawIcon.startsWith('/') ? '' : '/'}${rawIcon}`;

    const manifest = {
      name: appName,
      short_name: appName.slice(0, 12),
      start_url: `${origin}/`,
      scope: `${origin}/`,
      display: 'standalone',
      background_color: '#fffdf9',
      theme_color: '#21170f',
      icons: [
        { src: absoluteIcon, sizes: '192x192', type: absoluteIcon.includes('.svg') ? 'image/svg+xml' : 'image/png', purpose: 'any maskable' },
        { src: absoluteIcon, sizes: '512x512', type: absoluteIcon.includes('.svg') ? 'image/svg+xml' : 'image/png', purpose: 'any maskable' }
      ]
    };
    const manifestUrl = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' }));
    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = manifestUrl;

    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleIcon);
    }
    appleIcon.href = absoluteIcon;

    let faviconLink = document.querySelector('link[rel="icon"]');
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      document.head.appendChild(faviconLink);
    }
    faviconLink.href = absoluteIcon;
    if (absoluteIcon.includes('.svg')) {
      faviconLink.type = 'image/svg+xml';
    } else {
      faviconLink.type = 'image/png';
    }

    return () => URL.revokeObjectURL(manifestUrl);
  }, [settings.appIcon, settings.appName, settings.bakeryName, settings.logo]);

  const activeBanners = useMemo(() => {
    const MAX_BANNERS = 6;
    const configured = (settings.offerBanners || []).filter(banner => banner?.isActive !== false && banner.image);
    if (configured.length >= MAX_BANNERS) {
      return configured;
    }
    const neededDefaultCount = MAX_BANNERS - configured.length;
    const neededDefaults = defaultBanners.slice(0, neededDefaultCount);
    return [...configured, ...neededDefaults];
  }, [settings.offerBanners]);

  useEffect(() => {
    if (activeBanners.length <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % activeBanners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  useEffect(() => {
    if (activeView !== 'product' || !selectedProduct) return undefined;
    const images = getProductImages(selectedProduct);
    if (images.length <= 1) return undefined;

    const timer = setInterval(() => {
      setActiveImage(current => {
        const currentIndex = images.indexOf(current);
        const nextIndex = (currentIndex + 1) % images.length;
        return images[nextIndex] || images[0];
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [activeView, selectedProduct?._id, selectedProduct?.images]);

  useEffect(() => {
    if (showCheckout) {
      if (savedCustomerProfile?.phone) {
        applyCustomerProfile(savedCustomerProfile, false);
      }
      setCheckoutStep(1);
    }
  }, [showCheckout, savedCustomerProfile]);

  const fetchStoreData = async () => {
    setIsLoading(true);
    try {
      const [productResponse, settingsResponse, treeResponse, addonsResponse] = await Promise.all([
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/settings/public`).catch(() => ({ data: { data: defaultSettings } })),
        axios.get(`${API_URL}/categories/tree`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/addons`).catch(() => ({ data: [] }))
      ]);

      const allProducts = (productResponse.data || []).filter(product => product.inStock !== false);
      setProducts(allProducts);
      setCategoryTree(treeResponse.data || []);
      setAvailableAddons(addonsResponse.data || []);
      const publicSettings = settingsResponse.data.data || defaultSettings;
      setSettings({
        ...defaultSettings,
        ...publicSettings,
        offerBanners: publicSettings.offerBanners || [],
        quickLinks: publicSettings.quickLinks || [],
        checkoutFields: normalizeCheckoutFields(publicSettings.checkoutFields)
      });
    } catch {
      toast.error('Store load nahi ho paya');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPublicCoupons = async () => {
    try {
      const phone = orderForm.phone || savedCustomerProfile?.phone || '';
      const { data } = await axios.get(`${API_URL}/campaigns/public-coupons`, {
        params: { phone }
      });
      setPublicCoupons(data || []);
    } catch (err) {
      console.error('Failed to load coupons list', err);
    }
  };

  useEffect(() => {
    fetchPublicCoupons();
  }, [savedCustomerProfile?.phone, showCheckout, orderForm.phone]);

  const fetchCustomerOrders = async (phoneStr) => {
    const phone = phoneStr || orderForm.phone || savedCustomerProfile?.phone || '';
    if (!phone) return;
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/store-orders/customer-orders`, {
        params: { phone }
      });
      setCustomerOrders(data);
    } catch {
      toast.error('Orders load nahi ho paya');
    } finally {
      setIsLoading(false);
    }
  };

  const openOrdersHistory = () => {
    setActiveView('orders');
    fetchCustomerOrders();
  };

  const openTrackOrderModal = () => {
    if (savedCustomerProfile?.phone) {
      setActiveView('orders');
      fetchCustomerOrders();
    } else {
      setTrackPhone('');
      setTrackOrderId('');
      setShowTrackModal(true);
    }
  };

  const handleTrackOrderLookup = async (e) => {
    if (e) e.preventDefault();
    const phone = trackPhone.trim().replace(/\D/g, '');
    const orderId = trackOrderId.trim().replace('#', '');
    
    if (phone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!orderId) {
      toast.error('Please enter a valid Order ID');
      return;
    }
    
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/store-orders/customer-orders`, {
        params: { phone }
      });
      
      const cleanId = orderId.toLowerCase();
      const matchedOrder = data.find(o => 
        o._id.toString().toLowerCase().endsWith(cleanId) ||
        o._id.toString().toLowerCase() === cleanId
      );
      
      if (matchedOrder) {
        setTrackingOrder(matchedOrder);
        setActiveView('tracking');
        setShowTrackModal(false);
        toast.success('Order found!');
      } else {
        toast.error('Order not found. Please check Order ID and Mobile number.');
      }
    } catch (err) {
      toast.error('Failed to load tracking details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const val = authIdentifier.trim();
    if (!val) {
      toast.error('Please enter your Mobile number or Email address');
      return;
    }

    const isEmail = val.includes('@');
    if (isEmail && !val.includes('.')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!isEmail && val.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const recipient = isEmail ? val.toLowerCase() : val.replace(/\D/g, '');
      const type = isEmail ? 'email' : 'whatsapp';

      const { data } = await axios.post(`${API_URL}/store-orders/customer-send-otp`, {
        recipient,
        type
      });

      if (data.success) {
        setAuthTargetEmail(recipient);
        setAuthExists(!!data.exists);
        setAuthStep(2);
        if (data.type === 'email_fallback') {
          toast.success(`WhatsApp unavailable — OTP sent to your registered email (${data.fallbackEmail})`);
        } else {
          toast.success(`Verification code sent via ${isEmail ? 'Email' : 'WhatsApp'}`);
        }
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP send process failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (authOtp.trim().length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/store-orders/customer-verify-otp`, {
        recipient: authTargetEmail,
        otp: authOtp.trim()
      });

      if (data.success) {
        toast.success('Code verified successfully!');
        if (data.data && data.token) {
          persistCustomerSession(data.data, data.token);
          fetchCustomerOrders(data.data.phone);
          setShowAuthModal(false);

          if (data.data.cart && Array.isArray(data.data.cart)) {
            setCart(data.data.cart);
          }

          if (pendingCartAction) {
            const action = pendingCartAction;
            setPendingCartAction(null);
            setTimeout(() => {
              addToCart(action.product, action.variant, action.message, action.addQuantity, action.isBuyNow);
            }, 100);
          }

          if (authCallback) {
            authCallback(data.data);
          }
        } else {
          const isEmail = authTargetEmail.includes('@');
          setAuthProfileData(prev => ({
            ...prev,
            phone: isEmail ? '' : authTargetEmail,
            email: isEmail ? authTargetEmail : ''
          }));
          setAuthStep(3);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterCustomer = async (e) => {
    if (e) e.preventDefault();
    const { name, phone, email, dob, anniversary, specialDate, specialDateDescription, address } = authProfileData;
    if (!name.trim()) {
      toast.error('Full Name is required to register');
      return;
    }

    const isTargetEmail = authTargetEmail.includes('@');
    const finalPhone = phone.trim() || (isTargetEmail ? '' : authTargetEmail);
    const finalEmail = email.trim().toLowerCase() || (isTargetEmail ? authTargetEmail : '');

    if (!finalPhone) {
      toast.error('Mobile number is required');
      return;
    }
    if (!finalEmail) {
      toast.error('Email address is required');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/store-orders/customer-register`, {
        name: name.trim(),
        phone: finalPhone,
        email: finalEmail,
        birthday: dob || undefined,
        anniversary: anniversary || undefined,
        specialDate: specialDate || undefined,
        specialDateDescription: specialDateDescription || undefined,
        address: address || undefined
      });

      if (data.success) {
        persistCustomerSession(data.data, data.token);
        toast.success(`Welcome to ${settings.bakeryName || 'Oneness Bakery'}, ${data.data.customerName}!`);
        setShowAuthModal(false);

        if (pendingCartAction) {
          const action = pendingCartAction;
          setPendingCartAction(null);
          setTimeout(() => {
            addToCart(action.product, action.variant, action.message, action.addQuantity, action.isBuyNow);
          }, 100);
        }

        if (authCallback) {
          authCallback(data.data);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration process failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfileDetails = async (name, email, birthday, anniversary, address, specialDate, specialDateDescription) => {
    if (!name.trim() || !email.trim()) {
      toast.error('Name and Email are required');
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/store-orders/customer-register`, {
        name: name.trim(),
        phone: savedCustomerProfile.phone,
        email: email.trim().toLowerCase(),
        birthday: birthday || undefined,
        anniversary: anniversary || undefined,
        specialDate: specialDate || undefined,
        specialDateDescription: specialDateDescription || undefined,
        address: address || undefined
      });

      if (data.success) {
        const updatedProfile = {
          ...data.data,
          address: address !== undefined ? address : savedCustomerProfile.address
        };
        persistCustomerSession(updatedProfile, customerToken);
        toast.success('Profile details updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckoutSendOtp = async (e) => {
    if (e) e.preventDefault();
    const val = checkoutIdentifier.trim();
    if (!val) {
      toast.error(checkoutAuthMethod === 'email' ? 'Email address is required' : 'WhatsApp number is required');
      return;
    }

    setIsLoading(true);
    try {
      const isEmail = checkoutAuthMethod === 'email';
      const phoneVal = isEmail ? '' : val.replace(/\D/g, '');
      const emailVal = isEmail ? val.toLowerCase() : '';

      if (isEmail && !emailVal.includes('@')) {
        toast.error('Please enter a valid email address');
        setIsLoading(false);
        return;
      }
      if (!isEmail && phoneVal.length < 10) {
        toast.error('Please enter a valid 10-digit mobile number');
        setIsLoading(false);
        return;
      }

      // Store in orderForm temporarily
      if (phoneVal) setOrderForm(prev => ({ ...prev, phone: phoneVal }));
      if (emailVal) setOrderForm(prev => ({ ...prev, email: emailVal }));

      const { data } = await axios.post(`${API_URL}/store-orders/customer-send-otp`, {
        phone: phoneVal || undefined,
        email: emailVal || undefined
      });

      if (data.success) {
        setCheckoutTargetEmail(emailVal || phoneVal);
        setCheckoutAuthStep(2); // Go to verify OTP
        if (data.type === 'email_fallback') {
          toast.success(`WhatsApp unavailable — OTP sent to your registered email (${data.fallbackEmail})`);
        } else {
          toast.success(`OTP code sent via ${isEmail ? 'Email' : 'WhatsApp'}!`);
        }
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckoutVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (checkoutOtp.length !== 6) {
      toast.error('Please enter the 6-digit OTP code');
      return;
    }

    setIsLoading(true);
    try {
      const isEmail = checkoutAuthMethod === 'email';
      const val = checkoutIdentifier.trim();
      const phoneVal = isEmail ? '' : val.replace(/\D/g, '');
      const emailVal = isEmail ? val.toLowerCase() : '';

      const { data } = await axios.post(`${API_URL}/store-orders/customer-verify-otp`, {
        phone: phoneVal || undefined,
        email: emailVal || undefined,
        otp: checkoutOtp
      });

      if (data.success) {
        toast.success('OTP verified successfully!');
        const customerData = data.data || {};
        applyCustomerProfile(customerData, true);

        // Check if customer profile has a name
        if (customerData.customerName) {
          // Existing customer with complete profile -> proceed to Delivery Details (Step 3)
          setCheckoutStep(3);
        } else {
          // New customer or incomplete profile -> go to Details (Step 2)
          setCheckoutStep(2);
        }
      } else {
        toast.error(data.message || 'Invalid OTP code');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };



  const handleCustomerLogout = () => {
    localStorage.removeItem(SAVED_CUSTOMER_KEY);
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    setSavedCustomerProfile(null);
    setCustomerToken('');
    setCustomerOrders([]);
    toast.success('Logged out successfully');
  };

  const categories = useMemo(() => ['all', ...new Set(products.map(product => product.category).filter(Boolean))], [products]);
  const checkoutFields = normalizeCheckoutFields(settings.checkoutFields);
  const showField = (key) => checkoutFields[key]?.visible !== false;
  const isFieldRequired = (key) => showField(key) && checkoutFields[key]?.required === true;
  const fieldMarker = (key) => isFieldRequired(key) ? <span className="text-[#e63946]">*</span> : <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-black uppercase text-gray-500">Optional</span>;
  const currency = settings.currency || 'Rs.';
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const originalTotal = cart.reduce((sum, item) => sum + ((item.originalPrice || item.price) * item.quantity), 0);
  const cartSavings = Math.max(originalTotal - totalAmount, 0);
  const deliveryCharge = totalAmount > 0 && totalAmount < FREE_DELIVERY_MINIMUM ? DELIVERY_CHARGE : 0;
  const freeDeliveryBalance = Math.max(FREE_DELIVERY_MINIMUM - totalAmount, 0);
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'fixed') {
      return Math.min(appliedCoupon.discountValue, totalAmount);
    }
    const pct = appliedCoupon.discountValue || appliedCoupon.discountPercentage || 0;
    return Math.round(totalAmount * (pct / 100));
  }, [appliedCoupon, totalAmount]);

  const pointsToRedeem = useMemo(() => {
    if (!redeemingPoints || !savedCustomerProfile?.loyaltyPoints) return 0;
    const available = savedCustomerProfile.loyaltyPoints;
    const maxDiscount = Math.max(totalAmount - discountAmount, 0);
    const valuePerPoint = settings.loyaltyValuePerPoint || 1;
    const needed = Math.ceil(maxDiscount / valuePerPoint);
    return Math.min(available, needed);
  }, [redeemingPoints, savedCustomerProfile?.loyaltyPoints, totalAmount, discountAmount, settings.loyaltyValuePerPoint]);

  const discountFromPoints = useMemo(() => {
    return pointsToRedeem * (settings.loyaltyValuePerPoint || 1);
  }, [pointsToRedeem, settings.loyaltyValuePerPoint]);

  const finalAmount = Math.max(totalAmount - discountAmount - discountFromPoints + deliveryCharge, 0);
  const hasSavedDob = Boolean(savedCustomerProfile?.dob);
  const hasSavedAnniversary = Boolean(savedCustomerProfile?.anniversaryDate);
  const hasSavedSpecialDate = Boolean(savedCustomerProfile?.specialDate);
  const hasSavedSpecialDateDescription = Boolean(savedCustomerProfile?.specialDateDescription);
  const profileSuggestions = [
    showField('dob') && !hasSavedDob && !dismissedProfileFields.dob && { key: 'dob', label: 'date of birth' },
    showField('anniversaryDate') && !hasSavedAnniversary && !dismissedProfileFields.anniversaryDate && { key: 'anniversaryDate', label: 'anniversary' },
    showField('specialDate') && !hasSavedSpecialDate && !dismissedProfileFields.specialDate && { key: 'specialDate', label: 'special date' },
    showField('specialDateDescription') && !hasSavedSpecialDateDescription && !dismissedProfileFields.specialDateDescription && { key: 'specialDateDescription', label: 'special date details' }
  ].filter(Boolean);

  const getProductImages = (product) => [...new Set([...(product?.images || []), product?.image].filter(Boolean))];
  const getDisplayImage = (product) => getProductImages(product)[0];
  const getDiscount = (price, originalPrice) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };
  const getProductVariants = (product) => {
    const vars = (product?.variants || []).filter(variant => variant.inStock !== false);
    if (vars.length > 0) return vars;
    
    // Fallback: If it's a Cake and has no variants defined in DB
    if (['Cakes', 'Theme Cakes', 'Photo Cakes'].includes(product?.category)) {
      const fallbackBase = product?.price || 0;
      const fallbackOriginal = product?.originalPrice || fallbackBase;
      const unit = (product?.weightUnit && product?.weightUnit.toLowerCase() !== 'g') ? product.weightUnit : 'Kg';
      return [
        { id: 'v-500g', label: `500 g`, price: fallbackBase, originalPrice: fallbackOriginal, weight: 500, weightUnit: 'g' },
        { id: 'v-1kg', label: `1 ${unit}`, price: Math.round(fallbackBase * 1.8), originalPrice: Math.round(fallbackOriginal * 1.8), weight: 1, weightUnit: unit },
        { id: 'v-1.5kg', label: `1.5 ${unit}`, price: Math.round(fallbackBase * 2.7), originalPrice: Math.round(fallbackOriginal * 2.7), weight: 1.5, weightUnit: unit },
        { id: 'v-2kg', label: `2 ${unit}`, price: Math.round(fallbackBase * 3.5), originalPrice: Math.round(fallbackOriginal * 3.5), weight: 2, weightUnit: unit }
      ];
    }
    return [];
  };

  const getServingSize = (label) => {
    if (!label) return '';
    const l = label.toLowerCase();
    if (l.includes('250') || l.includes('0.25')) return 'Serves 1-2 People';
    if (l.includes('500') || l.includes('0.5') || l.includes('half')) return 'Serves 3-5 People';
    if (l.includes('1.5')) return 'Serves 12-15 People';
    if (l.includes('2.5')) return 'Serves 22-25 People';
    if (l.includes('1') || l.includes('one')) return 'Serves 8-10 People';
    if (l.includes('2') || l.includes('two')) return 'Serves 16-20 People';
    if (l.includes('3')) return 'Serves 25-30 People';
    if (l.includes('4')) return 'Serves 30-35 People';
    if (l.includes('5')) return 'Serves 40-50 People';
    return '';
  };

  const getCartKey = (product, variant = null) => `${product._id}-${variant?._id || variant?.label || 'default'}`;
  const getCartItem = (product, variant = null) => cart.find(item => item.cartKey === getCartKey(product, variant));

  // Bestsellers / Most Selling items for home highlight section
  const mostSellingProducts = useMemo(() => {
    const popularCakes = products.filter(p => ['Cakes', 'Bento Cakes', 'Theme Cakes', 'Photo Cakes'].includes(p.category));
    return popularCakes.length >= 4 ? popularCakes.slice(0, 8) : products.slice(0, 8);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = products.filter(product => {
      const query = searchTerm.trim().toLowerCase();
      const searchable = `${product.name} ${product.description || ''} ${product.category || ''} ${(product.flavours || []).join(' ')} ${(product.occasionTags || []).join(' ')}`.toLowerCase();
      const matchesSearch = !query || searchable.includes(query);

      // When actively searching, skip all category/subcategory filters
      if (query) return matchesSearch;

      const pCat = (product.category || '').toLowerCase().trim();
      const pMain = (product.mainCategory || '').toLowerCase().trim();
      const pSub = (product.subCategory || '').toLowerCase().trim();
      const pName = (product.name || '').toLowerCase().trim();
      const pDesc = (product.description || '').toLowerCase().trim();
      const pTags = (product.occasionTags || []).map(t => t.toLowerCase().trim());
      const pFlavs = (product.flavours || []).map(f => f.toLowerCase().trim());

      const isBestsellerFilter = filterCategory.toLowerCase().includes('bestseller');
      
      // 1. Category Matching
      let matchesCategory = filterCategory === 'all';
      if (!matchesCategory) {
        const fLower = filterCategory.toLowerCase().trim();
        if (isBestsellerFilter) {
          matchesCategory = mostSellingProducts.some(mp => mp._id === product._id) || 
            pCat.includes('cake') || pMain.includes('cake') || product.isBestseller || product.isPopular;
        } else if (fLower === 'desserts & hampers' || fLower === 'desserts' || fLower === 'dessert') {
          const dessertCats = ['pastries', 'cupcakes', 'cookies', 'breads', 'celebration hampers', 'desserts', 'dessert', 'tarts', 'mousse', 'donuts'];
          matchesCategory = dessertCats.some(c => pCat.includes(c) || pMain.includes(c) || pSub.includes(c)) || pMain === 'dessert';
        } else if (fLower === 'occasions') {
          matchesCategory = true;
        } else if (fLower === 'cakes' || fLower === 'cake') {
          matchesCategory = pCat.includes('cake') || pMain.includes('cake') || pName.includes('cake');
        } else {
          matchesCategory = 
            pCat === fLower ||
            pMain === fLower ||
            pSub === fLower ||
            (fLower.length > 2 && pCat.includes(fLower)) ||
            (fLower.length > 2 && pMain.includes(fLower)) ||
            (pCat.length > 2 && fLower.includes(pCat));
        }
      }

      const matchesEggless = !egglessFilter || product.eggless === true;
      
      // 2. SubCategory Matching
      let matchesSubCategory = subCategoryFilter === 'all';
      if (!matchesSubCategory) {
        const subLower = subCategoryFilter.toLowerCase().trim();
        
        if (isBestsellerFilter) {
          if (subCategoryFilter === 'Top Selling Cakes') {
            matchesSubCategory = pCat.includes('cake') || pName.includes('cake');
          } else if (subCategoryFilter === 'Most Popular') {
            matchesSubCategory = product.isPopular || product.price > 499;
          } else if (subCategoryFilter === 'Best Value') {
            const discount = getDiscount(product.price, product.originalPrice);
            matchesSubCategory = discount > 0 || product.price < 450;
          } else if (subCategoryFilter === 'Trending') {
            matchesSubCategory = product.isBestseller || product.isPopular || product.price > 599;
          }
        } else {
          // Direct field exact matches
          if (pSub === subLower || pCat === subLower) {
            matchesSubCategory = true;
          } else if (pTags.includes(subLower) || pFlavs.includes(subLower)) {
            matchesSubCategory = true;
          } else if (pName.includes(subLower) || pDesc.includes(subLower)) {
            matchesSubCategory = true;
          } else {
            // Extract meaningful search tokens (filter out noise words)
            const stopWords = new Set(['specials', 'popular', 'party', 'packs', 'box', 'and', 'for', 'of', '&', 'the', 'in', 'cakes', 'cake', 'custom']);
            const tokens = subLower.split(/[\s&,/]+/).filter(w => w.length > 2 && !stopWords.has(w));
            
            // If tokens are empty (e.g. "Cakes Specials", "Popular Cakes"), then it matches parent category
            if (tokens.length === 0) {
              matchesSubCategory = matchesCategory;
            } else {
              // Check if ANY meaningful token matches
              const tokenMatched = tokens.some(tok => 
                pName.includes(tok) ||
                pDesc.includes(tok) ||
                pCat.includes(tok) ||
                pSub.includes(tok) ||
                pTags.some(t => t.includes(tok)) ||
                pFlavs.some(f => f.includes(tok))
              );
              matchesSubCategory = tokenMatched;
            }
          }
        }
      }

      // If a specific subcategory is selected, matching that subcategory satisfies the category requirement
      if (subCategoryFilter !== 'all') {
        return matchesEggless && matchesSubCategory;
      }

      return matchesCategory && matchesEggless;
    });

    if (sortBy === 'low_high') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high_low') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else {
      // Default: bestsellers & popular products first
      list.sort((a, b) => {
        const scoreA = (a.isBestseller ? 4 : 0) + (a.isPopular ? 2 : 0) + (mostSellingProducts.some(mp => mp._id === a._id) ? 3 : 0);
        const scoreB = (b.isBestseller ? 4 : 0) + (b.isPopular ? 2 : 0) + (mostSellingProducts.some(mp => mp._id === b._id) ? 3 : 0);
        return scoreB - scoreA;
      });
    }

    return list;
  }, [filterCategory, products, searchTerm, egglessFilter, subCategoryFilter, sortBy, mostSellingProducts]);

  // Priority order for categories (Cakes & popular items first)
  const POPULAR_CATEGORY_ORDER = useMemo(() => [
    'Cakes',
    'Bento Cakes',
    'Theme Cakes',
    'Photo Cakes',
    'Pastries',
    'Cupcakes',
    'Desserts',
    'Dry Cakes',
    'Celebration Hampers',
    'Cookies',
    'Snacks',
    'Breads'
  ], []);

  // Products grouped by category for home section view
  const productsByCategory = useMemo(() => {
    const grouped = {};
    products.forEach(product => {
      if (!grouped[product.category]) grouped[product.category] = [];
      if (!egglessFilter || product.eggless) grouped[product.category].push(product);
    });
    return grouped;
  }, [products, egglessFilter]);

  // Unique categories sorted by popularity order (Cakes & popular first)
  const categoriesWithProducts = useMemo(() => {
    const available = Object.keys(productsByCategory).filter(cat => productsByCategory[cat].length > 0);
    return available.sort((a, b) => {
      const indexA = POPULAR_CATEGORY_ORDER.indexOf(a);
      const indexB = POPULAR_CATEGORY_ORDER.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [productsByCategory, POPULAR_CATEGORY_ORDER]);

  // Featured homepage categories — dynamically display all categories added via Admin
  const topHomepageCategories = useMemo(() => {
    return categoriesWithProducts;
  }, [categoriesWithProducts]);

  // Remaining categories (kept for fallback)
  const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

  const [recentlyViewedIds, setRecentlyViewedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('bakeryStoreRecentlyViewed');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      const now = Date.now();
      return parsed.filter(item => {
        if (typeof item === 'string') return true;
        return item && item.time && (now - item.time < FIFTEEN_DAYS_MS);
      });
    } catch {
      return [];
    }
  });

  const trackRecentlyViewed = (product) => {
    if (!product?._id) return;
    setRecentlyViewedIds(prev => {
      const now = Date.now();
      const filtered = prev.filter(item => (typeof item === 'string' ? item : item?.id) !== product._id);
      const updated = [{ id: product._id, time: now }, ...filtered].slice(0, 12);
      try {
        localStorage.setItem('bakeryStoreRecentlyViewed', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const recentlyViewedProducts = useMemo(() => {
    const now = Date.now();
    return recentlyViewedIds
      .filter(item => {
        if (typeof item === 'string') return true;
        return item && item.time && (now - item.time < FIFTEEN_DAYS_MS);
      })
      .map(item => {
        const id = typeof item === 'string' ? item : item?.id;
        return products.find(p => p._id === id);
      })
      .filter(Boolean);
  }, [recentlyViewedIds, products]);

  const relatedProducts = useMemo(() => {
    if (!selectedProduct || !products.length) return [];
    
    // Get all other products except current selectedProduct
    const otherProducts = products.filter(p => p._id !== selectedProduct._id);
    if (!otherProducts.length) return [];

    // Group items by category to ensure a diverse mix from ALL categories
    const categoriesMap = {};
    otherProducts.forEach(p => {
      const cat = p.category || 'Other';
      if (!categoriesMap[cat]) categoriesMap[cat] = [];
      categoriesMap[cat].push(p);
    });

    const categories = Object.keys(categoriesMap);
    const mixed = [];

    // Round-robin pick 1 product from each category to ensure a true mix from all categories
    let pass = 0;
    while (mixed.length < 8 && pass < 10) {
      categories.forEach(cat => {
        if (mixed.length >= 8) return;
        const list = categoriesMap[cat];
        if (list && list.length > pass) {
          mixed.push(list[pass]);
        }
      });
      pass++;
    }

    return mixed.slice(0, 4);
  }, [selectedProduct?._id, products]);

  const renderRecentlyViewedSection = () => {
    if (recentlyViewedProducts.length === 0) return null;
    return (
      <div className="my-8 rounded-3xl bg-white p-4 sm:p-6 border border-black/[0.06] shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b border-black/[0.06] pb-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff0f1] text-[#d90429] text-xl font-black shadow-sm">👀</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#d90429] tracking-tight">Recently Viewed</h2>
              <p className="text-xs font-bold text-gray-500">Items you checked out recently</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {recentlyViewedProducts.map((product) => {
            if (!product) return null;
            const discount = getDiscount(product.price || 0, product.originalPrice || 0);
            return (
              <motion.div
                key={`rv-${product._id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => openProduct(product)}
                className="w-[190px] sm:w-[230px] shrink-0 snap-start group flex cursor-pointer flex-col rounded-2xl border border-black/[0.06] bg-[#fffdf9] p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f1e4d8]">
                  {getDisplayImage(product) ? (
                    <img src={getDisplayImage(product)} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[#9d8371]"><CakeSlice className="h-7 w-7" /></div>
                  )}
                  {/* Top Right Container: Wishlist Heart & Discount Tag */}
                  <div className="absolute right-2 top-2 z-20 flex items-center gap-1">
                    {discount > 0 && <span className="rounded-full bg-[#d90429] px-2 py-0.5 text-[9px] font-black text-white shadow">{discount}% OFF</span>}
                    <button
                      onClick={(e) => toggleWishlist(e, product)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-md border border-black/5 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                      title={wishlist.includes(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <Heart className={`h-3.5 w-3.5 transition-colors ${wishlist.includes(product._id) ? 'fill-[#d90429] text-[#d90429]' : 'text-gray-600 hover:text-[#d90429]'}`} />
                    </button>
                  </div>
                </div>
                <div className="mt-2.5 flex flex-1 flex-col justify-between">
                  <h3 className="line-clamp-1 text-xs sm:text-sm font-black text-[#21170f]">{product.name}</h3>
                  <div className="mt-2.5 flex items-center justify-between gap-1.5 pt-1 border-t border-black/[0.04]">
                    <div className="text-left shrink-0">
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-xs sm:text-sm font-black text-[#d90429]">{currency}{product.price}</span>
                        {product.originalPrice > product.price && <span className="text-[10px] text-gray-400 line-through mt-0.5">{currency}{product.originalPrice}</span>}
                      </div>
                    </div>
                    <div>
                      {renderCartControl(product, null, true)}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const syncCartToBackend = async (newCart) => {
    if (savedCustomerProfile?.phone || savedCustomerProfile?.email) {
      try {
        await axios.post(`${API_URL}/store-orders/customer-cart`, {
          phone: savedCustomerProfile.phone,
          email: savedCustomerProfile.email,
          cart: newCart
        });
      } catch (err) {
        console.error('Cart sync to DB failed', err);
      }
    }
  };

  const addToCart = (product, variant = null, message = '', addQuantity = 1, isBuyNow = false, chosenAddons = []) => {
    const isLoggedIn = !!(savedCustomerProfile?.phone || customerToken);
    if (!isLoggedIn) {
      setPendingCartAction({ product, variant, message, addQuantity, isBuyNow, chosenAddons });
      triggerAuthFlow();
      toast('Please enter your Mobile or Email to add items to cart', { icon: '🔑' });
      return;
    }

    const qty = Math.max(1, Number(addQuantity) || 1);
    const selectedVariant = variant || null;
    const addonsKey = (chosenAddons || []).map(a => a._id).sort().join('_');
    const baseCartKey = getCartKey(product, selectedVariant);
    const cartKey = addonsKey ? `${baseCartKey}_addons_${addonsKey}` : baseCartKey;
    const basePrice = selectedVariant?.price ?? product.price;
    const addonsTotal = (chosenAddons || []).reduce((sum, a) => sum + (a.price || 0), 0);
    const itemPrice = basePrice + addonsTotal;
    const itemOriginalPrice = (selectedVariant?.originalPrice ?? product.originalPrice) ? ((selectedVariant?.originalPrice ?? product.originalPrice) + addonsTotal) : undefined;
    const itemWeight = selectedVariant?.weight || product.weight;
    const itemWeightUnit = selectedVariant?.weightUnit || product.weightUnit;
    const itemLabel = selectedVariant?.label || [itemWeight, itemWeightUnit].filter(Boolean).join(' ').trim();

    setCart(prev => {
      const existing = prev.find(item => item.cartKey === cartKey);
      let updated;
      if (existing) {
        updated = prev.map(item => item.cartKey === cartKey ? { ...item, quantity: item.quantity + qty, cakeMessage: message || item.cakeMessage } : item);
      } else {
        updated = [...prev, {
          ...product,
          cartKey,
          productId: product._id,
          variantId: selectedVariant?._id,
          variantLabel: itemLabel,
          price: itemPrice,
          originalPrice: itemOriginalPrice,
          weight: itemWeight,
          weightUnit: itemWeightUnit,
          image: getDisplayImage(product),
          quantity: qty,
          cakeMessage: message,
          chosenAddons: chosenAddons || []
        }];
      }
      syncCartToBackend(updated);
      return updated;
    });
    toast.success(`🛒 ${product.name} added to Cart!`);
    if (isBuyNow) {
      setShowCart(true);
    }
  };

  const handleReorder = (order) => {
    if (!order?.items || order.items.length === 0) return;
    setCart(prev => {
      let nextCart = [...prev];
      order.items.forEach(orderItem => {
        const cartKey = orderItem.variantId 
          ? `${orderItem.productId}-${orderItem.variantId}` 
          : `${orderItem.productId || orderItem._id}`;
        
        const existingIndex = nextCart.findIndex(item => item.cartKey === cartKey);
        if (existingIndex > -1) {
          nextCart[existingIndex] = {
            ...nextCart[existingIndex],
            quantity: nextCart[existingIndex].quantity + orderItem.quantity
          };
        } else {
          const fullProduct = products.find(p => p._id === orderItem.productId) || {
            _id: orderItem.productId,
            name: orderItem.name,
            category: orderItem.category || 'Cakes',
            price: orderItem.price,
            image: orderItem.image || ''
          };

          nextCart.push({
            ...fullProduct,
            cartKey,
            productId: orderItem.productId,
            variantId: orderItem.variantId,
            variantLabel: orderItem.variantLabel || [orderItem.weight, orderItem.weightUnit].filter(Boolean).join(' ').trim(),
            price: orderItem.price,
            originalPrice: orderItem.originalPrice || orderItem.price,
            weight: orderItem.weight,
            weightUnit: orderItem.weightUnit,
            image: orderItem.image || getDisplayImage(fullProduct),
            quantity: orderItem.quantity
          });
        }
      });
      return nextCart;
    });
    toast.success('Pehle order ke saare items Cart mein add ho gaye!');
    setActiveView('store');
    setShowCart(true);
  };

  const handleAddClick = (product) => {
    openProduct(product);
  };

  const openProduct = async (product) => {
    setSelectedProduct(product);
    setActiveView('product');
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
    setActiveImage(getDisplayImage(product) || '');
    const initialVars = getProductVariants(product);
    setSelectedDetailVariant(initialVars[0] || null);
    setCakeMessage('');
    setDetailQuantity(1);
    setDescExpanded(false);
    setSelectedFlavour(null);
    setShowAllAddons(false);
    trackRecentlyViewed(product);
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/products/${product._id}`);
      setSelectedProduct(data);
      setActiveImage(getDisplayImage(data) || '');
      const fetchedVars = getProductVariants(data);
      setSelectedDetailVariant(fetchedVars[0] || null);
      trackRecentlyViewed(data);
    } catch {
      // The card already has enough data to keep the product sheet usable.
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = (cartKey, delta) => {
    setCart(prev => prev
      .map(item => item.cartKey === cartKey ? { ...item, quantity: item.quantity + delta } : item)
      .filter(item => item.quantity > 0));
  };

  const removeFromCart = (cartKey) => {
    setCart(prev => prev.filter(item => item.cartKey !== cartKey));
    toast.success('Cart se remove ho gaya');
  };

  const persistCustomerSession = (profile, token) => {
    if (profile) {
      localStorage.setItem(SAVED_CUSTOMER_KEY, JSON.stringify(profile));
      setSavedCustomerProfile(profile);
    }
    if (token) {
      localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
      setCustomerToken(token);
    }
  };

  const dismissProfileField = (key) => {
    setDismissedProfileFields(prev => {
      const next = { ...prev, [key]: true };
      localStorage.setItem(DISMISSED_FIELDS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const useNewAddress = () => {
    updateForm('address', '');
    toast.success('New address add kar sakte ho');
  };

  const installStoreApp = async () => {
    if (isStandaloneApp) {
      toast.success('App already installed hai');
      return;
    }

    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        toast.success('App home screen par add ho gaya');
        setDeferredInstallPrompt(null);
      }
      return;
    }

    toast('Browser menu se "Add to Home Screen" choose karein. App name/icon settings se use hoga.');
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsLoading(true);
    try {
      const phone = orderForm.phone || '';
      const { data } = await axios.get(`${API_URL}/campaigns/validate-coupon`, {
        params: { code, phone }
      });
      
      if (data.valid) {
        setAppliedCoupon({
          code: data.couponCode,
          discountPercentage: data.discountPercentage,
          discountType: data.discountType,
          discountValue: data.discountValue
        });
        const label = data.discountType === 'fixed' ? `${currency}${data.discountValue}` : `${data.discountValue}%`;
        toast.success(`Coupon applied! ${label} discount added.`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
    } finally {
      setIsLoading(false);
    }
  };

  const applyDirectCoupon = (coupon) => {
    if (coupon.isUsed) return;
    setAppliedCoupon({
      code: coupon.couponCode,
      discountPercentage: coupon.discountType === 'percentage' ? coupon.discountValue : 0,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    });
    setCouponInput(coupon.couponCode);
    const label = coupon.discountType === 'fixed' ? `${currency}${coupon.discountValue}` : `${coupon.discountValue}%`;
    toast.success(`Coupon applied! ${label} discount added.`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    toast.success('Coupon removed');
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!cart.length) return;

    if (paymentMethod === 'upi_qr' && !showUpiModal) {
      setShowUpiModal(true);
      return;
    }

    if (paymentMethod === 'online') {
      setIsLoading(true);
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Razorpay SDK load nahi ho paya. Payment method badlein.');
        setIsLoading(false);
        return;
      }

      try {
        const orderRes = await axios.post(`${API_URL}/store-orders/razorpay-order`, {
          amount: finalAmount,
          currency: 'INR'
        });

        const rzOrder = orderRes.data;
        setIsLoading(false);

        const options = {
          key: settings.razorpayKeyId,
          amount: rzOrder.amount,
          currency: rzOrder.currency,
          name: settings.bakeryName || 'Sweet Bakery',
          description: 'Cake Checkout Payment',
          order_id: rzOrder.id,
          handler: async function (response) {
            await submitFinalOrder({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentMethod: 'online',
              paymentStatus: 'paid',
              amountPaid: finalAmount
            });
          },
          prefill: {
            name: orderForm.customerName,
            contact: orderForm.phone,
            email: orderForm.email
          },
          theme: {
            color: '#5C3A21'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Razorpay initialization failed');
        setIsLoading(false);
      }
      return;
    }

    await submitFinalOrder({
      paymentMethod: paymentMethod === 'upi_qr' ? 'upi' : 'cash',
      paymentStatus: 'unpaid',
      amountPaid: 0
    });
  };

  const submitFinalOrder = async (paymentDetails = {}) => {
    setIsLoading(true);
    try {
      const orderData = {
        ...orderForm,
        items: cart.map(item => ({
          product: item.productId || item._id,
          name: item.variantLabel ? `${item.name} (${item.variantLabel})` : item.name,
          price: item.price,
          quantity: item.quantity,
          weight: item.weight,
          weightUnit: item.weightUnit,
          cakeFlavour: item.cakeFlavour,
          cakeShape: item.cakeShape,
          cakeMessage: item.cakeMessage,
          cakeEggless: item.cakeEggless,
          cakeReferenceImage: item.cakeReferenceImage
        })),
        totalAmount: finalAmount,
        subtotal: totalAmount,
        deliveryCharge,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        discountAmount: discountAmount,
        pointsRedeemed: redeemingPoints ? pointsToRedeem : 0,
        discountFromPoints: redeemingPoints ? discountFromPoints : 0,
        ...paymentDetails
      };

      const response = await axios.post(`${API_URL}/store-orders`, orderData);
      const { order, token } = response.data;

      const profileToSave = {
        customerName: orderForm.customerName,
        phone: orderForm.phone,
        email: orderForm.email,
        address: orderForm.address,
        dob: orderForm.dob,
        anniversaryDate: orderForm.anniversaryDate,
        specialDate: orderForm.specialDate,
        specialDateDescription: orderForm.specialDateDescription
      };
      persistCustomerSession(profileToSave, token);

      toast.success('Order placed successfully!');
      
      setTrackingOrder(order);
      setActiveView('tracking');

      setCart([]);
      setShowCheckout(false);
      setShowCart(false);
      setAppliedCoupon(null);
      setCouponInput('');
      setRedeemingPoints(false);
      setPaymentMethod('cod');
      setShowUpiModal(false);
      setOrderForm({
        customerName: '',
        phone: '',
        email: '',
        address: '',
        deliveryDate: '',
        dob: '',
        anniversaryDate: '',
        specialDate: '',
        specialDateDescription: '',
        notes: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReferenceImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomCakeForm(prev => ({ ...prev, referenceImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const updateForm = (key, value) => {
    setOrderForm(prev => ({ ...prev, [key]: value }));
  };

  const applyCustomerProfile = (profile, notify = true) => {
    if (!profile) return;
    setSavedCustomerProfile(profile);
    setOrderForm(prev => ({
      ...prev,
      customerName: prev.customerName || profile.customerName || '',
      phone: prev.phone || profile.phone || '',
      email: prev.email || profile.email || '',
      address: prev.address || profile.address || '',
      dob: prev.dob || toDateInput(profile.dob),
      anniversaryDate: prev.anniversaryDate || toDateInput(profile.anniversaryDate),
      specialDate: prev.specialDate || toDateInput(profile.specialDate),
      specialDateDescription: prev.specialDateDescription || profile.specialDateDescription || ''
    }));
    if (notify) toast.success('Saved delivery details loaded');
  };

  const fetchCustomerProfile = async () => {
    const phone = orderForm.phone.trim();
    const email = orderForm.email.trim();
    if (phone.replace(/\D/g, '').length < 10 && !email) return;

    try {
      const { data } = await axios.get(`${API_URL}/store-orders/customer-profile`, {
        params: { phone, email }
      });
      if (data.data) {
        localStorage.setItem(SAVED_CUSTOMER_KEY, JSON.stringify(data.data));
        applyCustomerProfile(data.data);
      }
    } catch {
      // Autofill should never block checkout.
    }
  };

  const openQuickLink = (link) => {
    if (link.type === 'install') {
      installStoreApp();
      return;
    }

    const value = link.url 
      || (link.type === 'phone' ? settings.phone : '') 
      || (link.type === 'email' ? settings.email : '') 
      || (link.type === 'whatsapp' ? (settings.whatsappNumber || settings.phone) : '') 
      || '';
    let href = value;

    if (link.type === 'phone') href = `tel:${value}`;
    if (link.type === 'email') href = `mailto:${value}`;
    if (link.type === 'whatsapp') href = value.startsWith('http') ? value : `https://wa.me/${value.replace(/\D/g, '')}`;
    if (!['phone', 'email'].includes(link.type) && href && !href.startsWith('http')) href = `https://${href}`;

    if (href) window.open(href, '_blank', 'noopener,noreferrer');
  };

  const getWhatsAppHref = () => {
    const rawNum = settings.whatsappNumber || settings.phone || '';
    if (!rawNum) return null;
    return `https://wa.me/${rawNum.replace(/\D/g, '')}?text=${encodeURIComponent("Hello! I want to ask about ordering a custom cake.")}`;
  };

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const focusSearch = () => {
    setFilterCategory('all');
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    window.setTimeout(() => {
      const searchInput = document.getElementById('store-search');
      if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 350);
  };

  const categoryGroups = [
    {
      name: 'Bestsellers 🔥',
      emoji: '🔥',
      items: ['Top Selling Cakes', 'Most Popular', 'Best Value', 'Trending']
    },
    {
      name: 'Cakes',
      emoji: '🎂',
      items: ['All Cakes', 'Bento Cakes', 'Theme Cakes', 'Photo Cakes', 'Dry Cakes']
    },
    {
      name: 'Bento Cakes',
      emoji: '🍱',
      items: ['Love Bento', 'Birthday Bento', 'Meme Bento', 'Cute Bento']
    },
    {
      name: 'Theme Cakes',
      emoji: '✨',
      items: ['Kids Theme', '3D Designer', 'Anniversary Theme']
    },
    {
      name: 'Desserts & Hampers',
      emoji: '🧁',
      items: ['Pastries', 'Cupcakes', 'Cookies', 'Breads', 'Celebration Hampers']
    },
    {
      name: 'Occasions',
      emoji: '🎉',
      items: ['Birthday', 'Anniversary', 'Love & Romance', 'Parties']
    }
  ];

  const quickLinks = (settings.quickLinks || []).filter(link => link.isActive !== false);
  const bestSellers = products.slice(0, 3);
  const categoryList = categories.length > 1 ? categories : ['all', 'Cakes', 'Bento Cakes', 'Theme Cakes', 'Photo Cakes', 'Pastries', 'Breads', 'Cookies', 'Desserts', 'Snacks', 'Dry Cakes', 'Celebration Hampers'];

  const quickIcon = (type) => {
    const icons = {
      whatsapp: MessageCircle,
      instagram: Instagram,
      facebook: Facebook,
      website: Globe2,
      phone: Phone,
      email: Mail,
      reviews: Star,
      install: Download,
      custom: ExternalLink
    };
    return icons[type] || ExternalLink;
  };

  const renderCartControl = (product, variant = null, compact = false) => {
    const item = getCartItem(product, variant);
    if (item) {
      return (
        <div className={`flex h-9 ${compact ? 'w-24 sm:w-28' : 'w-full'} items-center justify-between overflow-hidden rounded-xl border-2 border-[#d90429] bg-[#fff0f1] font-black text-[#d90429] shadow-sm`}>
          <button
            onClick={(e) => { e.stopPropagation(); updateQuantity(item.cartKey, -1); }}
            className="flex h-full w-7 sm:w-8 items-center justify-center bg-white/70 hover:bg-[#d90429] hover:text-white transition-colors cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3 stroke-[3]" />
          </button>
          <span className="text-xs sm:text-sm font-black tracking-tight">{item.quantity}</span>
          <button
            onClick={(e) => { e.stopPropagation(); updateQuantity(item.cartKey, 1); }}
            className="flex h-full w-7 sm:w-8 items-center justify-center bg-white/70 hover:bg-[#d90429] hover:text-white transition-colors cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3 stroke-[3]" />
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={(e) => { e.stopPropagation(); handleAddClick(product); }}
        className={`group relative flex h-9 ${compact ? 'px-3 sm:px-4 shrink-0' : 'w-full px-4'} items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[#d90429] via-[#ef233c] to-[#d90429] text-[11px] sm:text-xs font-black uppercase tracking-wider text-white shadow-md shadow-[#d90429]/20 hover:shadow-lg hover:shadow-[#d90429]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden border border-white/20`}
      >
        <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90 duration-300 stroke-[3]" />
        <span>ADD</span>
        <ShoppingBag className="h-3 w-3 opacity-80 transition-transform group-hover:translate-x-0.5" />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f2ec] text-[#1f1b16]" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      {/* ── HEADER ── */}
      <div className="sticky top-0 z-50 shadow-sm">
        <header className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-[1440px]">

            {/* ── MOBILE HEADER: Hamburger | Logo+Name | Search Icon ── */}
            <div className="md:hidden flex items-center justify-between px-4 h-14">
              {/* Left: Hamburger */}
              <button
                type="button"
                onClick={() => setShowMobileCategoriesModal(true)}
                className="flex items-center justify-center h-9 w-9 rounded-lg text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                aria-label="Open categories"
              >
                <Menu className="h-6 w-6 stroke-[2]" />
              </button>

              {/* Center: Logo + Brand Name */}
              <button
                onClick={() => { setActiveView('store'); setFilterCategory('all'); setSubCategoryFilter('all'); setSearchTerm(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center gap-2 cursor-pointer"
                aria-label="Go to home"
              >
                {settings.logo ? (
                  <img src={getImageUrl(settings.logo)} alt={settings.bakeryName || 'Oneness Bakery'} className="h-9 sm:h-11 w-auto max-w-[170px] object-contain transition-all" />
                ) : (
                  <img src="/oneness_logo_2.png" alt="Oneness Bakery" className="h-9 sm:h-11 w-auto max-w-[170px] object-contain transition-all" />
                )}
              </button>

              {/* Right: Search Icon */}
              <button
                type="button"
                onClick={() => setShowSearchModal(true)}
                className="flex items-center justify-center h-9 w-9 rounded-lg text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                aria-label="Search"
              >
                <Search className="h-5.5 w-5.5 stroke-[2]" />
              </button>
            </div>

            {/* ── DESKTOP HEADER ── */}
            <div className="hidden md:flex items-center justify-between gap-4 px-8 py-3">
              {/* Logo & Brand */}
              <button
                onClick={() => { setActiveView('store'); setFilterCategory('all'); setSubCategoryFilter('all'); setSearchTerm(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center gap-2.5 text-left cursor-pointer shrink-0"
                aria-label="Go to home"
              >
                {settings.logo ? (
                  <img src={getImageUrl(settings.logo)} alt={settings.bakeryName || 'Oneness Bakery'} className="h-12 sm:h-14 md:h-16 w-auto max-w-[240px] object-contain transition-all hover:scale-105" />
                ) : (
                  <img src="/oneness_logo_2.png" alt="Oneness Bakery" className="h-12 sm:h-14 md:h-16 w-auto max-w-[240px] object-contain transition-all hover:scale-105" />
                )}
              </button>

              {/* Desktop: Search Bar */}
              <div className="relative flex-1 max-w-lg mx-6">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="store-search-input"
                  type="text"
                  placeholder="Search For Cakes, Occasion, Flavour And More..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm font-medium text-[#1f1b16] outline-none placeholder:text-gray-400 focus:border-[#d90429] focus:bg-white focus:ring-2 focus:ring-[#d90429]/10 transition-all"
                />
              </div>

              {/* Desktop Right Actions */}
              <div className="flex items-center gap-5 shrink-0">
                {/* My Orders */}
                <button
                  onClick={() => { if (savedCustomerProfile?.phone) { setActiveView('profile'); setActiveProfileTab('orders'); fetchCustomerOrders(); } else { triggerAuthFlow(); } }}
                  className="flex flex-col items-center justify-center gap-0.5 text-gray-600 hover:text-[#d90429] transition-all cursor-pointer group"
                  title="My Orders"
                >
                  <Package className="h-5.5 w-5.5 stroke-[2] group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold tracking-tight uppercase whitespace-nowrap">Orders</span>
                </button>

                {/* Cart */}
                <button
                  onClick={() => setShowCart(true)}
                  className="relative flex flex-col items-center justify-center gap-0.5 text-gray-600 hover:text-[#d90429] transition-all cursor-pointer group"
                  title="Cart"
                >
                  <div className="relative">
                    <ShoppingBag className="h-5.5 w-5.5 stroke-[2] group-hover:scale-110 transition-transform" />
                    {totalQuantity > 0 && (
                      <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#d90429] px-1 text-[9px] font-black text-white shadow">
                        {totalQuantity}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold tracking-tight uppercase">Cart</span>
                </button>

                {/* Account */}
                <button
                  onClick={() => { if (savedCustomerProfile?.phone) { setActiveView('profile'); setActiveProfileTab('orders'); fetchCustomerOrders(); } else { triggerAuthFlow(); } }}
                  className="flex flex-col items-center justify-center gap-0.5 text-gray-600 hover:text-[#d90429] transition-all cursor-pointer group"
                  title="Account"
                >
                  <User className="h-5.5 w-5.5 stroke-[2] group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold tracking-tight uppercase truncate max-w-[50px]">
                    {savedCustomerProfile?.name?.split(' ')[0] || 'Login'}
                  </span>
                </button>
              </div>
            </div>

          </div>
        </header>
      </div>


      {/* Creme Castle Inspired Top Category Navigation Header (Desktop) */}
      <div className="bg-[#5C3A21] text-white shadow-md relative z-30 hidden md:block border-t border-amber-950/30 overflow-visible">
        <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between overflow-visible">
          <div className="flex items-center space-x-1 py-1.5 overflow-visible flex-wrap gap-y-1">
            <button
              onClick={() => {
                setFilterCategory('all');
                setSubCategoryFilter('all');
                setSubSubCategoryFilter('all');
                setActiveNavPopover(null);
              }}
              className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                filterCategory === 'all' ? 'bg-[#d90429] text-white shadow-md' : 'text-amber-100 hover:bg-amber-800/60'
              }`}
            >
              All Categories
            </button>

            {displayCategoryTree.map(main => {
              const hasSub = main.subcategories && main.subcategories.length > 0;
              const isPopoverOpen = activeNavPopover === main._id;

              return (
                <div
                  key={main._id}
                  className="relative group"
                  onMouseEnter={() => setActiveNavPopover(main._id)}
                  onMouseLeave={() => setActiveNavPopover(null)}
                >
                  <button
                    onClick={() => {
                      setFilterCategory(main.name);
                      setSubCategoryFilter('all');
                      setSubSubCategoryFilter('all');
                      if (hasSub) {
                        setActiveNavPopover(isPopoverOpen ? null : main._id);
                      } else {
                        setActiveNavPopover(null);
                      }
                    }}
                    className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer ${
                      filterCategory === main.name || isPopoverOpen ? 'bg-[#d90429] text-white shadow-md' : 'text-amber-100 hover:bg-amber-800/60'
                    }`}
                  >
                    <span>{main.name}</span>
                    {main.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] bg-amber-400 text-amber-950 font-extrabold rounded-full">
                        {main.badge}
                      </span>
                    )}
                    {hasSub && (
                      <ChevronDown className={`w-3.5 h-3.5 opacity-75 transition-transform ${isPopoverOpen ? 'rotate-180 text-amber-300' : 'group-hover:rotate-180'}`} />
                    )}
                  </button>

                  {/* Creme Castle Vertical Submenu Floating Popover Card */}
                  {hasSub && (
                    <div className={`absolute left-0 top-full mt-0.5 w-64 bg-white text-gray-900 shadow-2xl rounded-2xl border border-amber-200 py-3 px-2 z-[999] transition-all animate-in fade-in slide-in-from-top-1 duration-150 ${
                      isPopoverOpen ? 'block' : 'hidden group-hover:block'
                    }`}>
                      <div className="px-3 pb-2 border-b border-gray-100 mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                          {main.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveNavPopover(null);
                          }}
                          className="text-xs font-bold text-gray-400 hover:text-red-600 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="space-y-0.5 max-h-[320px] overflow-y-auto">
                        {main.subcategories.map(sub => (
                          <button
                            key={sub._id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilterCategory(main.name);
                              setSubCategoryFilter(sub.name);
                              setSubSubCategoryFilter('all');
                              setActiveNavPopover(null);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-gray-800 hover:bg-amber-50 hover:text-[#d90429] rounded-xl transition-colors cursor-pointer"
                          >
                            <span>{sub.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Circular Image Category Row from Admin Categories */}
      {displayCategoryTree.length > 0 && (
        <div className="py-4 px-4 sm:px-6 bg-[#fffcf7] border-b border-amber-900/10 shadow-xs">
          <div className="max-w-[1440px] mx-auto flex items-center justify-start sm:justify-center gap-4 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-hide py-1">
            {displayCategoryTree.map(cat => {
              const isActive = filterCategory.toLowerCase() === cat.name.toLowerCase();
              const catProduct = products.find(p => (p.category || p.mainCategory || '').toLowerCase() === cat.name.toLowerCase());
              const catImg = cat.image || (catProduct?.images && catProduct.images[0]) || catProduct?.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&q=80';

              return (
                <div
                  key={cat._id}
                  onClick={() => {
                    setFilterCategory(cat.name);
                    setSubCategoryFilter('all');
                    setSubSubCategoryFilter('all');
                  }}
                  className="flex flex-col items-center group cursor-pointer shrink-0 space-y-1.5 select-none"
                >
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden p-0.5 transition-all duration-300 ${
                    isActive ? 'ring-4 ring-[#d90429] scale-105 shadow-md' : 'ring-2 ring-amber-200 group-hover:ring-amber-400 group-hover:scale-105 shadow-xs'
                  }`}>
                    <img
                      src={getImageUrl(catImg)}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className={`text-[11px] sm:text-xs font-black text-center max-w-[95px] truncate transition-colors ${
                    isActive ? 'text-[#d90429]' : 'text-gray-800 group-hover:text-amber-800'
                  }`}>
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1440px] pb-4 md:pb-6">
        {activeView === 'store' ? (
          <>
            {filterCategory === 'all' && !searchTerm && (
              <section className="px-4 pt-5 sm:px-6">
                <div className="relative h-[180px] sm:h-[280px] md:h-[360px] overflow-hidden rounded-[28px] bg-[#25180f] shadow-2xl shadow-[#3d2b1f]/15">
                  {activeBanners.map((banner, index) => {
                    const isActive = index === activeBanner;
                    return (
                      <div key={banner._id || index} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                        <img src={getImageUrl(banner.image)} alt={`Bakery Banner ${index + 1}`} className="h-full w-full object-cover object-center bg-amber-50" />
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section id="products" className="px-4 pt-4 sm:px-6">
              {/* Active Category Header & Subcategory Pills Bar */}
              {(filterCategory !== 'all' || subCategoryFilter !== 'all') && (
                <div className="mb-4">
                  <div className="flex items-center justify-between gap-2 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-black text-gray-900">
                        {subCategoryFilter !== 'all' ? subCategoryFilter : filterCategory}
                      </h2>
                      <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-bold text-[#d90429]">
                        {filteredProducts.length} items
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setFilterCategory('all');
                        setSubCategoryFilter('all');
                        setSubSubCategoryFilter('all');
                      }}
                      className="text-xs font-bold text-gray-500 hover:text-[#d90429] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" /> Clear Filter
                    </button>
                  </div>

                  {/* Subcategory Pills (if active category has subcategories) */}
                  {(() => {
                    const activeCatObj = displayCategoryTree.find(
                      c => c.name.toLowerCase() === filterCategory.toLowerCase()
                    );
                    const subList = activeCatObj?.subcategories || [];
                    if (subList.length === 0) return null;

                    return (
                      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
                        <button
                          type="button"
                          onClick={() => setSubCategoryFilter('all')}
                          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
                            subCategoryFilter === 'all'
                              ? 'bg-[#d90429] border-[#d90429] text-white shadow-sm'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          All {filterCategory}
                        </button>
                        {subList.map(sub => {
                          const isSubActive = subCategoryFilter.toLowerCase() === sub.name.toLowerCase();
                          return (
                            <button
                              key={sub._id || sub.name}
                              type="button"
                              onClick={() => setSubCategoryFilter(sub.name)}
                              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
                                isSubActive
                                  ? 'bg-[#d90429] border-[#d90429] text-white shadow-sm'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-[#d90429] hover:text-[#d90429]'
                              }`}
                            >
                              {sub.name}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {filteredProducts.length > 0 ? (
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
                  {filteredProducts.map((product, pIdx) => {
                    const discount = getDiscount(product.price, product.originalPrice);
                    const cardBadge = getProductCardBadge(product, pIdx);
                    return (
                      <div
                        key={product._id}
                        onClick={() => openProduct(product)}
                        className="group flex cursor-pointer flex-col rounded-3xl border border-black/[0.04] bg-[#fffdf9] p-2.5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-black/10 hover:shadow-md"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f1e4d8] shadow-inner">
                          {getDisplayImage(product) ? (
                            <img
                              src={getDisplayImage(product)}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#9d8371]">
                              <CakeSlice className="h-8 w-8" />
                            </div>
                          )}

                          {/* Top Right Actions: Offer Tag & Wishlist Heart */}
                          <div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1.5">
                            {discount > 0 && (
                              <span className="rounded-full bg-[#e63946] px-2 py-0.5 text-[10px] font-black text-white shadow-md uppercase tracking-wider">
                                {discount}% OFF
                              </span>
                            )}
                            <button
                              onClick={(e) => toggleWishlist(e, product)}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-md border border-black/5 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                              title={wishlist.includes(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                            >
                              <Heart className={`h-4 w-4 transition-colors ${wishlist.includes(product._id) ? 'fill-[#e63946] text-[#e63946]' : 'text-gray-600 hover:text-[#e63946]'}`} />
                            </button>
                          </div>

                          {/* Bestseller / Top Rated / Popular Badge: Bottom Left */}
                          {cardBadge && (
                            <span className="absolute left-2.5 bottom-2.5 rounded-full bg-[#140b06]/85 backdrop-blur-sm border border-white/20 px-2.5 py-0.5 text-[9px] font-black text-[#ffb703] shadow-md z-10 uppercase tracking-wider flex items-center gap-1">
                              <span>{cardBadge}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col p-2 justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#92602f]">{product.category}</span>
                            <h3 className="mt-0.5 line-clamp-1 text-xs sm:text-sm font-black text-[#21170f]">{product.name}</h3>
                          </div>
                          
                          <div className="mt-3 flex items-center justify-between gap-2 pt-1 border-t border-black/[0.04]">
                            {/* Left Side: Price */}
                            <div className="text-left shrink-0">
                              <div className="flex flex-col items-start leading-none">
                                <span className="text-sm sm:text-base font-black text-[#d90429]">{currency}{product.price}</span>
                                {product.originalPrice > product.price && (
                                  <span className="text-[10px] text-gray-400 line-through mt-0.5">{currency}{product.originalPrice}</span>
                                )}
                              </div>
                            </div>

                            {/* Right Side: ADD / Quantity Button */}
                            <div>
                              {renderCartControl(product, null, true)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <CakeSlice className="mx-auto mb-4 h-16 w-16 text-[#d6bdab]" />
                  <p className="font-black text-[#21170f]">No items found</p>
                  <p className="text-sm text-[#6f6258]">Try another search or category.</p>
                </div>
              )}
            </section>
            <div className="px-4 sm:px-6">
              {renderRecentlyViewedSection()}
            </div>
          </>
        ) : activeView === 'product' && selectedProduct ? (
          <section className="mx-auto max-w-3xl px-0 sm:px-4 pt-0 sm:pt-6 pb-20 animate-fadeIn">

            {/* ── Full-width Product Image (with thumbnails) ── */}
            <div className="relative">
              {/* Main image */}
              <div className="relative w-full aspect-[4/3] sm:aspect-square sm:rounded-2xl overflow-hidden bg-[#f8f3ed]">
                {activeImage ? (
                  <img src={activeImage} alt={selectedProduct.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#9d8371]">
                    <CakeSlice className="h-20 w-20" />
                  </div>
                )}

                {/* Nav arrows */}
                {getProductImages(selectedProduct).length > 1 && (
                  <>
                    <button type="button" onClick={(e) => { e.stopPropagation(); const imgs = getProductImages(selectedProduct); const i = imgs.indexOf(activeImage); setActiveImage(imgs[(i - 1 + imgs.length) % imgs.length]); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 cursor-pointer">
                      <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); const imgs = getProductImages(selectedProduct); const i = imgs.indexOf(activeImage); setActiveImage(imgs[(i + 1) % imgs.length]); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 cursor-pointer">
                      <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/25 backdrop-blur-sm px-3 py-1 rounded-full">
                      {getProductImages(selectedProduct).map((img, i) => (
                        <button key={i} type="button" onClick={() => setActiveImage(img)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${activeImage === img ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Horizontal thumbnails below image */}
              {getProductImages(selectedProduct).length > 1 && (
                <div className="flex gap-2 overflow-x-auto px-4 sm:px-0 pt-3 pb-1 scrollbar-hide">
                  {getProductImages(selectedProduct).map((image, index) => (
                    <button key={index} type="button" onClick={() => setActiveImage(image)}
                      className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${activeImage === image ? 'border-[#d90429] shadow-sm' : 'border-gray-200 opacity-60 hover:opacity-100'}`}>
                      <img src={image} alt={index + 1} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Product Info Section ── */}
            <div className="px-4 sm:px-0 mt-4 space-y-4">

              {/* Name & Price */}
              <div>
                <h1 className="text-xl font-black text-[#21170f] leading-snug">{selectedProduct.name}</h1>
                {(() => {
                  const hasVariants = getProductVariants(selectedProduct).length > 0;
                  const activeVar = selectedDetailVariant || getProductVariants(selectedProduct)[0];
                  const displayPrice = hasVariants && activeVar ? activeVar.price : selectedProduct.price;
                  const displayOrig = hasVariants && activeVar ? activeVar.originalPrice : selectedProduct.originalPrice;
                  const discountPct = getDiscount(displayPrice, displayOrig);
                  return (
                    <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
                      <span className="text-2xl font-black text-[#21170f]">{currency}{displayPrice}</span>
                      {displayOrig > displayPrice && (
                        <span className="text-sm font-bold text-gray-400 line-through">{currency}{displayOrig}</span>
                      )}
                      {discountPct > 0 && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-600 uppercase">{discountPct}% OFF</span>
                      )}
                    </div>
                  );
                })()}
                <p className="text-xs text-gray-400 font-medium mt-0.5">Tax included.</p>
              </div>

              {/* Feature badges */}
              <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50/60 px-4 py-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#d90429]">
                  <span className="text-sm">🚚</span> Free delivery
                </div>
                <span className="text-gray-200">|</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#d90429]">
                  <span className="text-sm">🛡</span> 100% safe
                </div>
                <span className="text-gray-200">|</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#d90429]">
                  <span className="text-sm">🌾</span> Fresh baked
                </div>
              </div>

              {/* Description with Read More */}
              {(() => {
                const desc = selectedProduct.description || 'Freshly baked with the finest ingredients. Perfect for every celebration!';
                const isLong = desc.length > 100;
                return (
                  <div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {isLong && !descExpanded ? `${desc.slice(0, 100)}...` : desc}
                    </p>
                    {isLong && (
                      <button onClick={() => setDescExpanded(e => !e)} className="text-sm font-bold text-[#d90429] mt-0.5 cursor-pointer">
                        {descExpanded ? 'Read Less' : 'Read More'}
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* ── Size / Variant Selection ── */}
              {getProductVariants(selectedProduct).length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d90429] text-white text-[10px] font-black shrink-0">1</span>
                    <span className="text-sm font-black text-[#21170f]">Select Size / Weight</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getProductVariants(selectedProduct).map((variant, idx) => {
                      const isSelected = (selectedDetailVariant?.label || selectedDetailVariant?.id) === (variant.label || variant.id) || (!selectedDetailVariant && idx === 0);
                      return (
                        <button
                          key={variant.id || variant.label || idx}
                          type="button"
                          onClick={() => setSelectedDetailVariant(variant)}
                          className={`rounded-full px-4 py-2 text-sm font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-[#d90429] border-[#d90429] text-white shadow-sm'
                              : 'bg-white border-gray-300 text-gray-700 hover:border-[#d90429] hover:text-[#d90429]'
                          }`}
                        >
                          {variant.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cake Message input */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-500">Message on Cake (Optional)</label>
                <input
                  type="text"
                  maxLength={50}
                  placeholder="e.g. Happy Birthday Aman! 🎉"
                  value={cakeMessage}
                  onChange={e => setCakeMessage(e.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-[#21170f] outline-none focus:border-[#d90429] focus:ring-2 focus:ring-[#d90429]/10 transition-all"
                />
              </div>

              {/* ── FINISHING TOUCHES: Add-ons Section (Creme Castle style) ── */}
              {availableAddons.length > 0 && (
                <div className="mt-2">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#d90429] mb-1">Finishing Touches</p>
                  <h3 className="text-lg font-black text-[#21170f] leading-snug">Add more fun to celebration</h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5 mb-4">Candles, toppers and decor – packed in the same box, no extra delivery</p>

                  <div className="space-y-2">
                    {(showAllAddons ? availableAddons : availableAddons.slice(0, 6)).map(addon => {
                      const count = selectedAddons[addon._id] || 0;
                      const isSelected = count > 0;
                      return (
                        <div key={addon._id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-3 py-3 shadow-sm hover:border-amber-200 transition-all">
                          {/* Thumbnail */}
                          {addon.image ? (
                            <img src={addon.image} alt={addon.name} className="h-12 w-12 rounded-xl object-cover shrink-0 border border-gray-100" />
                          ) : (
                            <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-xl shrink-0">🎁</div>
                          )}

                          {/* Name & Price */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#21170f] truncate">{addon.name}</p>
                            <p className="text-xs font-black text-[#d90429] mt-0.5">{currency}{addon.price} <span className="text-gray-400 font-semibold">each</span></p>
                          </div>

                          {/* Add / Qty control */}
                          {isSelected ? (
                            <div className="flex items-center gap-1.5 rounded-full border border-[#d90429] px-1.5 py-1 shrink-0" onClick={e => e.stopPropagation()}>
                              <button type="button" onClick={() => setSelectedAddons(prev => {
                                const curr = prev[addon._id] || 0;
                                if (curr <= 1) { const c = {...prev}; delete c[addon._id]; return c; }
                                return {...prev, [addon._id]: curr - 1};
                              })} className="h-6 w-6 rounded-full bg-[#d90429] text-white font-black text-sm flex items-center justify-center cursor-pointer">-</button>
                              <span className="text-sm font-black text-[#d90429] w-4 text-center">{count}</span>
                              <button type="button" onClick={() => setSelectedAddons(prev => ({...prev, [addon._id]: (prev[addon._id] || 0) + 1}))}
                                className="h-6 w-6 rounded-full bg-[#d90429] text-white font-black text-sm flex items-center justify-center cursor-pointer">+</button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedAddons(prev => ({...prev, [addon._id]: 1}))}
                              className="shrink-0 rounded-full border border-[#d90429] px-4 py-1.5 text-xs font-black text-[#d90429] hover:bg-[#d90429] hover:text-white transition-all cursor-pointer"
                            >
                              {addon.category?.toLowerCase().includes('number') || addon.name?.toLowerCase().includes('number') ? 'Choose' : 'Add'}
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {availableAddons.length > 6 && (
                      <button
                        type="button"
                        onClick={() => setShowAllAddons(!showAllAddons)}
                        className="w-full rounded-2xl border border-amber-300/80 bg-amber-50/50 py-3 text-sm font-bold text-[#d90429] hover:bg-amber-100/60 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>{showAllAddons ? 'Show less add-ons ↑' : `See all add-ons (${availableAddons.length}) ↓`}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── ADD TO CART / BUY NOW BAR ── */}
              {(() => {
                const hasVariants = getProductVariants(selectedProduct).length > 0;
                const activeVar = selectedDetailVariant || getProductVariants(selectedProduct)[0];
                const displayPrice = hasVariants && activeVar ? activeVar.price : selectedProduct.price;
                const addonsTotal = Object.entries(selectedAddons).reduce((sum, [id, qty]) => {
                  if (!qty) return sum;
                  const addon = availableAddons.find(a => a._id === id);
                  return sum + (addon ? addon.price * qty : 0);
                }, 0);
                const totalPrice = (displayPrice * detailQuantity) + addonsTotal;
                const isWishlisted = wishlist.includes(selectedProduct._id);
                const chosenAddonsList = Object.entries(selectedAddons).filter(([_, q]) => q > 0).map(([id]) => availableAddons.find(a => a._id === id)).filter(Boolean);

                return (
                  <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-100 pt-3 pb-safe space-y-2.5 -mx-4 sm:mx-0 px-4 sm:px-0 sm:static sm:border-0 sm:pt-0">
                    {/* Qty + Add to Cart */}
                    <div className="flex items-center gap-2.5">
                      {/* Quantity */}
                      <div className="flex items-center rounded-xl border border-gray-200 bg-white shadow-sm shrink-0">
                        <button type="button" onClick={() => setDetailQuantity(q => Math.max(1, q - 1))}
                          className="flex h-11 w-10 items-center justify-center font-black text-lg text-gray-600 hover:bg-gray-50 rounded-l-xl cursor-pointer">−</button>
                        <span className="w-8 text-center font-black text-sm text-[#21170f]">{detailQuantity}</span>
                        <button type="button" onClick={() => setDetailQuantity(q => q + 1)}
                          className="flex h-11 w-10 items-center justify-center font-black text-lg text-gray-600 hover:bg-gray-50 rounded-r-xl cursor-pointer">+</button>
                      </div>

                      {/* Add to Cart */}
                      <button type="button" onClick={() => addToCart(selectedProduct, activeVar, cakeMessage, detailQuantity, false, chosenAddonsList)}
                        className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-[#d90429] font-black text-sm text-white shadow-md hover:bg-[#c50323] active:scale-[0.98] transition-all cursor-pointer">
                        <ShoppingBag className="h-4 w-4 shrink-0" />
                        Add to Cart · {currency}{totalPrice}
                      </button>

                      {/* Wishlist */}
                      <button type="button" onClick={e => toggleWishlist(e, selectedProduct)}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 transition cursor-pointer ${isWishlisted ? 'border-red-200 bg-red-50 text-[#d90429]' : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50'}`}>
                        <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-[#d90429]' : ''}`} />
                      </button>
                    </div>

                    {/* Buy Now */}
                    <button type="button" onClick={() => addToCart(selectedProduct, activeVar, cakeMessage, detailQuantity, true, chosenAddonsList)}
                      className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border-2 border-[#21170f] bg-white font-black text-sm text-[#21170f] hover:bg-[#21170f] hover:text-white active:scale-[0.98] transition-all cursor-pointer">
                      <Zap className="h-4 w-4 text-yellow-500 fill-yellow-400" />
                      Buy Now
                    </button>
                  </div>
                );
              })()}

            </div>

            {/* Bottom Related Products Section ("You May Also Like") */}
            <div className="border-t border-black/5 pt-8 space-y-4">
              <div>
                <h3 className="text-2xl font-black text-[#21170f]">You May Also Like 🍰</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedProducts.map(product => {
                  const discount = getDiscount(product.price, product.originalPrice);
                  return (
                    <div
                      key={`pdp-rel-${product._id}`}
                      onClick={() => {
                        openProduct(product);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="group relative cursor-pointer rounded-2xl border border-black/[0.05] bg-white p-3 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 flex flex-col justify-between"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f1e4d8]">
                        {getDisplayImage(product) ? (
                          <img src={getDisplayImage(product)} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#9d8371]"><CakeSlice className="h-8 w-8" /></div>
                        )}
                        {discount > 0 && (
                          <span className="absolute bottom-2 left-2 rounded-full bg-[#d90429] px-2 py-0.5 text-[9px] font-black text-white shadow">
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-left">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{product.category}</p>
                        <h4 className="line-clamp-1 text-sm font-black text-[#21170f] mt-0.5">{product.name}</h4>
                        <div className="mt-1 flex items-baseline gap-1.5 text-xs font-black">
                          <span className="text-[#d90429]">{currency}{product.price}</span>
                          {product.originalPrice > product.price && (
                            <span className="text-[10px] text-gray-400 line-through">{currency}{product.originalPrice}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </section>
        ) : activeView === 'tracking' ? (
          <section className="mx-auto max-w-2xl px-4 pt-6 sm:px-6 pb-12">
            {/* Back button */}
            <button
              type="button"
              onClick={() => {
                if (savedCustomerProfile) {
                  setActiveView('profile');
                  setActiveProfileTab('orders');
                } else {
                  setActiveView('store');
                }
                setTrackingOrder(null);
              }}
              className="mb-4 flex items-center gap-2 text-sm font-black text-[#21170f] hover:text-[#d90429] transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Back to My Orders
            </button>
            <div className="rounded-3xl border border-black/[0.05] bg-white p-6 shadow-xl sm:p-8">
              <div className="text-center"><span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600 mb-4 animate-bounce">
                  <Truck className="h-7 w-7" />
                </span>
                <h2 className="text-2xl font-black text-[#21170f]">Track Your Order</h2>
                <p className="text-sm text-gray-500">Order ID: #{trackingOrder?._id?.toString().slice(-8).toUpperCase()}</p>
              </div>

              {/* Stepper tracking visualization */}
              <div className="mt-10 relative">
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200 -translate-x-1/2" />
                
                <div className="space-y-8 relative">
                  {[
                    { key: 'pending', label: 'Order Placed', desc: 'Awaiting bakery approval' },
                    { key: 'preparing', label: 'Baking 🧑‍🍳', desc: 'Your cake is being baked fresh' },
                    { key: 'out_for_delivery', label: 'Out for Delivery 🚚', desc: 'Driver is on the way' },
                    { key: 'completed', label: 'Delivered 🎂', desc: 'Enjoy your fresh treats!' }
                  ].map((step, index) => {
                    const statusOrder = ['pending', 'preparing', 'out_for_delivery', 'completed', 'delivered'];
                    const currentIdx = statusOrder.indexOf(trackingOrder?.status || 'pending');
                    const stepIdx = statusOrder.indexOf(step.key === 'completed' ? 'completed' : step.key);
                    
                    const isCompleted = currentIdx >= stepIdx || (step.key === 'completed' && trackingOrder?.status === 'delivered');
                    const isActive = trackingOrder?.status === step.key || (step.key === 'completed' && trackingOrder?.status === 'delivered');

                    return (
                      <div key={step.key} className="flex gap-4 items-start pl-8 relative">
                        <div className={`absolute left-0 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                          isCompleted
                            ? 'border-[#0c7a35] bg-[#0c7a35] text-white shadow-md shadow-[#0c7a35]/20'
                            : 'border-gray-200 bg-white text-gray-400'
                        }`}>
                          {isCompleted ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
                        </div>
                        <div>
                          <h4 className={`text-sm font-black transition-colors ${isActive ? 'text-[#e63946]' : isCompleted ? 'text-[#0c7a35]' : 'text-gray-400'}`}>{step.label}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order details summary */}
              <div className="mt-10 border-t border-dashed pt-6 space-y-4">
                <h3 className="font-black text-sm uppercase tracking-wider text-[#92602f]">Order Details</h3>
                <div className="rounded-2xl border border-gray-100 p-4 space-y-2.5">
                  {(trackingOrder?.items || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm font-bold text-[#6f6258]">
                      <span>{item.name} x {item.quantity}</span>
                      <span className="text-[#21170f]">{currency}{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2.5 flex justify-between font-black text-base text-[#21170f]">
                    <span>Total Paid / Payable</span>
                    <span>{currency}{trackingOrder?.totalAmount}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3.5 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      axios.get(`${API_URL}/store-orders/customer-orders`, {
                        params: { phone: trackingOrder.phone }
                      }).then(({ data }) => {
                        const updated = data.find(o => o._id === trackingOrder._id);
                        if (updated) setTrackingOrder(updated);
                        toast.success('Status refreshed!');
                      });
                    }}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#21170f] font-black text-white hover:bg-[#3c3028]"
                  >
                    Refresh Status
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('store');
                      setTrackingOrder(null);
                    }}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white font-black text-[#21170f] hover:bg-gray-50"
                  >
                    Back to Bakery Menu
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : activeView === 'profile' && savedCustomerProfile ? (
          <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 pb-12 animate-fadeIn space-y-6">

            {/* Customer Welcome Hero Card */}
            <div className="hidden sm:block relative overflow-hidden rounded-3xl bg-white border border-black/[0.06] p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#fff1e8] text-[#d90429] border border-[#f0e8de]">
                      <User className="h-7 w-7 sm:h-8 sm:w-8" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white text-[9px] font-black border-2 border-white" title="Active Account">✓</span>
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#21170f]">{savedCustomerProfile.customerName || 'Valued Customer'}</h1>
                    <p className="mt-0.5 text-xs font-semibold text-gray-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>📞 {savedCustomerProfile.phone}</span>
                      {savedCustomerProfile.email && <><span>•</span><span>✉️ {savedCustomerProfile.email}</span></>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveProfileTab('settings')}
                    className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-[#f7f2ec] hover:bg-[#f0e8de] border border-[#e8ddd4] text-xs font-black text-[#21170f] transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => { handleCustomerLogout(); setActiveView('store'); }}
                    title="Logout"
                    className="h-10 w-10 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 text-red-500 transition cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>



            {/* Navigation Tabs — 3 tabs only */}
            <div id="profile-navigation-tabs-row" className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{scrollbarWidth:'none',msOverflowStyle:'none'}}>
              {[
                { id: 'orders', label: 'My Orders', icon: History, count: customerOrders.length },
                { id: 'wishlist', label: 'My Wishlist', icon: Heart, count: wishlist.length },
                { id: 'settings', label: 'My Profile', icon: User }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeProfileTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`profile-tab-button-${tab.id}`}
                    type="button"
                    onClick={() => setActiveProfileTab(tab.id)}
                    className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-[#d90429] text-white shadow-lg shadow-[#d90429]/25 scale-[1.02]'
                        : 'bg-white text-[#21170f] hover:bg-gray-100 border border-black/[0.05]'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count !== null && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Section Content Card */}
            <div id="profile-active-section-card" className="w-full rounded-3xl bg-white border border-black/[0.05] shadow-sm p-6 sm:p-8 min-h-[400px]">
              {/* ORDERS TAB */}
              {activeProfileTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="text-xl font-black text-[#21170f]">Order History</h3>
                      <p className="text-xs font-bold text-gray-400 mt-0.5">Track your ongoing order status and past purchases</p>
                    </div>
                    <span className="rounded-full bg-red-50 text-[#d90429] px-3 py-1 text-xs font-black">
                      {customerOrders.length} {customerOrders.length === 1 ? 'Order' : 'Orders'} Total
                    </span>
                  </div>

                  {customerOrders.length === 0 ? (
                    <div className="py-16 text-center rounded-3xl border border-dashed border-black/10 bg-[#fdfaf6]">
                      <History className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                      <h4 className="font-black text-base text-[#21170f]">No orders placed yet</h4>
                      <p className="text-xs text-gray-500 font-semibold mt-1">Explore our bakery menu and treat yourself to fresh cakes!</p>
                      <button
                        type="button"
                        onClick={() => setActiveView('store')}
                        className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#d90429] px-6 text-xs font-black uppercase tracking-wider text-white hover:bg-[#c50323] transition shadow-md shadow-[#d90429]/20"
                      >
                        Explore Menu Now →
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customerOrders.map((order) => (
                        <div key={order._id} className="rounded-2xl border border-black/[0.06] bg-[#fdfaf6] p-5 shadow-sm space-y-4 hover:border-black/10 transition">
                          <div className="flex justify-between items-start flex-wrap gap-2 border-b border-black/5 pb-3">
                            <div>
                              <p className="text-xs text-gray-400 font-black tracking-wider uppercase">Order #{order._id.slice(-8).toUpperCase()}</p>
                              <p className="text-xs text-gray-500 font-bold mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {order.status === 'pending' ? 'Placed' : order.status === 'preparing' ? 'Baking Fresh' : order.status === 'out_for_delivery' ? 'Out For Delivery' : order.status}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {(order.items || []).map((item, index) => (
                              <div key={index} className="flex justify-between text-xs font-bold text-[#6f6258]">
                                <span>{item.name} x {item.quantity}</span>
                                <span className="text-[#21170f]">{currency}{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-dashed pt-3 flex justify-between items-center font-black text-sm">
                            <span className="text-[#21170f]">Total Amount</span>
                            <span className="text-[#d90429] text-base">{currency}{order.totalAmount}</span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                (order.items || []).forEach(item => {
                                  const prod = products.find(p => p._id === item.productId || p.name === item.name);
                                  if (prod) addToCart(prod, item.variant || null, item.customMessage || '', false);
                                });
                                toast.success('Items added to cart!');
                              }}
                              className="flex-1 flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#fff1e8] border border-[#f0e8de] text-xs font-black text-[#d90429] hover:bg-[#fde8df] transition cursor-pointer"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Reorder
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTrackingOrder(order);
                                setActiveView('tracking');
                              }}
                              className="flex-1 flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#1a56db] hover:bg-[#1648c5] text-xs font-black text-white transition cursor-pointer"
                            >
                              <Truck className="h-3.5 w-3.5" />
                              Track Order
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* WISHLIST TAB */}
              {activeProfileTab === 'wishlist' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="text-xl font-black text-[#21170f]">My Wishlist</h3>
                      <p className="text-xs font-bold text-gray-400 mt-0.5">Your favorite saved cakes and bakery items</p>
                    </div>
                    <span className="rounded-full bg-red-50 text-[#d90429] px-3 py-1 text-xs font-black">
                      {wishlist.length} Saved
                    </span>
                  </div>

                  {products.filter(p => wishlist.includes(p._id)).length === 0 ? (
                    <div className="py-16 text-center rounded-3xl border border-dashed border-black/10 bg-[#fdfaf6]">
                      <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                      <h4 className="font-black text-base text-[#21170f]">Your wishlist is empty</h4>
                      <p className="text-xs text-gray-500 font-semibold mt-1">Tap the heart icon on any cake to save it here!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {products.filter(p => wishlist.includes(p._id)).map((product) => {
                        const variants = getProductVariants(product);
                        const basePrice = variants.length > 0 ? variants[0].price : product.price;
                        const originalPrice = variants.length > 0 ? (variants[0].originalPrice || variants[0].price) : (product.originalPrice || product.price);
                        const discountPct = originalPrice > basePrice ? Math.round(((originalPrice - basePrice) / originalPrice) * 100) : 0;
                        return (
                          <div key={product._id} className="relative flex flex-col rounded-2xl border border-black/[0.05] bg-white shadow-sm overflow-hidden group hover:shadow-md transition-all">
                            {/* Remove from wishlist */}
                            <button
                              type="button"
                              onClick={(e) => toggleWishlist(e, product)}
                              className="absolute right-2 top-2 z-10 rounded-full p-1.5 bg-white/90 text-[#d90429] shadow hover:bg-red-50 transition"
                              aria-label="Remove from wishlist"
                            >
                              <Heart className="h-3.5 w-3.5 fill-[#d90429]" />
                            </button>
                            {discountPct > 0 && (
                              <span className="absolute left-2 top-2 z-10 rounded-full bg-[#d90429] px-2 py-0.5 text-[10px] font-black text-white">{discountPct}% OFF</span>
                            )}
                            {/* Product image */}
                            <div className="aspect-square w-full overflow-hidden bg-[#fdfaf6] cursor-pointer" onClick={() => { setSelectedProduct(product); setActiveImage(getProductImages(product)[0] || null); setActiveView('product'); }}>
                              <img src={getProductImages(product)[0] || product.image || '/vite.svg'} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                            {/* Info */}
                            <div className="flex flex-col flex-1 p-3 gap-2">
                              <h4 className="text-xs sm:text-sm font-black text-[#21170f] line-clamp-2 leading-tight">{product.name}</h4>
                              <div className="flex items-center gap-1.5 mt-auto">
                                <span className="text-sm font-black text-[#21170f]">{currency}{basePrice}</span>
                                {discountPct > 0 && <span className="text-xs font-bold text-gray-400 line-through">{currency}{originalPrice}</span>}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAddClick(product)}
                                className="mt-1 h-9 w-full rounded-xl bg-[#d90429] font-black text-white text-[11px] tracking-wider uppercase flex items-center justify-center gap-1 hover:bg-[#c50323] cursor-pointer transition"
                              >
                                <Plus className="h-3.5 w-3.5 stroke-[3]" /> Add to Cart
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* MY PROFILE TAB — edit info + address + loyalty wallet */}
              {activeProfileTab === 'settings' && (
                <div className="space-y-6 max-w-3xl">
                  <div className="border-b pb-4">
                    <h3 className="text-xl font-black text-[#21170f]">My Profile</h3>
                    <p className="text-xs font-bold text-gray-400 mt-0.5">Manage your personal information and delivery details</p>
                  </div>

                  {/* Loyalty Wallet — compact inline card */}
                  <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#d90429] to-[#ef233c] p-3 sm:px-6 sm:py-4 text-white shadow-md shadow-[#d90429]/20">
                    <div className="flex items-center gap-2">
                      <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-white/80 shrink-0" />
                      <div>
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/70">Loyalty Points</p>
                        <p className="text-lg sm:text-2xl font-black">{savedCustomerProfile?.loyaltyPoints || 0} Pts</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/70">Equivalent Value</p>
                      <p className="text-base sm:text-lg font-black">{currency}{(savedCustomerProfile?.loyaltyPoints || 0) * (settings.loyaltyValuePerPoint || 1)}</p>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="rounded-2xl border border-black/[0.06] bg-[#fdfaf6] p-6 space-y-5">
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-[#6f6258]">Full Name</label>
                      <input
                        type="text"
                        defaultValue={savedCustomerProfile.customerName}
                        id="profile-edit-name"
                        className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold outline-none focus:border-[#d90429]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-[#6f6258]">Mobile Number</label>
                        <input
                          type="text"
                          value={savedCustomerProfile.phone}
                          disabled
                          className="h-12 w-full rounded-xl border border-black/5 bg-gray-100 px-4 text-sm font-semibold text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-[#6f6258]">Email ID</label>
                        <input
                          type="email"
                          defaultValue={savedCustomerProfile.email}
                          id="profile-edit-email"
                          className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold outline-none focus:border-[#d90429]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-[#6f6258]">Birthday 🎂</label>
                        <input
                          type="date"
                          defaultValue={savedCustomerProfile.dob ? savedCustomerProfile.dob.split('T')[0] : ''}
                          id="profile-edit-dob"
                          className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-[#6f6258]">Anniversary 💍</label>
                        <input
                          type="date"
                          defaultValue={savedCustomerProfile.anniversaryDate ? savedCustomerProfile.anniversaryDate.split('T')[0] : ''}
                          id="profile-edit-anniversary"
                          className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold outline-none"
                        />
                      </div>
                    </div>

                    {/* Delivery Addresses — multiple support */}
                    <div className="space-y-3 border-t border-black/5 pt-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-black uppercase tracking-wider text-[#6f6258]">📍 Delivery Addresses</label>
                        <button
                          type="button"
                          onClick={() => {
                            const list = JSON.parse(localStorage.getItem(`addresses_${savedCustomerProfile.phone}`) || '[]');
                            list.push('');
                            localStorage.setItem(`addresses_${savedCustomerProfile.phone}`, JSON.stringify(list));
                            // force re-render by updating a dummy state
                            document.getElementById('profile-address-list')?.dispatchEvent(new Event('rerender'));
                            const newBox = document.getElementById(`profile-address-${list.length - 1}`);
                            if (newBox) newBox.focus();
                          }}
                          className="flex items-center gap-1 text-xs font-black text-[#d90429] hover:underline cursor-pointer"
                        >
                          <Plus className="h-3 w-3 stroke-[3]" /> Add Address
                        </button>
                      </div>
                      {/* Primary address (always shown) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#d90429] bg-red-50 px-2 py-0.5 rounded-full">Default</span>
                          <button
                            type="button"
                            onClick={() => handleDetectLocationForAddress('profile-address-box')}
                            disabled={detectingLocId !== null}
                            className="flex items-center gap-1.5 text-[11px] font-black text-[#1a56db] hover:underline cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition"
                          >
                            <MapPin className="h-3 w-3" />
                            {detectingLocId === 'profile-address-box' ? 'Detecting...' : 'Use My Current Location'}
                          </button>
                        </div>
                        <textarea
                          rows="2"
                          defaultValue={savedCustomerProfile.address}
                          id="profile-address-box"
                          className="w-full resize-none rounded-2xl border border-[#d90429]/30 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#d90429] focus:shadow-md transition"
                          placeholder="House/Flat No., Building, Street, Landmark, Pincode"
                        />
                      </div>
                      {/* Extra saved addresses */}
                      {(() => {
                        const extras = JSON.parse(localStorage.getItem(`addresses_${savedCustomerProfile.phone}`) || '[]');
                        return extras.map((addr, idx) => (
                          <div key={idx} className="space-y-2 border border-black/[0.05] bg-white/60 p-3 rounded-2xl relative">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Address {idx + 2}</span>
                              <div className="flex items-center gap-4 pr-7">
                                <button
                                  type="button"
                                  onClick={() => handleDetectLocationForAddress(`profile-address-extra-${idx}`)}
                                  disabled={detectingLocId !== null}
                                  className="flex items-center gap-1.5 text-[11px] font-black text-[#1a56db] hover:underline cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition"
                                >
                                  <MapPin className="h-3 w-3" />
                                  {detectingLocId === `profile-address-extra-${idx}` ? 'Detecting...' : 'Use My Current Location'}
                                </button>
                              </div>
                            </div>
                            <textarea
                              rows="2"
                              defaultValue={addr}
                              id={`profile-address-extra-${idx}`}
                              className="w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#d90429] transition"
                              placeholder="House/Flat No., Building, Street, Landmark, Pincode"
                              onChange={(e) => {
                                const list = JSON.parse(localStorage.getItem(`addresses_${savedCustomerProfile.phone}`) || '[]');
                                list[idx] = e.target.value;
                                localStorage.setItem(`addresses_${savedCustomerProfile.phone}`, JSON.stringify(list));
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const list = JSON.parse(localStorage.getItem(`addresses_${savedCustomerProfile.phone}`) || '[]');
                                list.splice(idx, 1);
                                localStorage.setItem(`addresses_${savedCustomerProfile.phone}`, JSON.stringify(list));
                                window.location.reload();
                              }}
                              className="absolute right-3 top-3 text-gray-400 hover:text-red-500 transition"
                              title="Remove this address"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* Other Occasion */}
                    <div className="border-t border-black/5 pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-[#6f6258]">Other Special Occasion</span>
                        <button
                          type="button"
                          onClick={() => { const el = document.getElementById('profile-edit-other-group'); if (el) el.classList.toggle('hidden'); }}
                          className="text-xs font-black text-[#d90429] hover:underline cursor-pointer"
                        >
                          + Add / Edit
                        </button>
                      </div>
                      <div
                        id="profile-edit-other-group"
                        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${savedCustomerProfile.specialDate || savedCustomerProfile.specialDateDescription ? '' : 'hidden'}`}
                      >
                        <div className="space-y-2">
                          <label className="block text-xs font-black uppercase tracking-wider text-[#6f6258]">Occasion Name</label>
                          <input type="text" defaultValue={savedCustomerProfile.specialDateDescription || ''} id="profile-edit-special-desc" placeholder="e.g. Baby Shower, Graduation" className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold outline-none focus:border-[#d90429]" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-black uppercase tracking-wider text-[#6f6258]">Occasion Date</label>
                          <input type="date" defaultValue={savedCustomerProfile.specialDate ? savedCustomerProfile.specialDate.split('T')[0] : ''} id="profile-edit-special-date" className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold outline-none focus:border-[#d90429]" />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const name = document.getElementById('profile-edit-name')?.value || '';
                        const email = document.getElementById('profile-edit-email')?.value || '';
                        const dob = document.getElementById('profile-edit-dob')?.value || '';
                        const anniversary = document.getElementById('profile-edit-anniversary')?.value || '';
                        const address = document.getElementById('profile-address-box')?.value || '';
                        const specialDesc = document.getElementById('profile-edit-special-desc')?.value || '';
                        const specialDate = document.getElementById('profile-edit-special-date')?.value || '';
                        handleUpdateProfileDetails(name, email, dob, anniversary, address, specialDate, specialDesc);
                      }}
                      disabled={isLoading}
                      className="w-full h-12 rounded-xl bg-[#d90429] font-black text-xs uppercase tracking-wider text-white hover:bg-[#c50323] transition duration-200 cursor-pointer shadow-md shadow-[#d90429]/20"
                    >
                      {isLoading ? 'Saving...' : 'Save All Changes'}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </section>
        ) : (
          <section className="px-4 pt-6 sm:px-6">
            <div className="mb-6 flex flex-col gap-4 border-b border-black/5 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#21170f]">My Order History</h2>
                {savedCustomerProfile?.phone && (
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-[#6f6258]">
                    <span>Account: {savedCustomerProfile.customerName || 'Guest'} ({savedCustomerProfile.phone})</span>
                    <button onClick={handleCustomerLogout} className="text-[#e63946] underline hover:text-[#c5303c] ml-2">
                      Logout
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setActiveView('store')}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#21170f] border border-black/10 shadow-sm transition hover:bg-[#f7f2ec] sm:w-auto"
              >
                ← Back to Bakery Menu
              </button>
            </div>

            <div className="space-y-4">
              {!savedCustomerProfile?.phone ? (
                <div className="mx-auto max-w-md rounded-3xl border border-black/[0.05] bg-[#fffdf9] p-6 sm:p-8 text-center shadow-sm">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1e8] text-[#d90429] border border-black/[0.03] mb-4 shadow-sm">
                    <User className="h-7 w-7" />
                  </span>
                  <h3 className="text-xl font-black text-[#21170f]">Customer Login</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#6f6258] font-semibold">
                    Apne mobile number ya email se login karein aur apne sabhi purane orders ka status aur tracking details dekhein!
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => triggerAuthFlow()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d90429] py-3.5 font-black text-white hover:bg-[#c50323] transition-all shadow-md shadow-[#d90429]/20 cursor-pointer text-xs uppercase tracking-wider"
                    >
                      <User className="h-4.5 w-4.5" />
                      Login / Verify with OTP
                    </button>
                  </div>
                </div>
              ) : customerOrders.length === 0 ? (
                <div className="mx-auto max-w-md rounded-3xl border border-black/[0.04] bg-[#fffdf9] p-8 text-center shadow-sm">
                  <ShoppingBag className="mx-auto h-16 w-16 text-[#92602f]/40 mb-4" />
                  <h3 className="text-base font-black text-[#21170f]">Abhi tak koi order nahi kiya</h3>
                  <p className="mt-3 text-xs leading-relaxed text-[#6f6258]">
                    Bakery se apne manpasand items cart mein add karein aur pehla order place karein!
                  </p>
                  <button
                    onClick={() => setActiveView('store')}
                    className="mt-6 rounded-2xl bg-[#21170f] px-6 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-[#32251b] transition-all"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 pb-8">
                  {customerOrders.map(order => {
                    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    const statusColors = {
                      pending: 'bg-amber-50 text-amber-700 border-amber-200',
                      preparing: 'bg-blue-50 text-blue-700 border-blue-200',
                      out_for_delivery: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      rejected: 'bg-red-50 text-red-700 border-red-200',
                      cancelled: 'bg-red-50 text-red-700 border-red-200'
                    };
                    const statusBadge = statusColors[order.status] || 'bg-gray-50 text-gray-700 border-gray-200';                     const stepIndexMap = {
                      pending: 0,
                      preparing: 1,
                      out_for_delivery: 2,
                      completed: 3
                    };
                    const currentStepIndex = stepIndexMap[order.status] ?? -1;
                    const isFailed = ['rejected', 'cancelled'].includes(order.status);
                    return (
                      <div key={order._id} className="rounded-3xl border border-black/[0.05] bg-[#fffdf9] p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-3 border-b border-black/[0.03] pb-3.5">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Order Placed</p>
                            <p className="text-sm font-bold text-[#6f6258] mt-0.5">{orderDate}</p>
                          </div>
                          <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${statusBadge}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Items list */}
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs font-semibold text-[#21170f]">
                              <span>{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                              <span className="text-gray-500">{currency}{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Card footer details and actions */}
                        <div className="border-t border-black/[0.03] pt-3.5 space-y-3">
                          <div className="flex items-center justify-between text-xs font-black">
                            <span className="text-gray-400">Total Paid</span>
                            <span className="text-[#92602f] text-sm">{currency}{order.totalAmount}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => handleReorder(order)}
                              className="flex h-9.5 items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-white text-xs font-black uppercase tracking-wider text-[#6f6258] hover:bg-gray-50 transition"
                            >
                              <History className="w-3.5 h-3.5" />
                              Order Again
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTrackingOrder(order);
                                setActiveView('tracking');
                              }}
                              className="flex h-9.5 items-center justify-center gap-1.5 rounded-xl bg-[#d90429] text-xs font-black uppercase tracking-wider text-white hover:bg-[#c50323] transition shadow-sm shadow-[#d90429]/10"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              Track Order
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* ── LIGHT PREMIUM BAKINGO STYLE FOOTER ── */}
      {activeView === 'store' && (
        <footer className="mt-2 border-t border-black/10 bg-[#fffcf7] text-[#21170f]">
        {/* Main Footer Links & Info Grid */}
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 py-5 sm:py-8 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          {/* Col 1: Brand & About */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {settings.logo ? (
                <img src={getImageUrl(settings.logo)} alt={settings.bakeryName || 'Oneness Bakery'} className="h-14 sm:h-16 md:h-20 w-auto max-w-[300px] object-contain transition-all" />
              ) : (
                <img src="/oneness_logo_2.png" alt="Oneness Bakery" className="h-14 sm:h-16 md:h-20 w-auto max-w-[300px] object-contain transition-all" />
              )}
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-[#5c4a3e] font-semibold max-w-md">
              {settings.aboutText || "Indulge in the sweetness of Oneness Bakery Cafe, Roorkee's premier eggless cake shop, where traditional baking meets innovative flavors. Our expert bakers craft delicious, allergy-friendly treats that will delight your senses."}
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              {settings.whatsappNumber && (
                <a href={`https://wa.me/${(settings.whatsappNumber || settings.phone || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#25d366] text-white shadow-md hover:scale-110 transition-transform">
                  <MessageCircle className="h-4.5 w-4.5" />
                </a>
              )}
              {settings.phone && (
                <a href={`tel:${settings.phone}`} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d90429] text-white shadow-md hover:scale-110 transition-transform">
                  <Phone className="h-4.5 w-4.5" />
                </a>
              )}
              {(settings.instagram || 'https://www.instagram.com/onenessbakery/') && (
                <a href={settings.instagram || 'https://www.instagram.com/onenessbakery/'} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e1306c] text-white shadow-md hover:scale-110 transition-transform" title="Instagram">
                  <Instagram className="h-4.5 w-4.5" />
                </a>
              )}
              {(settings.facebook || 'https://www.facebook.com/OnenessBakeryCafe/') && (
                <a href={settings.facebook || 'https://www.facebook.com/OnenessBakeryCafe/'} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1877f2] text-white shadow-md hover:scale-110 transition-transform" title="Facebook">
                  <Facebook className="h-4.5 w-4.5" />
                </a>
              )}
              {(settings.googleReviewUrl || 'https://share.google/CuRx6C3eNHDyasuC2') && (
                <a href={settings.googleReviewUrl || 'https://share.google/CuRx6C3eNHDyasuC2'} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4285f4] text-white shadow-md hover:scale-110 transition-transform" title="Google Business">
                  <MapPin className="h-4.5 w-4.5" />
                </a>
              )}
              {settings.email && (
                <a href={`mailto:${settings.email}`} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#21170f] text-white shadow-md hover:scale-110 transition-transform">
                  <Mail className="h-4.5 w-4.5" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Store Info */}
          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-black text-[#21170f] tracking-tight uppercase border-b border-black/[0.08] pb-1">Store Info</h3>
            <div className="space-y-2 text-xs sm:text-sm font-bold text-[#5c4a3e]">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#d90429] shrink-0 mt-0.5" />
                <span>{settings.address || 'Ramnagar chowk, 617, Ambar Talab West, Ganeshpur, Roorkee, Shafipur, Uttarakhand 247667'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#d90429] shrink-0" />
                <span>{settings.phone || '079008 42550'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#d90429] shrink-0" />
                <span>{settings.email || 'onenessbakery@gmail.com'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Timer className="h-4 w-4 text-[#d90429] shrink-0" />
                <span>{settings.openingHours || 'Tuesday – Monday: 10:00 AM – 10:00 PM'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip with pb-20 for Mobile Bottom Navbar */}
        <div className="border-t border-black/[0.08] bg-[#f5efe6] pt-4 pb-20 sm:py-5 text-center text-xs sm:text-sm font-extrabold text-[#5c4a3e]">
          <div className="mx-auto max-w-[1440px] px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© {new Date().getFullYear()} {settings.bakeryName || 'Oneness Bakery'}. All Rights Reserved.</p>
            <p className="flex items-center gap-1.5 flex-wrap justify-center">
              <span>Crafted with</span>
              <Heart className="h-4 w-4 fill-[#d90429] text-[#d90429] inline" />
              <span>|</span>
              <a
                href="https://genzteck.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold hover:text-[#d90429] transition-colors inline-flex items-center gap-1 group cursor-pointer"
                title="Visit GenzTeck Website"
              >
                <span>Developed by</span>
                <span className="font-black text-[#d90429] group-hover:underline">GenzTeck</span>
              </a>
            </p>
          </div>
        </div>
      </footer>
      )}

      {/* ── FOOTER INFORMATION POPUP MODAL (About Us, Contact Us, Delivery, Terms) ── */}
      {infoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setInfoModal(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-3 mb-4">
              <h3 className="text-xl font-black text-[#d90429] uppercase tracking-tight">
                {infoModal === 'about_us' && '🎂 About Our Bakery'}
                {infoModal === 'contact_us' && '📞 Contact Us & Location'}
                {infoModal === 'delivery' && '🚀 Delivery Information'}
                {infoModal === 'terms' && '📜 Terms & Privacy Policy'}
              </h3>
              <button onClick={() => setInfoModal(null)} className="rounded-full bg-gray-100 p-2 hover:bg-gray-200 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm sm:text-base font-semibold text-[#21170f] leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              {infoModal === 'about_us' && (
                <>
                  <p>Welcome to <strong>{settings.bakeryName || 'Oneness Bakery Cafe'}</strong>!</p>
                  <p>{settings.aboutText || "Indulge in the sweetness of Oneness Bakery Cafe, Roorkee's premier eggless cake shop, where traditional baking meets innovative flavors. Our expert bakers craft delicious, allergy-friendly treats that will delight your senses. Visit us in the heart of Roorkee, Uttarakhand, and discover a world of eggless wonders. Treat yourself to a slice of heaven, and let us make your special moments unforgettable. Come, taste the difference, and experience the Oneness!"}</p>
                  <div className="rounded-2xl bg-[#fff0f1] p-4 border border-[#d90429]/20 text-[#d90429] font-bold">
                    ✨ Roorkee's Premier 100% Eggless Cake Shop & Cafe!
                  </div>
                </>
              )}

              {infoModal === 'contact_us' && (
                <>
                  <p>Have a custom cake inquiry or order question? We are here to help!</p>
                  <div className="space-y-2.5 rounded-2xl bg-[#fffdf9] p-4 border border-black/10">
                    <p>📍 <strong>Address:</strong> {settings.address || 'Ramnagar chowk, 617, Ambar Talab West, Ganeshpur, Roorkee, Shafipur, Uttarakhand 247667'}</p>
                    <p>📞 <strong>Phone:</strong> {settings.phone || '079008 42550'}</p>
                    <p>💬 <strong>WhatsApp:</strong> {settings.whatsappNumber || settings.phone || '079008 42550'}</p>
                    <p>📧 <strong>Email:</strong> {settings.email || 'onenessbakery@gmail.com'}</p>
                    <p>⏰ <strong>Working Hours:</strong> {settings.openingHours || 'Tuesday – Monday: 10:00 AM – 10:00 PM'}</p>
                    <p>📍 <strong>Google Business Page:</strong> <a href={settings.googleReviewUrl || 'https://share.google/CuRx6C3eNHDyasuC2'} target="_blank" rel="noopener noreferrer" className="text-[#d90429] underline font-bold">View Location & Reviews</a></p>
                  </div>
                </>
              )}

              {infoModal === 'delivery' && (
                <>
                  <p>We provide fast and reliable delivery services across Jaipur to ensure your cake arrives fresh and intact.</p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li><strong>Express Delivery:</strong> Delivered within 2-3 hours of order placement.</li>
                    <li><strong>Midnight Delivery:</strong> Surprise your loved ones right at 12:00 AM.</li>
                    <li><strong>Free Delivery:</strong> On all orders above {currency}{FREE_DELIVERY_MINIMUM}.</li>
                    <li><strong>Temperature Controlled:</strong> Transported in insulated boxes.</li>
                  </ul>
                </>
              )}

              {infoModal === 'terms' && (
                <>
                  <p>We maintain the highest standards of hygiene, fresh ingredients, and customer satisfaction.</p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>100% fresh baking guarantee for every order.</li>
                    <li>Full refund or replacement if the order is damaged during delivery.</li>
                    <li>Customer privacy and payment safety are 100% encrypted & secure.</li>
                  </ul>
                </>
              )}
            </div>

            <button
              onClick={() => setInfoModal(null)}
              className="mt-6 w-full rounded-2xl bg-[#d90429] py-3 text-sm font-black uppercase text-white shadow-md hover:bg-[#b80020] transition-colors"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* 📱 Mobile Bottom Navigation Bar (4 Tabs: Home, Search, Cart, My Orders) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1.5 flex items-center justify-around sm:hidden select-none">
        {/* Home Tab */}
        <button
          type="button"
          onClick={() => {
            setActiveView('store');
            setSelectedProduct(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeView === 'store' && !selectedProduct && !showCart && !showProfile && !showTrackModal
              ? 'text-[#d90429] font-black scale-105'
              : 'text-gray-500 font-semibold hover:text-[#21170f]'
          }`}
        >
          <Home className="h-5 w-5 stroke-[2.2]" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* Search Tab */}
        <button
          type="button"
          onClick={() => {
            setActiveView('store');
            setSelectedProduct(null);
            const inputEl = document.getElementById('store-search');
            if (inputEl) {
              inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              setTimeout(() => {
                inputEl.focus();
              }, 300);
            }
          }}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer text-gray-500 font-semibold hover:text-[#d90429] active:scale-95"
        >
          <Search className="h-5 w-5 stroke-[2.2]" />
          <span className="text-[10px]">Search</span>
        </button>

        {/* Cart Tab */}
        <button
          type="button"
          onClick={() => setShowCart(true)}
          className={`relative flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            showCart ? 'text-[#d90429] font-black scale-105' : 'text-gray-500 font-semibold hover:text-[#21170f]'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="h-5 w-5 stroke-[2.2]" />
            {totalQuantity > 0 && (
              <span className="absolute -top-2 -right-3 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[#d90429] px-1 text-[10px] font-black text-white shadow-md ring-2 ring-white">
                {totalQuantity}
              </span>
            )}
          </div>
          <span className="text-[10px]">Cart</span>
        </button>

        {/* My Orders Tab */}
        <button
          type="button"
          onClick={() => {
            if (savedCustomerProfile?.phone) {
              setActiveView('profile');
              setActiveProfileTab('orders');
              fetchCustomerOrders();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              triggerAuthFlow();
            }
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeView === 'profile'
              ? 'text-[#d90429] font-black scale-105'
              : 'text-gray-500 font-semibold hover:text-[#21170f]'
          }`}
        >
          <Package className="h-5 w-5 stroke-[2.2]" />
          <span className="text-[10px]">My Orders</span>
        </button>
      </nav>

      {/* 📱 MOBILE PROFILE PREVIEW POPUP MODAL */}
      {showProfilePreviewModal && savedCustomerProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:hidden animate-in fade-in duration-200" onClick={() => setShowProfilePreviewModal(false)}>
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl relative overflow-hidden animate-scaleUp" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setShowProfilePreviewModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header info */}
            <div className="flex items-start gap-3.5 pb-4 border-b border-black/5 mt-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1e8] text-[#d90429] border border-[#f0e8de] shrink-0">
                <User className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <h3 className="text-base font-black text-[#21170f] truncate">{savedCustomerProfile.customerName || 'Valued Customer'}</h3>
                <p className="text-xs text-gray-500 font-semibold truncate">📞 {savedCustomerProfile.phone}</p>
                {savedCustomerProfile.email && (
                  <p className="text-xs text-gray-400 font-semibold truncate">✉️ {savedCustomerProfile.email}</p>
                )}
              </div>
            </div>

            {/* Profile Detail Fields */}
            <div className="my-4 bg-[#fdfaf6] p-4 rounded-2xl border border-black/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#d90429] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                  Default Address
                </span>
              </div>
              <div className="flex items-start gap-2 pt-1 text-xs text-gray-600 font-semibold">
                <span className="shrink-0 text-sm">📍</span>
                <span className="line-clamp-3 flex-1 text-left leading-relaxed">{savedCustomerProfile.address || 'No address set'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowProfilePreviewModal(false);
                  setActiveView('profile');
                  setActiveProfileTab('settings'); // Go directly to edit profile settings
                  fetchCustomerOrders();
                  setTimeout(() => {
                    const el = document.getElementById('profile-active-section-card');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    
                    const tabBtn = document.getElementById('profile-tab-button-settings');
                    const tabRow = document.getElementById('profile-navigation-tabs-row');
                    if (tabBtn && tabRow) {
                      const scrollLeft = tabBtn.offsetLeft - (tabRow.clientWidth / 2) + (tabBtn.clientWidth / 2);
                      tabRow.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                    }
                  }, 150);
                }}
                className="w-full flex h-11 items-center justify-center gap-2 rounded-xl bg-[#d90429] text-xs font-black uppercase tracking-wider text-white hover:bg-[#c50323] transition-colors cursor-pointer shadow-sm shadow-[#d90429]/10"
              >
                <User className="h-3.5 w-3.5" />
                Edit Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProfilePreviewModal(false);
                  setActiveView('profile');
                  setActiveProfileTab('orders'); // Go to orders
                  fetchCustomerOrders();
                  setTimeout(() => {
                    const el = document.getElementById('profile-active-section-card');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    
                    const tabBtn = document.getElementById('profile-tab-button-orders');
                    const tabRow = document.getElementById('profile-navigation-tabs-row');
                    if (tabBtn && tabRow) {
                      const scrollLeft = tabBtn.offsetLeft - (tabRow.clientWidth / 2) + (tabBtn.clientWidth / 2);
                      tabRow.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                    }
                  }, 150);
                }}
                className="w-full flex h-11 items-center justify-center gap-2 rounded-xl bg-[#fdfaf6] border border-black/[0.08] text-xs font-black uppercase tracking-wider text-[#21170f] hover:bg-gray-50 transition"
              >
                <Package className="h-3.5 w-3.5 text-gray-500" />
                My Orders & Wishlist
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProfilePreviewModal(false);
                  handleCustomerLogout();
                  setActiveView('store');
                }}
                className="w-full flex h-11 items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-100 text-xs font-black uppercase tracking-wider text-red-600 hover:bg-red-100/60 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links Floating Action Button */}

      {quickLinks.length > 0 && (
        <div className={`fixed ${cart.length > 0 ? 'bottom-28 sm:bottom-24' : 'bottom-20 sm:bottom-6'} right-4 z-40 flex flex-col items-end gap-2.5 select-none transition-all duration-300`}>
          {/* Expanded Stack of Circles */}
          {showQuickLinks && (
            <div className="flex flex-col items-end gap-2 animate-slideUp">
              {quickLinks.map((link, index) => {
                const Icon = quickIcon(link.type);
                
                // Color mapping for sub-buttons
                let colorClass = "bg-white text-gray-700 hover:bg-[#21170f] hover:text-white border border-gray-200";
                if (link.type === 'whatsapp') colorClass = "bg-[#e8f8ef] text-[#119744] hover:bg-[#119744] hover:text-white border border-[#c4ebd3]";
                if (link.type === 'phone') colorClass = "bg-[#e6f6f6] text-[#0d9488] hover:bg-[#0d9488] hover:text-white border border-[#cbebe9]";
                if (link.type === 'instagram') colorClass = "bg-[#fdf0f5] text-[#db2777] hover:bg-[#db2777] hover:text-white border border-[#fbcfe8]";
                if (link.type === 'facebook') colorClass = "bg-[#ebf3fe] text-[#2563eb] hover:bg-[#2563eb] hover:text-white border border-[#bfdbfe]";
                if (link.type === 'website') colorClass = "bg-[#eef2ff] text-[#4f46e5] hover:bg-[#4f46e5] hover:text-white border border-[#c7d2fe]";
                if (link.type === 'email') colorClass = "bg-[#fef2f2] text-[#dc2626] hover:bg-[#dc2626] hover:text-white border border-[#fecaca]";
                if (link.type === 'reviews') colorClass = "bg-[#fefce8] text-[#ca8a04] hover:bg-[#ca8a04] hover:text-white border border-[#fef08a]";
                if (link.type === 'install') colorClass = "bg-[#faf5ff] text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white border border-[#e9d5ff]";

                return (
                  <div key={`${link.type}-${index}`} className="group relative flex items-center justify-end">
                    {/* Tooltip Label */}
                    <span className="absolute right-14 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 bg-[#21170f] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-xl transition-all duration-200 pointer-events-none whitespace-nowrap">
                      {link.label || link.type}
                    </span>
                    {/* Sub Button Circle */}
                    <button
                      onClick={() => {
                        openQuickLink(link);
                        setShowQuickLinks(false);
                      }}
                      className={`flex h-12 w-12 items-center justify-center rounded-full shadow-md transition-all duration-300 transform scale-90 hover:scale-105 hover:-translate-y-0.5 ${colorClass}`}
                      aria-label={link.label || link.type}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Trigger Button - Grid Icon */}
          <button
            onClick={() => setShowQuickLinks(prev => !prev)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#21170f] text-white shadow-xl hover:bg-[#3c3028] transition-all duration-300 hover:scale-105"
            style={{ boxShadow: '0 8px 30px rgba(33,23,15,0.3)' }}
            aria-label="Toggle contact buttons"
          >
            {showQuickLinks ? (
              <X className="h-5 w-5" />
            ) : (
              <LayoutGrid className="h-5 w-5 animate-pulse" />
            )}
          </button>
        </div>
      )}





      {variantProduct && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-sm" onClick={() => setVariantProduct(null)}>
          <div className="w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200" />
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#119744]">Select size</p>
                <h2 className="text-xl font-black text-[#21170f]">{variantProduct.name}</h2>
                <p className="mt-1 text-xs font-semibold text-[#6f6258]">Choose a pack to add it to your cart.</p>
              </div>
              <button onClick={() => setVariantProduct(null)} className="rounded-full bg-gray-100 p-2" aria-label="Close size picker">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              {getProductVariants(variantProduct).map((variant, index) => {
                const variantItem = getCartItem(variantProduct, variant);
                return (
                  <div key={variant._id || variant.label || index} className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-[#fffdf9] p-3 shadow-sm">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f8ef] text-sm font-black text-[#119744]">{index + 1}</span>
                        <div>
                          <p className="font-black text-[#21170f]">{variant.label}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-lg font-black text-[#21170f]">{currency}{variant.price}</span>
                            {variant.originalPrice > variant.price && <span className="text-sm font-bold text-[#9d8371] line-through">{currency}{variant.originalPrice}</span>}
                            {getDiscount(variant.price, variant.originalPrice) > 0 && <span className="rounded-full bg-[#e63946] px-2 py-0.5 text-[10px] font-black text-white">{getDiscount(variant.price, variant.originalPrice)}% OFF</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                    {variantItem ? renderCartControl(variantProduct, variant) : (
                      <button onClick={() => addToCart(variantProduct, variant)} className="h-11 rounded-xl border border-[#119744] bg-white px-5 font-black text-[#119744]">Add</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-start sm:p-4 sm:pt-20" onClick={() => setShowProfile(false)}>
          <div className="w-full max-w-md overflow-hidden rounded-t-[32px] bg-white shadow-2xl sm:rounded-[32px]" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-gradient-to-br from-[#2b1a10] via-[#21170f] to-[#3a281c] px-5 pb-6 pt-5 text-white">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20 sm:hidden" />
              <button onClick={() => setShowProfile(false)} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors z-10" aria-label="Close profile">
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-4 pr-10">
                {settings.logo ? (
                  <img src={settings.logo} alt={settings.bakeryName} className="h-16 w-16 rounded-2xl border border-white/15 bg-white object-contain p-1 shadow-lg shadow-black/25" />
                ) : (
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-[#ffd6a5] border border-white/5">
                    <CakeSlice className="h-8 w-8 animate-pulse" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ffd6a5]">Store Profile</p>
                  <h2 className="mt-1 truncate text-2xl font-black tracking-tight">{settings.bakeryName || 'The Artisan Bakery'}</h2>
                  <p className="mt-1 line-clamp-2 text-xs font-semibold text-white/75">{settings.address || 'Fresh bakery delivery near you'}</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2.5">
                <div className="rounded-2xl bg-white/8 backdrop-blur border border-white/5 p-3 text-center transition hover:bg-white/12">
                  <p className="text-lg font-black text-[#ffd6a5]">4.8 ★</p>
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/60 mt-0.5">Rating</p>
                </div>
                <div className="rounded-2xl bg-white/8 backdrop-blur border border-white/5 p-3 text-center transition hover:bg-white/12">
                  <p className="text-lg font-black text-[#ffd6a5]">45-60</p>
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/60 mt-0.5">Mins</p>
                </div>
                <div className="rounded-2xl bg-white/8 backdrop-blur border border-white/5 p-3 text-center transition hover:bg-white/12">
                  <p className="text-lg font-black text-[#ffd6a5]">{products.length}</p>
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/60 mt-0.5">Items</p>
                </div>
              </div>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setShowProfile(false); focusSearch(); }} className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#f6f0e8] font-black text-[#21170f] transition hover:bg-[#ebdcc8] shadow-sm">
                  <Search className="h-4.5 w-4.5" />
                  Search Menu
                </button>
                <button onClick={() => { setShowProfile(false); setShowCart(true); }} className="relative flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#0c7a35] font-black text-white transition hover:bg-[#0a662c] shadow-lg shadow-[#0c7a35]/15">
                  <ShoppingBag className="h-4.5 w-4.5" />
                  Cart
                  {totalQuantity > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-[#e63946] px-2 py-0.5 text-xs font-black shadow-md">{totalQuantity}</span>}
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-black/[0.04] bg-[#fffdf9] p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-black text-[#21170f]">Store Details</p>
                  <span className="rounded-full bg-[#e9f8ef] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#0c7a35]">Open now</span>
                </div>
                <div className="space-y-3 text-xs font-semibold text-[#6f6258]">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#92602f]" />
                    <span className="line-clamp-2 leading-relaxed">{settings.address || 'Fresh bakery delivery near you'}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Truck className="h-4 w-4 shrink-0 text-[#0c7a35]" />
                    <span className="leading-normal">{deliveryCharge > 0 ? `Free delivery above ${currency}${FREE_DELIVERY_MINIMUM}` : 'Free delivery unlocked'}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Timer className="h-4 w-4 shrink-0 text-[#92602f]" />
                    <span className="leading-normal">Freshly baked batches, delivered in 45-60 mins</span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-black text-[#21170f]">Contact & Social</p>
                  {quickLinks.length > 0 && <span className="text-[10px] font-bold text-[#6f6258] bg-black/[0.03] px-2 py-0.5 rounded-full">{quickLinks.length} active</span>}
                </div>
                <div className="grid gap-2">
                  {quickLinks.length > 0 ? quickLinks.map((link, index) => {
                    const Icon = quickIcon(link.type);
                    const linkColors = {
                      whatsapp: { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100/50', hover: 'hover:bg-emerald-100/40' },
                      instagram: { bg: 'bg-pink-50 text-pink-600 border-pink-100/50', hover: 'hover:bg-pink-100/40' },
                      facebook: { bg: 'bg-blue-50 text-blue-600 border-blue-100/50', hover: 'hover:bg-blue-100/40' },
                      website: { bg: 'bg-indigo-50 text-indigo-600 border-indigo-100/50', hover: 'hover:bg-indigo-100/40' },
                      phone: { bg: 'bg-teal-50 text-teal-600 border-teal-100/50', hover: 'hover:bg-teal-100/40' },
                      email: { bg: 'bg-orange-50 text-orange-600 border-orange-100/50', hover: 'hover:bg-orange-100/40' },
                      reviews: { bg: 'bg-amber-50 text-amber-600 border-amber-100/50', hover: 'hover:bg-amber-100/40' },
                      install: { bg: 'bg-purple-50 text-purple-600 border-purple-100/50', hover: 'hover:bg-purple-100/40' },
                      custom: { bg: 'bg-gray-50 text-gray-600 border-gray-100/50', hover: 'hover:bg-gray-100/40' }
                    };
                    const color = linkColors[link.type] || linkColors.custom;
                    return (
                      <button
                        key={`${link.type}-profile-${index}`}
                        onClick={() => openQuickLink(link)}
                        className={`flex w-full items-center gap-3 rounded-2xl border border-black/[0.04] bg-white p-2.5 text-left font-bold text-[#21170f] shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${color.hover}`}
                      >
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${color.bg}`}>
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-black text-[#21170f]">{link.label || link.type}</span>
                          <span className="block truncate text-[10px] font-bold uppercase tracking-wider text-[#6f6258] mt-0.5">{link.type || 'link'}</span>
                        </span>
                        <ChevronRight className="h-4.5 w-4.5 text-[#9d8371]" />
                      </button>
                    );
                  }) : (
                    <div className="rounded-2xl border border-dashed border-black/10 bg-[#f7f2ec] p-4 text-center text-xs font-semibold text-[#6f6258]">
                      No active contact links available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* ── CUSTOMER AUTH MODAL (LOGIN & SIGN UP FLOW) ── */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 sm:p-6 animate-fadeIn"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className={`w-full overflow-y-auto max-h-[92vh] sm:max-h-[85vh] rounded-[28px] bg-white shadow-2xl shadow-black/40 animate-scaleUp transition-all duration-300 ${
              authStep === 3 ? 'max-w-md sm:max-w-2xl' : 'max-w-sm'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pull Handle (mobile - hidden since centered modal) */}
            <div className="flex justify-center pt-3 pb-0 hidden">
              <div className="h-1.5 w-12 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="relative px-7 pt-7 pb-6 text-center">
              {/* Back button (on the left side if step > 1) */}
              {authStep > 1 && (
                <button
                  type="button"
                  onClick={() => setAuthStep(prev => prev - 1)}
                  className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-4.5 w-4.5" />
                </button>
              )}

              {/* Close button */}
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Bakery Logo in Login/Signup Modal */}
              <div className="text-center mb-4">
                <img src="/oneness_logo_2.png" alt="Oneness Bakery" className="w-52 sm:w-60 h-auto max-h-20 object-contain mx-auto" />
              </div>

              {/* Step dots */}
              <div className="flex items-center justify-center gap-2 mb-5">
                {[1, 2, 3].map(s => (
                  <div
                    key={s}
                    className={`rounded-full transition-all duration-300 ${
                      s === authStep
                        ? 'h-2.5 w-7 bg-[#d90429]'
                        : s < authStep
                        ? 'h-2.5 w-2.5 bg-green-500'
                        : 'h-2.5 w-2.5 bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              <h2 className="text-2xl font-black tracking-tight text-[#21170f] leading-tight">
                {authStep === 1
                  ? 'Login or Sign Up'
                  : authStep === 2
                  ? (authExists ? 'Enter Verification Code' : 'Complete Your Profile')
                  : 'Almost Done!'}
              </h2>
              <p className="mt-2 text-sm text-gray-500 font-medium leading-relaxed">
                {authStep === 1
                  ? 'Enter your mobile number or email address to continue.'
                  : authStep === 2
                  ? `Enter the 6-digit verification code sent to ${authTargetEmail}.`
                  : 'Tell us your name to complete setting up your account.'}
              </p>
            </div>

            {/* Form Body */}
            <div className="px-7 pb-8 space-y-5">

              {/* ── Step 1: Unified Single Input ── */}
              {authStep === 1 && (
                <div className="space-y-5">
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400">
                        Mobile Number or Email Address
                      </label>
                      <input
                        type="text"
                        placeholder="Enter 10-digit mobile or email address"
                        value={authIdentifier}
                        onChange={(e) => setAuthIdentifier(e.target.value)}
                        className="h-14 w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 text-base font-semibold text-[#21170f] outline-none transition-all focus:border-[#d90429] focus:bg-white focus:shadow-[0_0_0_4px_rgba(217,4,41,0.06)]"
                        autoComplete="username"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#d90429] text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-[#d90429]/30 transition-all hover:bg-[#c50323] hover:shadow-xl hover:shadow-[#d90429]/40 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                    >
                      {isLoading
                        ? <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Sending…</span>
                        : 'Continue →'
                      }
                    </button>
                  </form>

                  <p className="text-center text-xs text-gray-400 font-medium leading-relaxed">
                    By continuing you agree to our{' '}
                    <span className="font-black text-[#d90429] cursor-pointer hover:underline">Terms</span> &amp;{' '}
                    <span className="font-black text-[#d90429] cursor-pointer hover:underline">Privacy Policy</span>
                  </p>
                </div>
              )}

              {/* ── Step 2: OTP ── */}
              {authStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  {/* Target indicator */}
                  <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                      {authTargetEmail.includes('@') ? (
                        <Mail className="h-4.5 w-4.5" />
                      ) : (
                        <Smartphone className="h-4.5 w-4.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-widest text-amber-600">
                        {authTargetEmail.includes('@') ? 'Code sent to Email' : 'Code sent to WhatsApp'}
                      </p>
                      <p className="truncate text-sm font-black text-[#21170f]">{authTargetEmail}</p>
                    </div>
                  </div>

                  {/* OTP input */}
                  <div className="space-y-2 text-center">
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="6"
                      placeholder="– – – – – –"
                      value={authOtp}
                      onChange={(e) => setAuthOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="h-16 w-full rounded-2xl border-2 border-gray-100 bg-gray-50 text-center text-3xl font-black tracking-[0.4em] text-[#21170f] outline-none transition-all focus:border-[#d90429] focus:bg-white focus:shadow-[0_0_0_4px_rgba(217,4,41,0.06)]"
                      autoComplete="one-time-code"
                      required
                    />
                    <p className="text-xs text-gray-400 font-medium">Didn't receive it? Check spam or WhatsApp inbox.</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setAuthStep(1)}
                      className="flex h-14 flex-1 items-center justify-center rounded-2xl border-2 border-gray-100 text-sm font-black text-gray-500 transition-colors hover:border-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || authOtp.length < 6}
                      className="flex h-14 flex-[2] items-center justify-center gap-2 rounded-2xl bg-[#d90429] text-sm font-black text-white shadow-lg shadow-[#d90429]/30 transition-all hover:bg-[#c50323] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading
                        ? <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Verifying…</span>
                        : 'Verify & Continue ✓'
                      }
                    </button>
                  </div>
                </form>
              )}

              {/* ── Step 3: Profile completion ── */}
              {authStep === 3 && (
                <form onSubmit={handleRegisterCustomer} className="space-y-5 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                  {/* Name */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400">
                      Your Full Name <span className="text-[#d90429]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={authProfileData.name}
                      onChange={(e) => setAuthProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="h-14 w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 text-base font-semibold text-[#21170f] outline-none transition-all focus:border-[#d90429] focus:bg-white focus:shadow-[0_0_0_4px_rgba(217,4,41,0.06)]"
                      autoComplete="name"
                      required
                    />
                  </div>

                  {/* Mobile input if verified with email */}
                  {!authProfileData.phone && (
                    <div className="space-y-2 sm:col-span-1">
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400">
                        Mobile Number <span className="text-[#d90429]">*</span>
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={authProfileData.phone}
                        onChange={(e) => setAuthProfileData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                        className="h-14 w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 text-base font-semibold text-[#21170f] outline-none transition-all focus:border-[#d90429] focus:bg-white focus:shadow-[0_0_0_4px_rgba(217,4,41,0.06)]"
                        required
                      />
                    </div>
                  )}

                  {/* Email input if verified with phone */}
                  {!authProfileData.email && (
                    <div className="space-y-2 sm:col-span-1">
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400">
                        Email Address <span className="text-[#d90429]">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. sharma@gmail.com"
                        value={authProfileData.email}
                        onChange={(e) => setAuthProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="h-14 w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 text-base font-semibold text-[#21170f] outline-none transition-all focus:border-[#d90429] focus:bg-white focus:shadow-[0_0_0_4px_rgba(217,4,41,0.06)]"
                        required
                      />
                    </div>
                  )}

                  {/* Verified info pills */}
                  <div className="flex gap-2 sm:col-span-2">
                    {authProfileData.phone && (
                      <div className="flex flex-1 items-center gap-2 rounded-xl bg-green-50 border border-green-100 px-3 py-2 min-w-0">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500">
                          <Check className="h-3 w-3 text-white stroke-[3]" />
                        </div>
                        <span className="truncate text-xs font-black text-green-700">{authProfileData.phone}</span>
                      </div>
                    )}
                    {authProfileData.email && (
                      <div className="flex flex-1 items-center gap-2 rounded-xl bg-green-50 border border-green-100 px-3 py-2 min-w-0">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500">
                          <Check className="h-3 w-3 text-white stroke-[3]" />
                        </div>
                        <span className="truncate text-xs font-black text-green-700">{authProfileData.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Optional dates */}
                  <div className="space-y-3 sm:col-span-2">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-300">Optional — for birthday surprises 🎂</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400">Birthday</label>
                        <input
                          type="date"
                          value={authProfileData.dob}
                          onChange={(e) => setAuthProfileData(prev => ({ ...prev, dob: e.target.value }))}
                          className="h-12 w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-3 text-sm font-semibold text-[#21170f] outline-none focus:border-[#d90429] focus:bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400">Anniversary</label>
                        <input
                          type="date"
                          value={authProfileData.anniversary}
                          onChange={(e) => setAuthProfileData(prev => ({ ...prev, anniversary: e.target.value }))}
                          className="h-12 w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-3 text-sm font-semibold text-[#21170f] outline-none focus:border-[#d90429] focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Optional delivery address & other occasion */}
                  <div className="space-y-3 pt-2 border-t border-gray-100 sm:col-span-2 sm:border-t-0 sm:pt-0 sm:grid sm:grid-cols-2 sm:gap-4">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 sm:col-span-2">Optional — delivery & occasions 📍</p>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400">Delivery Address</label>
                      <textarea
                        rows="2"
                        placeholder="House/Flat No., Building, Street, Pincode"
                        value={authProfileData.address}
                        onChange={(e) => setAuthProfileData(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full resize-none rounded-xl border-2 border-gray-100 bg-gray-50 p-3 text-sm font-semibold text-[#21170f] outline-none focus:border-[#d90429] focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-1">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400">Occasion Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Graduation"
                        value={authProfileData.specialDateDescription}
                        onChange={(e) => setAuthProfileData(prev => ({ ...prev, specialDateDescription: e.target.value }))}
                        className="h-12 w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-3 text-sm font-semibold text-[#21170f] outline-none focus:border-[#d90429] focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-1">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400">Occasion Date</label>
                      <input
                        type="date"
                        value={authProfileData.specialDate}
                        onChange={(e) => setAuthProfileData(prev => ({ ...prev, specialDate: e.target.value }))}
                        className="h-12 w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-3 text-sm font-semibold text-[#21170f] outline-none focus:border-[#d90429] focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#d90429] text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-[#d90429]/30 transition-all hover:bg-[#c50323] hover:shadow-xl active:scale-[0.98] disabled:opacity-60 cursor-pointer sm:col-span-2"
                  >
                    {isLoading
                      ? <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Creating account…</span>
                      : '🎉 Create My Account'
                    }
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>
      )}



      {showCart && (
        <>
          <div className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <aside className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl sm:w-[440px]">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-xl font-black">Your Order</h2>
                <p className="text-sm text-gray-500">{totalQuantity} items selected</p>
              </div>
              <button onClick={() => setShowCart(false)} className="rounded-lg p-2 hover:bg-gray-100" aria-label="Close cart"><X className="h-6 w-6" /></button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-hide">
              {cart.length === 0 ? (
                <div className="py-16 text-center px-4">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#fff0f1] text-[#d90429]">
                    <ShoppingCart className="h-10 w-10" />
                  </div>
                  <h3 className="text-lg font-black text-[#21170f]">Your cart is empty</h3>
                  <p className="mt-1 text-xs font-semibold text-gray-500 leading-relaxed max-w-xs mx-auto">
                    Looks like you haven't added anything to your cart yet. Explore our delicious cakes & bakery treats!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCart(false);
                      setActiveView('store');
                      setTimeout(() => {
                        const el = document.getElementById('products') || document.querySelector('.products-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d90429] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#d90429]/25 hover:bg-[#c50323] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    <span>Explore Bakery Menu</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart items list */}
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.cartKey} className="flex gap-3 rounded-2xl border border-gray-100 p-3 shadow-sm bg-white">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
                        ) : (
                          <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-[#f7f2ec]"><CakeSlice className="h-7 w-7 text-[#9d8371]" /></span>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-1 font-black text-[#21170f]">{item.name}</h3>
                          {item.variantLabel && <p className="text-xs font-bold text-[#92602f]">{item.variantLabel}</p>}
                          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-500 mt-1">
                            <span>{currency}{item.price} x {item.quantity}</span>
                            {item.originalPrice > item.price && <span className="text-xs line-through">{currency}{item.originalPrice}</span>}
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.cartKey, -1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
                            <span className="w-7 text-center font-black">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.cartKey, 1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
                            <button onClick={() => removeFromCart(item.cartKey)} className="ml-auto p-2 text-red-500 hover:text-red-700 transition-colors" title="Delete item" aria-label="Remove item"><Trash2 className="h-5 w-5" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ─── TREAT YOURSELF MORE WITH ─── */}
                  {complimentaryProducts.length > 0 && (() => {
                    const cartCategories = [...new Set(cart.map(i => (i.category || '').toLowerCase()))];
                    const hasBirthday = cartCategories.some(c => c.includes('cake') || c.includes('bento') || c.includes('theme') || c.includes('cup'));
                    const hasAnniversary = cart.some(i => (i.name || '').toLowerCase().includes('wedding') || (i.category || '').toLowerCase().includes('celebration'));
                    const relevantItems = complimentaryProducts.filter(p => {
                      if (!p.occasionTags || p.occasionTags.length === 0) return true;
                      if (hasBirthday && p.occasionTags.includes('birthday')) return true;
                      if (hasAnniversary && p.occasionTags.includes('anniversary')) return true;
                      if (p.occasionTags.includes('celebration')) return true;
                      return false;
                    });
                    if (relevantItems.length === 0) return null;
                    return (
                      <div className="rounded-2xl border border-dashed border-[#e8ddd5] bg-[#fffdf9] p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2.5">
                          <Gift className="h-4 w-4 text-[#e63946]" />
                          <p className="text-xs font-black uppercase tracking-wider text-[#21170f]">Treat Yourself More With</p>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                          {relevantItems.map(item => {
                            const inCart = cart.some(c => c._id === item._id);
                            return (
                              <div key={item._id} className="flex w-32 shrink-0 flex-col items-center gap-1.5 rounded-2xl border border-[#f0e8e0] bg-white p-2.5 text-center shadow-sm">
                                <div className="h-16 w-16 overflow-hidden rounded-xl bg-[#f7f0e8]">
                                  {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <Gift className="m-auto mt-4 h-8 w-8 text-[#c9a880]" />}
                                </div>
                                <p className="line-clamp-2 text-[10px] font-black leading-tight text-[#21170f]">{item.name}</p>
                                <p className="text-xs font-black text-[#92602f]">{currency}{item.price}</p>
                                {inCart ? (
                                  <span className="flex h-7 w-full items-center justify-center gap-1 rounded-lg bg-green-50 text-[10px] font-black text-green-600">
                                    <Check className="h-3 w-3" /> Added
                                  </span>
                                ) : (
                                  <button onClick={() => addToCart(item)} className="h-7 w-full rounded-lg bg-[#21170f] text-[10px] font-black text-white hover:bg-[#3c3028] transition-colors">
                                    + Add
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Delivery banner */}
                  {deliveryCharge > 0 ? (
                    <div className="rounded-2xl bg-[#fff7e6] px-4 py-3 text-sm font-bold text-[#8a5a00]">
                      Add {currency}{freeDeliveryBalance} more to unlock free delivery
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-[#e9f8ef] px-4 py-3 text-sm font-bold text-[#0c7a35]">
                      Free delivery unlocked 🎉
                    </div>
                  )}

                  {/* + Add More Items Button before Apply Coupon */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowCart(false);
                      setActiveView('store');
                      setTimeout(() => {
                        const el = document.getElementById('products') || document.querySelector('.products-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="w-full flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#d90429]/30 bg-[#fff0f1] text-xs font-black uppercase tracking-wider text-[#d90429] hover:bg-[#d90429] hover:text-white transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    <span>+ Add More Bakery Items</span>
                  </button>

                  {/* Coupon Code Section (Commented out)
                  <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <BadgePercent className="h-5 w-5 text-[#e63946]" />
                      <p className="font-black text-[#21170f]">Apply Coupon</p>
                    </div>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between rounded-xl bg-[#e9f8ef] px-3 py-2 text-sm font-bold text-[#0c7a35]">
                        <div>
                          <span>Applied: {appliedCoupon.code}</span>
                          <span className="block text-xs font-semibold text-[#0c7a35]/80">({appliedCoupon.discountType === 'fixed' ? `${currency}${appliedCoupon.discountValue}` : `${appliedCoupon.discountValue || appliedCoupon.discountPercentage}%`} OFF)</span>
                        </div>
                        <button onClick={removeCoupon} className="text-red-500 font-bold hover:text-red-700">Remove</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          className="h-10 flex-1 rounded-xl border border-black/10 px-3 text-sm font-semibold outline-none focus:border-[#21170f]"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          className="h-10 rounded-xl bg-[#21170f] px-4 text-xs font-black text-white hover:bg-[#3c3028]"
                        >
                          Apply
                        </button>
                      </div>
                    )}

                    {publicCoupons.length > 0 && (
                      <div className="mt-3.5 space-y-2 border-t border-black/[0.04] pt-3">
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#6f6258]">Available Coupons</p>
                        <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-hide">
                          {publicCoupons.map((coupon) => {
                            const label = coupon.discountType === 'fixed' ? `${currency}${coupon.discountValue}` : `${coupon.discountValue}%`;
                            return (
                              <button
                                key={coupon._id}
                                disabled={coupon.isUsed}
                                onClick={() => applyDirectCoupon(coupon)}
                                className={`flex shrink-0 flex-col rounded-xl border p-2.5 text-left transition ${
                                  coupon.isUsed
                                    ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                    : 'border-orange-200 bg-orange-50/30 hover:border-orange-300'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 font-mono text-xs font-black text-[#21170f]">
                                  <span className="bg-orange-100/50 px-1.5 py-0.5 rounded border border-orange-200/50">{coupon.couponCode}</span>
                                  {coupon.isUsed ? (
                                    <span className="rounded bg-gray-200 px-1 py-0.5 text-[8px] font-black uppercase text-gray-500">Used</span>
                                  ) : (
                                    <span className="rounded bg-orange-700 px-1 py-0.5 text-[8px] font-black uppercase text-white">{label} OFF</span>
                                  )}
                                </div>
                                <p className="mt-1.5 text-[10px] font-bold text-[#6f6258] max-w-[140px] truncate">{coupon.name}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  */}

                  {/* Bill Details */}
                  <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e9f8ef] text-[#0c7a35]">
                        <ShoppingBag className="h-4 w-4" />
                      </span>
                      <p className="font-black text-[#21170f]">Bill details</p>
                    </div>
                    <div className="space-y-2 text-sm font-semibold text-[#6f6258]">
                      <div className="flex justify-between">
                        <span>Item total</span>
                        <span className="text-[#21170f]">{currency}{totalAmount}</span>
                      </div>
                      {cartSavings > 0 && (
                        <div className="flex justify-between text-[#0c7a35]">
                          <span>Product discount</span>
                          <span>-{currency}{cartSavings}</span>
                        </div>
                      )}
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-[#0c7a35]">
                          <span>Coupon discount ({appliedCoupon?.discountType === 'fixed' ? `${currency}${appliedCoupon?.discountValue}` : `${appliedCoupon?.discountValue || appliedCoupon?.discountPercentage}%`})</span>
                          <span>-{currency}{discountAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Delivery charge</span>
                        <span className={deliveryCharge > 0 ? 'text-[#21170f]' : 'text-[#0c7a35]'}>
                          {deliveryCharge > 0 ? `${currency}${deliveryCharge}` : 'FREE'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 border-t border-dashed pt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-[#21170f]">To pay</span>
                        <span className="text-2xl font-black text-[#21170f]">{currency}{finalAmount}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Pinned Bottom Checkout Button */}
            {cart.length > 0 && (
              <div className="border-t bg-white p-4 shadow-lg flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCart(false);
                    setActiveView('store');
                    setTimeout(() => {
                      const el = document.getElementById('products') || document.querySelector('.products-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="flex h-13 items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-[#d90429]/40 bg-[#fff0f1] px-4 font-black text-[#d90429] hover:bg-[#d90429] hover:text-white transition-all text-xs uppercase tracking-wider shrink-0 cursor-pointer shadow-sm"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>+ Add Items</span>
                </button>
                <button onClick={() => { setShowCart(false); setShowCheckout(true); }} className="flex-1 flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#0c7a35] py-4 font-black text-white shadow-lg shadow-[#0c7a35]/20 hover:bg-[#09692c] transition-all text-base cursor-pointer">
                  Checkout <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </aside>
        </>
      )}

      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setShowCheckout(false)}>
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-white sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between border-b bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-black">Place Order</h2>
                <p className="text-sm text-gray-500">Add delivery and custom cake details</p>
              </div>
              <button onClick={() => setShowCheckout(false)} className="rounded-lg p-2 hover:bg-gray-100" aria-label="Close checkout"><X className="h-6 w-6" /></button>
            </div>

            {/* Visual Progress Stepper Line (2 Steps) */}
            <div className="border-b bg-[#fffdf9] px-5 py-3.5 shrink-0">
              <div className="flex items-center justify-between max-w-sm mx-auto">
                {[
                  { num: 1, label: '1. Details & Review' },
                  { num: 2, label: '2. Payment' }
                ].map((s, index) => {
                  const isActive = checkoutStep === s.num;
                  const isCompleted = checkoutStep > s.num;

                  return (
                    <div key={s.num} className="flex-1 flex items-center">
                      <div className="flex items-center gap-2 text-left select-none">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black border-2 transition-all ${
                          isActive ? 'bg-[#d90429] border-[#d90429] text-white ring-4 ring-[#d90429]/15' :
                          isCompleted ? 'bg-green-600 border-green-600 text-white' :
                          'bg-white border-gray-200 text-gray-400'
                        }`}>
                          {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : s.num}
                        </span>
                        <span className={`text-xs font-black ${
                          isActive ? 'text-[#d90429]' : isCompleted ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {s.label}
                        </span>
                      </div>
                      {index < 1 && (
                        <div className={`h-0.5 flex-1 mx-3 rounded transition-colors ${
                          checkoutStep > s.num ? 'bg-green-600' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-5">
              {/* STEP 1: ALL-IN-ONE DETAILS & REVIEW FORM */}
              {checkoutStep === 1 && (
                <form onSubmit={handleCheckout} className="space-y-5 max-w-lg mx-auto text-left">
                  {/* Account Badge / Fast Login Notification */}
                  {savedCustomerProfile?.phone ? (
                    <div className="flex items-center justify-between gap-2 rounded-2xl bg-green-50 border border-green-200 p-3.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                          <Check className="h-4 w-4 stroke-[3]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-black uppercase text-green-700">Logged In Account</p>
                          <p className="truncate text-xs font-black text-[#21170f]">
                            {savedCustomerProfile.customerName || 'Customer'} ({savedCustomerProfile.phone})
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-amber-50/80 border border-amber-200/60 p-3.5 flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-[#92602f]">
                        Have an account or want fast checkout?
                      </p>
                      <button
                        type="button"
                        onClick={() => triggerAuthFlow()}
                        className="rounded-xl bg-[#d90429] px-3 py-1.5 text-xs font-black uppercase text-white shadow-sm hover:bg-[#c50323] cursor-pointer shrink-0"
                      >
                        Quick Login
                      </button>
                    </div>
                  )}

                  {/* Customer & Delivery Form Fields */}
                  <div className="space-y-4 rounded-2xl border border-black/[0.06] bg-[#fffdf9] p-4">
                    <span className="block text-xs font-black uppercase tracking-wider text-[#d90429] border-b border-black/5 pb-2">
                      1. Customer & Delivery Address
                    </span>
                    
                    {/* Name & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-black uppercase tracking-wider text-[#6f6258]">
                          Full Name <span className="text-[#d90429]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={orderForm.customerName}
                          onChange={(e) => updateForm('customerName', e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="h-11 w-full rounded-xl border border-black/10 bg-white px-3.5 text-xs font-semibold outline-none focus:border-[#d90429]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-black uppercase tracking-wider text-[#6f6258]">
                          Mobile Number <span className="text-[#d90429]">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={orderForm.phone}
                          onChange={(e) => updateForm('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="10-digit mobile number"
                          className="h-11 w-full rounded-xl border border-black/10 bg-white px-3.5 text-xs font-semibold outline-none focus:border-[#d90429]"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-[#6f6258]">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={orderForm.email}
                        onChange={(e) => updateForm('email', e.target.value)}
                        placeholder="you@example.com (for order updates)"
                        className="h-11 w-full rounded-xl border border-black/10 bg-white px-3.5 text-xs font-semibold outline-none focus:border-[#d90429]"
                      />
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-[#6f6258]">
                        Full Delivery Address <span className="text-[#d90429]">*</span>
                      </label>
                      <textarea
                        rows="2"
                        required
                        value={orderForm.address}
                        onChange={(e) => updateForm('address', e.target.value)}
                        placeholder="House No, Building Name, Street, Landmark, Area & Pincode"
                        className="w-full resize-none rounded-xl border border-black/10 bg-white p-3 text-xs font-semibold outline-none focus:border-[#d90429]"
                      />
                    </div>

                    {/* Delivery Date & Time Slot */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-black uppercase tracking-wider text-[#6f6258]">
                          Delivery Date <span className="text-[#d90429]">*</span>
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <input
                            type="date"
                            required
                            value={orderForm.deliveryDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => updateForm('deliveryDate', e.target.value)}
                            className="h-11 w-full rounded-xl border border-black/10 bg-white pl-9 pr-3 text-xs font-semibold outline-none focus:border-[#d90429]"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-black uppercase tracking-wider text-[#6f6258]">
                          Time Slot
                        </label>
                        <select
                          value={orderForm.deliveryTime || '12:00 PM - 03:00 PM'}
                          onChange={(e) => updateForm('deliveryTime', e.target.value)}
                          className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-xs font-semibold outline-none focus:border-[#d90429]"
                        >
                          <option value="09:00 AM - 12:00 PM">Morning (09:00 AM - 12:00 PM)</option>
                          <option value="12:00 PM - 03:00 PM">Noon (12:00 PM - 03:00 PM)</option>
                          <option value="03:00 PM - 06:00 PM">Evening (03:00 PM - 06:00 PM)</option>
                          <option value="06:00 PM - 09:00 PM">Late Evening (06:00 PM - 09:00 PM)</option>
                          <option value="09:00 PM - 12:00 AM">Midnight Surprise (09:00 PM - 12:00 AM)</option>
                        </select>
                      </div>
                    </div>

                    {/* Cake Message / Notes */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-[#6f6258]">
                        Cake Message / Special Instructions (Optional)
                      </label>
                      <input
                        type="text"
                        value={orderForm.notes}
                        onChange={(e) => updateForm('notes', e.target.value)}
                        placeholder="e.g. Message on cake: 'Happy Birthday Aman! 🎉'"
                        className="h-11 w-full rounded-xl border border-black/10 bg-white px-3.5 text-xs font-semibold outline-none focus:border-[#d90429]"
                      />
                    </div>
                  </div>

                  {/* Cart Items Summary */}
                  <div className="rounded-2xl border border-black/[0.08] bg-white p-4 space-y-3">
                    <span className="block text-xs font-black uppercase tracking-wider text-[#6f6258] border-b pb-2">
                      2. Cart Items ({totalQuantity})
                    </span>
                    <div className="space-y-2 divide-y divide-gray-100">
                      {cart.map((item) => (
                        <div key={item.cartKey} className="flex justify-between items-center pt-2 first:pt-0 text-xs font-bold text-[#6f6258]">
                          <div className="min-w-0 flex-1 pr-4">
                            <span className="block truncate text-xs font-black text-[#21170f]">{item.name}</span>
                            <span className="block text-[11px] text-gray-400">{item.variantLabel || item.weightLabel || formatWeight(item)} x {item.quantity}</span>
                          </div>
                          <span className="font-black text-xs text-[#21170f] shrink-0">{currency}{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Coupon & Points */}
                  <div className="space-y-2">
                    {/* Coupon Input (Commented out)
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Coupon Code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="h-10 flex-1 rounded-xl border border-black/10 px-3.5 text-xs font-semibold outline-none focus:border-[#d90429]"
                      />
                      {appliedCoupon ? (
                        <button type="button" onClick={removeCoupon} className="h-10 px-4 rounded-xl bg-red-50 text-red-600 border border-red-100 font-black text-xs uppercase tracking-wider">
                          Remove
                        </button>
                      ) : (
                        <button type="button" onClick={handleApplyCoupon} className="h-10 px-4 rounded-xl bg-[#21170f] text-white font-black text-xs uppercase tracking-wider hover:bg-[#3c3028]">
                          Apply
                        </button>
                      )}
                    </div>
                    */}

                    {/* Loyalty Points Redemption (Commented out)
                    {settings.loyaltyEnabled && savedCustomerProfile?.loyaltyPoints > 0 && (
                      <div className="rounded-xl border border-dashed border-[#21170f]/20 bg-[#fffdf9] p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black text-[#21170f]">Redeem Reward Points</p>
                          <p className="text-[10px] text-gray-500 font-semibold">Use {savedCustomerProfile.loyaltyPoints} points for discount.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRedeemingPoints(!redeemingPoints)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-black transition-all cursor-pointer ${
                            redeemingPoints ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-[#21170f] text-white'
                          }`}
                        >
                          {redeemingPoints ? 'Cancel' : 'Redeem'}
                        </button>
                      </div>
                    )}
                    */}
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-wider text-[#6f6258]">3. Select Payment Method</span>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <label className={`flex items-center gap-2 rounded-xl border p-3 cursor-pointer transition ${paymentMethod === 'cod' ? 'border-[#d90429] bg-[#fff0f1]' : 'border-black/5 bg-[#fffdf9]'}`}>
                        <input type="radio" name="paymentType" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-[#d90429]" />
                        <span className="text-xs font-black text-[#21170f]">Cash on Delivery</span>
                      </label>
                      {settings.upiId && (
                        <label className={`flex items-center gap-2 rounded-xl border p-3 cursor-pointer transition ${paymentMethod === 'upi_qr' ? 'border-[#d90429] bg-[#fff0f1]' : 'border-black/5 bg-[#fffdf9]'}`}>
                          <input type="radio" name="paymentType" value="upi_qr" checked={paymentMethod === 'upi_qr'} onChange={() => setPaymentMethod('upi_qr')} className="accent-[#d90429]" />
                          <span className="text-xs font-black text-[#21170f]">Scan UPI QR</span>
                        </label>
                      )}
                      {settings.razorpayEnabled && (
                        <label className={`flex items-center gap-2 rounded-xl border p-3 cursor-pointer transition ${paymentMethod === 'online' ? 'border-[#d90429] bg-[#fff0f1]' : 'border-black/5 bg-[#fffdf9]'}`}>
                          <input type="radio" name="paymentType" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="accent-[#d90429]" />
                          <span className="text-xs font-black text-[#21170f]">Pay Online</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Final Total Box */}
                  <div className="rounded-2xl border border-black/[0.06] bg-gray-50 p-4 space-y-2 text-xs font-bold text-[#6f6258]">
                    <div className="flex justify-between">
                      <span>Basket subtotal</span>
                      <span className="text-[#21170f]">{currency}{totalAmount}</span>
                    </div>
                    {cartSavings > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>Offers saved</span>
                        <span>-{currency}{cartSavings}</span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>Coupon ({appliedCoupon?.code})</span>
                        <span>-{currency}{discountAmount}</span>
                      </div>
                    )}
                    {discountFromPoints > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>Points redeem</span>
                        <span>-{currency}{discountFromPoints}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Delivery charges</span>
                      <span className={deliveryCharge > 0 ? 'text-[#21170f]' : 'text-green-700 font-black'}>
                        {deliveryCharge > 0 ? `${currency}${deliveryCharge}` : 'FREE'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-black text-[#21170f] border-t border-dashed pt-2.5">
                      <span>Total Amount Payable</span>
                      <span className="text-[#d90429] text-base font-black">{currency}{finalAmount}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 h-13 rounded-2xl bg-[#d90429] py-4 font-black text-sm uppercase tracking-wider text-white hover:bg-[#c50323] transition-all shadow-lg shadow-[#d90429]/25 cursor-pointer"
                  >
                    <Check className="h-4.5 w-4.5 stroke-[3]" />
                    {isLoading ? 'Processing...' : (
                      paymentMethod === 'upi_qr' ? `Proceed to Scan UPI QR (${currency}${finalAmount})` :
                      paymentMethod === 'online' ? `Pay ${currency}${finalAmount} Online` :
                      `Place COD Order (${currency}${finalAmount}) 🎉`
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {customCakeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setCustomCakeProduct(null)}>
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-scaleUp" onClick={(e) => e.stopPropagation()}>
            <div className="border-b px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#21170f]">Customize Your Cake</h3>
                <p className="text-xs text-gray-500">{customCakeProduct.name}</p>
              </div>
              <button onClick={() => setCustomCakeProduct(null)} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close custom builder"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {getProductVariants(customCakeProduct).length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-[#6f6258]">Choose Weight / Size</span>
                  <div className="grid grid-cols-2 gap-2">
                    {getProductVariants(customCakeProduct).map(v => (
                      <button
                        key={v._id}
                        type="button"
                        onClick={() => setCustomCakeForm(prev => ({ ...prev, variant: v }))}
                        className={`rounded-xl border p-2.5 text-xs font-black transition ${
                          customCakeForm.variant?._id === v._id
                            ? 'border-[#e63946] bg-[#fff4f4] text-[#e63946]'
                            : 'border-black/5 bg-[#fffdf9] text-[#21170f]'
                        }`}
                      >
                        {v.label || `${v.weight} ${v.weightUnit}`} - {currency}{v.price}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-[#6f6258]">Cake Flavour</label>
                <select
                  value={customCakeForm.flavour}
                  onChange={(e) => setCustomCakeForm(prev => ({ ...prev, flavour: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-semibold outline-none focus:border-[#21170f]"
                >
                  {['Chocolate', 'Vanilla', 'Butterscotch', 'Pineapple', 'Red Velvet', 'Black Forest', 'Strawberry', 'Mango'].map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-[#6f6258]">Cake Shape</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Round', 'Heart', 'Square'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCustomCakeForm(prev => ({ ...prev, shape: s }))}
                      className={`h-10 rounded-xl border text-xs font-bold transition ${
                        customCakeForm.shape === s
                          ? 'border-[#e63946] bg-[#fff4f4] text-[#e63946]'
                          : 'border-black/5 bg-[#fffdf9] text-gray-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customCakeForm.eggless}
                  onChange={(e) => setCustomCakeForm(prev => ({ ...prev, eggless: e.target.checked }))}
                  className="h-4.5 w-4.5 rounded border-gray-300 accent-[#e63946]"
                />
                <span className="text-xs font-black text-[#21170f]">Make it 100% Eggless (Vegetarian)</span>
              </label>

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-[#6f6258]">Message on Cake</label>
                <input
                  type="text"
                  placeholder="e.g. Happy Birthday Rahul!"
                  value={customCakeForm.message}
                  onChange={(e) => setCustomCakeForm(prev => ({ ...prev, message: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-semibold outline-none focus:border-[#21170f]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-[#6f6258]">Reference Design Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReferenceImageChange}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#fff4f4] file:text-[#e63946] hover:file:bg-[#ffebeb]"
                />
                {customCakeForm.referenceImage && (
                  <div className="relative mt-2 h-20 w-20 overflow-hidden rounded-xl border border-black/5">
                    <img src={customCakeForm.referenceImage} alt="Reference preview" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setCustomCakeForm(prev => ({ ...prev, referenceImage: '' }))} className="absolute right-0.5 top-0.5 rounded-full bg-red-500 p-0.5 text-white shadow"><X className="h-3 w-3" /></button>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t p-4 bg-gray-50">
              <button
                type="button"
                onClick={() => {
                  const variant = customCakeForm.variant || null;
                  const itemLabel = [
                    variant?.label || [customCakeProduct.weight, customCakeProduct.weightUnit].filter(Boolean).join(' ').trim(),
                    customCakeForm.flavour,
                    customCakeForm.shape,
                    customCakeForm.eggless ? 'Eggless' : ''
                  ].filter(Boolean).join(' | ');

                  setCart(prev => [
                    ...prev,
                    {
                      ...customCakeProduct,
                      cartKey: `${customCakeProduct._id}-custom-${Date.now()}`,
                      productId: customCakeProduct._id,
                      variantId: variant?._id,
                      variantLabel: itemLabel,
                      price: variant?.price ?? customCakeProduct.price,
                      originalPrice: variant?.originalPrice ?? customCakeProduct.originalPrice,
                      weight: variant?.weight || customCakeProduct.weight,
                      weightUnit: variant?.weightUnit || customCakeProduct.weightUnit,
                      image: getDisplayImage(customCakeProduct),
                      quantity: 1,
                      isCustomCake: true,
                      cakeFlavour: customCakeForm.flavour,
                      cakeShape: customCakeForm.shape,
                      cakeMessage: customCakeForm.message,
                      cakeEggless: customCakeForm.eggless,
                      cakeReferenceImage: customCakeForm.referenceImage
                    }
                  ]);
                  toast.success('Customized Cake added to Cart! 🎂');
                  setCustomCakeProduct(null);
                }}
                className="w-full h-12 rounded-xl bg-[#e63946] text-white font-black text-sm hover:bg-[#c5303c] shadow-lg shadow-[#e63946]/10"
              >
                Add Cake to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowUpiModal(false)}>
          <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl p-5 text-center space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black text-[#21170f]">Scan & Pay via UPI</h3>
            <p className="text-xs text-gray-500">Scan this QR Code from any UPI App (Google Pay, PhonePe, Paytm, BHIM) to pay instantly.</p>
            
            <div className="mx-auto flex h-48 w-48 items-center justify-center border border-black/5 rounded-2xl bg-gray-50 p-2 shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.upiName || settings.bakeryName || 'Sweet Bakery')}&am=${finalAmount}&tn=Order%20Payment`
                )}`}
                alt="UPI Payment QR Code"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400">Total Payable Amount</p>
              <p className="text-2xl font-black text-[#0c7a35]">{currency}{finalAmount}</p>
              <p className="text-[10px] text-gray-500 font-semibold">UPI ID: {settings.upiId}</p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={async () => {
                  await submitFinalOrder({
                    paymentMethod: 'upi',
                    paymentStatus: 'unpaid',
                    amountPaid: 0
                  });
                }}
                className="h-12 w-full rounded-xl bg-[#0c7a35] text-white font-black text-sm hover:bg-[#09692c]"
              >
                I have paid, place my order
              </button>
              <button
                type="button"
                onClick={() => setShowUpiModal(false)}
                className="h-12 w-full rounded-xl border border-gray-200 bg-white text-gray-700 font-black text-sm hover:bg-gray-50"
              >
                Cancel / Change Method
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="relative flex items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#92602f]/10 border-t-[#92602f]" />
            <div className="absolute h-10 w-10 animate-[spin_1.5s_linear_infinite_reverse] rounded-full border-4 border-transparent border-t-[#e63946]" />
            <CakeSlice className="absolute h-5 w-5 animate-pulse text-[#21170f]" />
          </div>
          <span className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-[#21170f]">Baking sweet details...</span>
        </div>
      )}

      {/* 🎁 Premium PWA Install Banner */}
      <AnimatePresence>
        {showPwaBanner && deferredInstallPrompt && !isStandaloneApp && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-[90] px-3 pb-safe-area-inset-bottom"
            style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
          >
            <div
              className="mx-auto max-w-lg overflow-hidden rounded-3xl shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #21170f 0%, #3d2010 40%, #5C3A21 100%)',
                border: '1px solid rgba(255,214,165,0.18)'
              }}
            >
              {/* Decorative top shimmer */}
              <div
                className="h-px w-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,214,165,0.5), transparent)' }}
              />
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Icon */}
                <motion.div
                  animate={{ rotate: [0, -8, 8, -4, 0] }}
                  transition={{ delay: 0.5, duration: 0.6, ease: 'easeInOut' }}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#ffd6a5]/15 text-[#ffd6a5]"
                  style={{ border: '1px solid rgba(255,214,165,0.2)' }}
                >
                  <CakeSlice className="h-7 w-7" />
                </motion.div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#e63946] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">🎁 Offer</span>
                  </div>
                  <p className="mt-1 text-sm font-black text-white leading-snug">
                    Order Fast & Save — Install Our App!
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-[#ffd6a5]/70 leading-snug">
                    Instant ordering, exclusive deals & live order tracking
                  </p>
                </div>

                {/* Close */}
                <button
                  onClick={() => setShowPwaBanner(false)}
                  className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Dismiss install banner"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 px-5 pb-4">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={async () => {
                    setShowPwaBanner(false);
                    await installStoreApp();
                  }}
                  className="flex flex-1 h-11 items-center justify-center gap-2 rounded-2xl font-black text-sm text-[#21170f] shadow-md"
                  style={{ background: 'linear-gradient(135deg, #ffd6a5, #ffb347)' }}
                >
                  <Smartphone className="h-4 w-4" />
                  Install App
                </motion.button>
                <button
                  onClick={() => setShowPwaBanner(false)}
                  className="flex h-11 items-center justify-center rounded-2xl border border-white/10 px-4 text-xs font-bold text-white/60 hover:text-white transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── TRACK ORDER LOOKUP MODAL ─── */}
      {showTrackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowTrackModal(false)}>
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b bg-gray-50/50 px-6 py-4">
              <div>
                <h3 className="text-lg font-black text-[#21170f]">Track Order</h3>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Enter details to see live delivery status</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTrackModal(false)}
                className="rounded-xl p-2 hover:bg-gray-100 transition-colors"
                aria-label="Close track order modal"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleTrackOrderLookup} className="p-6 space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-[#6f6258]">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength="10"
                    placeholder="Enter 10-digit mobile number"
                    value={trackPhone}
                    onChange={(e) => setTrackPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="h-12 w-full rounded-xl border border-black/10 bg-white pl-12 pr-4 text-base font-semibold text-[#21170f] shadow-sm outline-none focus:border-[#d90429] focus:ring-4 focus:ring-[#d90429]/5"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-[#6f6258]">Order ID</label>
                <input
                  type="text"
                  required
                  placeholder="Enter Order ID (e.g. 54c2b97e)"
                  value={trackOrderId}
                  onChange={(e) => setTrackOrderId(e.target.value)}
                  className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base font-semibold text-[#21170f] shadow-sm outline-none focus:border-[#d90429] focus:ring-4 focus:ring-[#d90429]/5"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d90429] py-3.5 font-black text-white hover:bg-[#c50323] transition-all shadow-md shadow-[#d90429]/20 cursor-pointer h-12 text-xs uppercase tracking-wider mt-2"
              >
                {isLoading ? 'Searching...' : 'Track Order Status'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── FULL SCREEN SEARCH MODAL OVERLAY ─── */}
      <AnimatePresence>
        {showSearchModal && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-50 flex flex-col bg-white"
          >
            {/* Search Header Bar */}
            <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
              <button
                type="button"
                onClick={() => { setShowSearchModal(false); setSearchTerm(''); }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-800 hover:bg-gray-100 transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5 stroke-[2.5]" />
              </button>

              <div className="flex flex-1 items-center gap-2 rounded-xl bg-gray-100/90 px-3.5 h-11 border border-gray-200/60 focus-within:border-gray-400 focus-within:bg-white transition-all">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search cakes, desserts, snacks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="p-1 text-gray-400 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <Search className="h-4 w-4 text-gray-500 shrink-0" />
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {searchTerm.trim() ? (() => {
                const q = searchTerm.trim().toLowerCase();

                // ── Collect matching suggestions (categories, subcategories, occasion tags)
                const suggestions = [];
                const seen = new Set();

                displayCategoryTree.forEach(cat => {
                  if (cat.name.toLowerCase().includes(q) && !seen.has(cat.name.toLowerCase())) {
                    seen.add(cat.name.toLowerCase());
                    suggestions.push({
                      label: cat.name,
                      type: 'category',
                      cat: cat.name,
                      sub: null
                    });
                  }
                  (cat.subcategories || []).forEach(sub => {
                    if (sub.name.toLowerCase().includes(q) && !seen.has(sub.name.toLowerCase())) {
                      seen.add(sub.name.toLowerCase());
                      suggestions.push({
                        label: sub.name,
                        type: 'subcategory',
                        cat: cat.name,
                        sub: sub.name
                      });
                    }
                  });
                });

                // Also check tags / flavors
                products.forEach(p => {
                  (p.occasionTags || []).forEach(tag => {
                    if (tag.toLowerCase().includes(q) && !seen.has(tag.toLowerCase())) {
                      seen.add(tag.toLowerCase());
                      suggestions.push({
                        label: tag,
                        type: 'tag',
                        searchTerm: tag
                      });
                    }
                  });
                  (p.flavours || []).forEach(flav => {
                    if (flav.toLowerCase().includes(q) && !seen.has(flav.toLowerCase())) {
                      seen.add(flav.toLowerCase());
                      suggestions.push({
                        label: `${flav} Cakes`,
                        type: 'tag',
                        searchTerm: flav
                      });
                    }
                  });
                });

                // ── Product Results
                const results = products.filter(p =>
                  `${p.name} ${p.description || ''} ${p.category || ''} ${(p.flavours || []).join(' ')} ${(p.occasionTags || []).join(' ')}`.toLowerCase().includes(q)
                );

                return (
                  <div className="pb-24">
                    {/* Search Suggestions Section */}
                    {suggestions.length > 0 && (
                      <div className="px-5 pt-4 pb-2">
                        <h3 className="text-sm font-black text-gray-900 tracking-tight mb-2">Search Suggestions</h3>
                        <div className="divide-y divide-gray-100">
                          {suggestions.slice(0, 8).map((s, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                if (s.type === 'category' || s.type === 'subcategory') {
                                  setFilterCategory(s.cat || 'all');
                                  setSubCategoryFilter(s.sub || 'all');
                                  setSubSubCategoryFilter('all');
                                  setSearchTerm('');
                                  setShowSearchModal(false);
                                  setActiveView('store');
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                } else {
                                  setSearchTerm(s.searchTerm || s.label);
                                }
                              }}
                              className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer group"
                            >
                              <span className="text-sm font-bold text-gray-800 group-hover:text-[#d90429] transition-colors">
                                {s.label}
                              </span>
                              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#d90429] group-hover:translate-x-0.5 transition-all shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Search Results Section */}
                    <div className="px-4 pt-4">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="text-sm font-black text-gray-900 tracking-tight">
                          Search Results
                        </h3>
                        <span className="text-xs font-semibold text-gray-400">
                          {results.length} item{results.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {results.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                          {results.map(product => (
                            <div
                              key={product._id}
                              onClick={() => {
                                openProduct(product);
                                setShowSearchModal(false);
                                setSearchTerm('');
                              }}
                              className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm hover:shadow-md transition-all"
                            >
                              <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f8f3ed]">
                                {getDisplayImage(product) ? (
                                  <img
                                    src={getDisplayImage(product)}
                                    alt={product.name}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <CakeSlice className="h-8 w-8 text-gray-300" />
                                  </div>
                                )}
                                {getDiscount(product.price, product.originalPrice) > 0 && (
                                  <span className="absolute bottom-1.5 left-1.5 rounded-full bg-[#d90429] px-1.5 py-0.5 text-[9px] font-black text-white">
                                    {getDiscount(product.price, product.originalPrice)}% OFF
                                  </span>
                                )}
                              </div>
                              <h4 className="mt-2 line-clamp-2 text-xs font-bold text-[#21170f] leading-snug">
                                {product.name}
                              </h4>
                              <p className="text-xs font-black text-[#d90429] mt-0.5">
                                {currency}{product.price}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-16 text-center">
                          <CakeSlice className="mx-auto h-12 w-12 text-gray-200 mb-3" />
                          <p className="font-bold text-sm text-gray-600 mb-1">No products found</p>
                          <p className="text-xs text-gray-400">Try searching for chocolate, vanilla, bento, cupcakes...</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })() : (
                /* When search input is empty: show Popular Categories & Bestselling Products */
                <div className="pb-24">
                  {/* Top Popular Categories Suggestions */}
                  <div className="px-5 pt-4 pb-2">
                    <h3 className="text-sm font-black text-gray-900 tracking-tight mb-2">Search Suggestions</h3>
                    <div className="divide-y divide-gray-100">
                      {displayCategoryTree.slice(0, 6).map((cat, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setFilterCategory(cat.name);
                            setSubCategoryFilter('all');
                            setSubSubCategoryFilter('all');
                            setSearchTerm('');
                            setShowSearchModal(false);
                            setActiveView('store');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer group"
                        >
                          <span className="text-sm font-bold text-gray-800 group-hover:text-[#d90429] transition-colors">
                            {cat.name}
                          </span>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#d90429] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bestsellers Section */}
                  <div className="px-4 pt-4">
                    <h3 className="text-sm font-black text-gray-900 tracking-tight mb-3 px-1">
                      🔥 Bestsellers & Popular
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {[...products]
                        .sort((a, b) => {
                          const sa = (a.isBestseller ? 4 : 0) + (a.isPopular ? 2 : 0) + (a.sales || 0) * 0.01;
                          const sb = (b.isBestseller ? 4 : 0) + (b.isPopular ? 2 : 0) + (b.sales || 0) * 0.01;
                          return sb - sa;
                        })
                        .slice(0, 16)
                        .map(product => (
                          <div
                            key={product._id}
                            onClick={() => {
                              openProduct(product);
                              setShowSearchModal(false);
                            }}
                            className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f8f3ed]">
                              {getDisplayImage(product) ? (
                                <img
                                  src={getDisplayImage(product)}
                                  alt={product.name}
                                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <CakeSlice className="h-8 w-8 text-gray-300" />
                                </div>
                              )}
                              {(product.isBestseller || product.isPopular) && (
                                <span className="absolute top-1.5 left-1.5 rounded-full bg-[#d90429] px-1.5 py-0.5 text-[9px] font-black text-white">
                                  ⭐ Popular
                                </span>
                              )}
                              {getDiscount(product.price, product.originalPrice) > 0 && (
                                <span className="absolute bottom-1.5 left-1.5 rounded-full bg-[#d90429] px-1.5 py-0.5 text-[9px] font-black text-white">
                                  {getDiscount(product.price, product.originalPrice)}% OFF
                                </span>
                              )}
                            </div>
                            <h4 className="mt-2 line-clamp-2 text-xs font-bold text-[#21170f] leading-snug">
                              {product.name}
                            </h4>
                            <p className="text-xs font-black text-[#d90429] mt-0.5">
                              {currency}{product.price}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── LOCATION SELECTOR MODAL ─── */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-black/10">
              <div className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-[#e63946]" />
                <h3 className="text-lg font-black text-[#21170f]">Select Delivery Location</h3>
              </div>
              <button onClick={() => setShowLocationModal(false)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Auto Detect Button */}
            <button
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#e63946] bg-[#fff4f4] py-3 text-sm font-black text-[#e63946] transition-all hover:bg-[#e63946] hover:text-white"
            >
              <Navigation className={`h-4 w-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
              {isDetectingLocation ? 'Detecting Location...' : 'Detect My Location'}
            </button>

            {/* Pincode Search */}
            <div className="mt-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Enter Pincode</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 302019"
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                  className="h-11 flex-1 rounded-xl border border-black/15 px-3 text-sm font-bold outline-none focus:border-[#e63946]"
                />
                <button
                  onClick={() => {
                    if (pincodeInput.length === 6) {
                      const locStr = `Pincode ${pincodeInput}`;
                      setSelectedLocation(locStr);
                      localStorage.setItem('user_location', locStr);
                      setShowLocationModal(false);
                      toast.success(`Location set to Pincode ${pincodeInput}`);
                    } else {
                      toast.error('Please enter a valid 6-digit pincode');
                    }
                  }}
                  className="rounded-xl bg-[#21170f] px-4 text-xs font-black text-white hover:bg-[#38281b]"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Saved Addresses List (Direct selection instead of arbitrary locality suggestions) */}
            <div className="mt-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Saved Address</p>
              {savedCustomerProfile ? (
                (() => {
                  const addrs = getCustomerAddresses();
                  if (addrs.length === 0) {
                    return <p className="text-xs text-gray-400">No saved addresses found in your profile.</p>;
                  }
                  return (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {addrs.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedLocation(item.address);
                            localStorage.setItem('user_location', item.address);
                            setShowLocationModal(false);
                            toast.success('Delivery location set to saved address!');
                          }}
                          className="w-full flex flex-col rounded-xl border border-black/10 p-2.5 text-left text-xs font-bold text-[#21170f] hover:border-[#e63946] hover:bg-[#fff4f4] transition-all"
                        >
                          <span className="text-[10px] font-black uppercase text-[#d90429] mb-0.5">{item.type}</span>
                          <span className="text-gray-600 font-semibold truncate w-full">{item.address}</span>
                        </button>
                      ))}
                    </div>
                  );
                })()
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-xs font-bold text-gray-500">Log in to select from saved addresses</p>
                  <button
                    onClick={() => {
                      setShowLocationModal(false);
                      triggerAuthFlow();
                    }}
                    className="mt-2 text-xs font-black text-[#d90429] hover:underline"
                  >
                    Log In / Verify with OTP
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}



      {/* ─── MOBILE CATEGORY SIDEBAR DRAWER (Creme Castle style) ─── */}
      {showMobileCategoriesModal && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 transition-opacity animate-in fade-in"
            onClick={() => setShowMobileCategoriesModal(false)}
          />

          {/* Sidebar panel */}
          <div className="relative z-10 w-72 max-w-[88vw] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-250">

            {/* ── Header: Hamburger icon | Logo + Name | Cart icon ── */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 shrink-0">
              {/* Hamburger (close button) */}
              <button
                onClick={() => setShowMobileCategoriesModal(false)}
                className="flex items-center justify-center h-9 w-9 text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                <Menu className="h-6 w-6 stroke-[2]" />
              </button>

              {/* Center: Logo + Name */}
              <button
                onClick={() => { setActiveView('store'); setFilterCategory('all'); setSubCategoryFilter('all'); setSearchTerm(''); setShowMobileCategoriesModal(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                {settings.logo ? (
                  <img src={settings.logo} alt={settings.bakeryName} className="h-7 w-7 rounded-lg border border-gray-100 object-contain" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d90429] text-white">
                    <CakeSlice className="h-4 w-4" />
                  </span>
                )}
                <span className="text-base font-black tracking-tight text-[#d90429] leading-tight">
                  {settings.bakeryName || 'Bakery'}
                </span>
              </button>

              {/* Cart icon */}
              <button
                onClick={() => { setShowMobileCategoriesModal(false); setShowCart(true); }}
                className="relative flex items-center justify-center h-9 w-9 text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                <ShoppingBag className="h-5.5 w-5.5 stroke-[2]" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#d90429] px-1 text-[9px] font-black text-white">
                    {totalQuantity}
                  </span>
                )}
              </button>
            </div>

            {/* ── Category List ── */}
            <div className="flex-1 overflow-y-auto">
              {displayCategoryTree.map((main) => {
                const isExpanded = expandedMobileCategories.includes(main._id);
                const isMainSelected = filterCategory.toLowerCase() === main.name.toLowerCase();
                const hasSub = main.subcategories && main.subcategories.length > 0;

                return (
                  <div key={main._id}>
                    {/* Main category row */}
                    <div className={`flex items-center border-b border-gray-100 ${isMainSelected ? 'bg-red-50' : ''}`}>
                      {/* Category name — tap to filter */}
                      <button
                        onClick={() => {
                          if (!hasSub) {
                            setFilterCategory(main.name);
                            setSubCategoryFilter('all');
                            setSubSubCategoryFilter('all');
                            setShowMobileCategoriesModal(false);
                          } else {
                            // Toggle expand when has subcategories
                            setExpandedMobileCategories(prev =>
                              prev.includes(main._id)
                                ? prev.filter(id => id !== main._id)
                                : [...prev, main._id]
                            );
                          }
                        }}
                        className="flex-1 flex items-center justify-between px-5 py-4 text-left cursor-pointer"
                      >
                        <span className={`text-sm font-bold ${isMainSelected ? 'text-[#d90429]' : 'text-[#333]'}`}>
                          {main.name}
                        </span>
                        {hasSub && (
                          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                        )}
                      </button>
                    </div>

                    {/* Subcategories — expand on click */}
                    {hasSub && isExpanded && (
                      <div className="bg-gray-50/70 border-b border-gray-100 animate-in fade-in slide-in-from-top-1 duration-150">
                        {main.subcategories.map(sub => {
                          const isSubActive = subCategoryFilter.toLowerCase() === sub.name.toLowerCase();
                          return (
                            <button
                              key={sub._id}
                              onClick={() => {
                                setFilterCategory(main.name);
                                setSubCategoryFilter(sub.name);
                                setSubSubCategoryFilter('all');
                                setShowMobileCategoriesModal(false);
                              }}
                              className={`w-full flex items-center justify-between pl-8 pr-5 py-3 text-left border-b border-gray-100/70 last:border-0 cursor-pointer transition-colors ${
                                isSubActive ? 'bg-red-50 text-[#d90429]' : 'text-gray-600 hover:bg-white hover:text-[#d90429]'
                              }`}
                            >
                              <span className={`text-sm ${isSubActive ? 'font-black text-[#d90429]' : 'font-semibold'}`}>
                                {sub.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}


      {/* 3-Level Category Manager Modal */}
      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        onCategoryUpdated={fetchStoreData}
      />

      {/* ─── MOBILE BOTTOM FLOATING NAVIGATION BAR DOCK (md:hidden) ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-4 py-2 flex items-center justify-around shadow-2xl md:hidden">
        {/* 1. Store / Home */}
        <button
          onClick={() => {
            setActiveView('store');
            setFilterCategory('all');
            setSubCategoryFilter('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            activeView === 'store' && filterCategory === 'all' ? 'text-[#d90429]' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Home className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] font-black tracking-tight">Home</span>
        </button>

        {/* 2. Categories Drawer Button */}
        <button
          onClick={() => setShowMobileCategoriesModal(true)}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            showMobileCategoriesModal ? 'text-[#d90429]' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] font-black tracking-tight">Categories</span>
        </button>

        {/* 3. Search Modal Trigger Button */}
        <button
          onClick={() => setShowSearchModal(true)}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            showSearchModal ? 'text-[#d90429]' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Search className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] font-black tracking-tight">Search</span>
        </button>

        {/* 4. Cart Button */}
        <button
          onClick={() => setShowCart(true)}
          className="relative flex flex-col items-center gap-0.5 cursor-pointer text-gray-500 hover:text-gray-900"
        >
          <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
          {totalQuantity > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#d90429] text-white text-[9px] font-extrabold flex items-center justify-center">
              {totalQuantity}
            </span>
          )}
          <span className="text-[10px] font-black tracking-tight">Cart</span>
        </button>

        {/* 5. Account / Orders */}
        <button
          onClick={() => {
            if (savedCustomerProfile?.phone) {
              setShowProfilePreviewModal(true);
            } else {
              triggerAuthFlow();
            }
          }}
          className="flex flex-col items-center gap-0.5 cursor-pointer text-gray-500 hover:text-gray-900"
        >
          <User className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] font-black tracking-tight">Account</span>
        </button>
      </div>

      {/* Store Addon Items Manager Modal */}
      <AddonManager
        isOpen={showAddonManager}
        onClose={() => setShowAddonManager(false)}
      />
    </div>
  );
};

export default Store;
