import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storePath = path.join(__dirname, 'src', 'pages', 'Store.jsx');
let content = fs.readFileSync(storePath, 'utf8');

// 1. Update Recently Viewed state & tracking logic (15 days auto-deletion)
const oldRVState = `  const [recentlyViewedIds, setRecentlyViewedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('bakeryStoreRecentlyViewed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const trackRecentlyViewed = (product) => {
    if (!product?._id) return;
    setRecentlyViewedIds(prev => {
      const filtered = prev.filter(id => id !== product._id);
      const updated = [product._id, ...filtered].slice(0, 12);
      try {
        localStorage.setItem('bakeryStoreRecentlyViewed', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewedIds([]);
    try {
      localStorage.removeItem('bakeryStoreRecentlyViewed');
    } catch {}
  };

  const recentlyViewedProducts = useMemo(() => {
    return recentlyViewedIds
      .map(id => products.find(p => p._id === id))
      .filter(Boolean);
  }, [recentlyViewedIds, products]);`;

const newRVState = `  const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

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
  }, [recentlyViewedIds, products]);`;

if (content.includes(oldRVState)) {
  content = content.replace(oldRVState, newRVState);
  console.log('Updated Recently Viewed state with 15-day auto deletion!');
} else {
  console.error('Could not find old RV state string');
}

// 2. Remove Clear History button from renderRecentlyViewedSection
const clearBtnSnippet = `<button
            onClick={clearRecentlyViewed}
            className="text-xs font-black uppercase tracking-wider text-gray-400 hover:text-[#d90429] transition-colors cursor-pointer"
          >
            Clear History
          </button>`;

if (content.includes(clearBtnSnippet)) {
  content = content.replace(clearBtnSnippet, '');
  console.log('Removed Clear History button!');
} else {
  console.log('Clear History button not found or already removed.');
}

// 3. Fix Navbar Header
const headerStartStr = '<header className="bg-[#d90429] text-white">';
const headerEndStr = '</header>';

const hStart = content.indexOf(headerStartStr);
const hEnd = content.indexOf(headerEndStr, hStart);

if (hStart !== -1 && hEnd !== -1) {
  const oldHeader = content.substring(hStart, hEnd + headerEndStr.length);
  const newHeader = `<header className="bg-[#d90429] text-white overflow-hidden shadow-md">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-1.5 sm:gap-4 px-2.5 sm:px-8 py-2.5 sm:py-3.5">
            {/* Left Side: Logo & Brand */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <button
                onClick={() => { setActiveView('store'); setFilterCategory('all'); setSubCategoryFilter('all'); setSearchTerm(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center gap-1.5 sm:gap-2 text-left cursor-pointer"
                aria-label="Go to home"
              >
                {settings.logo ? (
                  <img src={settings.logo} alt={settings.bakeryName} className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl border border-white/30 bg-white object-contain p-0.5 shadow-md" />
                ) : (
                  <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white text-[#d90429] font-black shadow-md">
                    <CakeSlice className="h-4.5 w-4.5 sm:h-6 sm:w-6" />
                  </span>
                )}
                <span className="text-sm sm:text-xl md:text-2xl font-black italic tracking-tight text-white drop-shadow-sm truncate max-w-[100px] xs:max-w-[140px] sm:max-w-none">
                  {settings.bakeryName || 'Oneness Bakery'}
                </span>
              </button>
            </div>

            {/* Middle: Delivery Location Button */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-black/15 hover:bg-black/25 px-2.5 sm:px-3.5 py-1 text-xs sm:text-sm font-extrabold text-white transition-all min-w-0 max-w-[115px] xs:max-w-[160px] sm:max-w-[220px] md:max-w-[260px] cursor-pointer border border-white/10"
              title="Change Delivery Location"
            >
              <MapPin className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 shrink-0 text-[#ffb703]" />
              <span className="truncate text-left flex-1">{selectedLocation}</span>
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-80" />
            </button>

            {/* Desktop Search Bar */}
            <div className="relative flex-1 max-w-md lg:max-w-lg hidden md:block mx-3 lg:mx-5">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search For Cakes, Occasion, Flavour And More..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-full border-0 bg-white pl-12 pr-4 text-sm font-bold text-[#1f1b16] shadow-lg outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            {/* Right Actions: Veg Toggle + Desktop Icons */}
            <div className="flex items-center gap-2 sm:gap-6 lg:gap-8 shrink-0">
              {/* Veg Only Toggle Switch */}
              <div
                onClick={() => setEgglessFilter(prev => !prev)}
                className="flex flex-col items-center justify-center cursor-pointer select-none group shrink-0"
                title="Toggle Pure Veg / Eggless items"
              >
                <div className="flex items-center gap-1">
                  <span className="flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-md border border-green-300 bg-white p-0.5 shadow-sm">
                    <span className="h-1.2 w-1.2 sm:h-1.5 sm:w-1.5 rounded-full bg-green-600" />
                  </span>

                  <div
                    className={\`relative h-4.5 w-8 sm:h-5 sm:w-10 rounded-full p-0.5 transition-colors duration-200 ease-in-out \${
                      egglessFilter ? 'bg-green-500 shadow-inner' : 'bg-black/30 border border-white/20'
                    }\`}
                  >
                    <div
                      className={\`h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center \${
                        egglessFilter ? 'translate-x-3.5 sm:translate-x-5' : 'translate-x-0'
                      }\`}
                    >
                      {egglessFilter && <Check className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-green-600 stroke-[3]" />}
                    </div>
                  </div>
                </div>

                <span className="text-[8px] sm:text-[10px] font-black tracking-tight uppercase text-white group-hover:text-yellow-300 transition-colors mt-0.5 whitespace-nowrap">
                  Veg Only
                </span>
              </div>

              {/* Track Order Icon (Desktop) */}
              <button
                onClick={openOrdersHistory}
                className="hidden sm:flex flex-col items-center gap-1 text-white hover:text-yellow-300 transition-all cursor-pointer group"
                title="Track Order"
              >
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.2] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-extrabold tracking-tight uppercase">Track Order</span>
              </button>

              {/* Cart Icon (Desktop) */}
              <button
                onClick={() => setShowCart(true)}
                className="hidden sm:flex relative flex-col items-center gap-1 text-white hover:text-yellow-300 transition-all cursor-pointer group"
                title="Cart"
              >
                <div className="relative">
                  <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.2] group-hover:scale-110 transition-transform" />
                  {totalQuantity > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#ffb703] px-1 text-[9px] font-black text-black shadow-md border-2 border-[#d90429]">
                      {totalQuantity}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-extrabold tracking-tight uppercase">Cart</span>
              </button>

              {/* Login/Profile Icon (Desktop) */}
              <button
                onClick={() => {
                  if (savedCustomerProfile?.phone) {
                    setShowCustomerProfile(true);
                  } else {
                    triggerAuthFlow();
                  }
                }}
                className="hidden sm:flex flex-col items-center gap-1 text-white hover:text-yellow-300 transition-all cursor-pointer group"
                title="Account"
              >
                <User className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.2] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-extrabold tracking-tight uppercase">
                  {savedCustomerProfile?.name?.split(' ')[0] || 'Login'}
                </span>
              </button>
            </div>
          </div>
        </header>`;

  content = content.replace(oldHeader, newHeader);
  console.log('Fixed Header Navbar layout!');
} else {
  console.error('Could not find header in Store.jsx');
}

fs.writeFileSync(storePath, content, 'utf8');
console.log('Store.jsx successfully updated!');
