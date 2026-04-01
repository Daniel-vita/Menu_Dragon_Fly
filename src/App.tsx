/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Search, 
  X, 
  Instagram, 
  Facebook, 
  Phone,
  AlertCircle
} from 'lucide-react';
import { MENU_DATA, Category, Product, ProductAddon, ProductAddonGroup, PIADINA_ADDON_GROUPS, SERVICE_CHARGE, CATEGORY_IMAGE_FOLDERS } from './data';

const MENU_STORAGE_KEY = 'dragonfly-menu-data-v1';
const IMAGE_UPLOAD_HELPER_URL = 'https://postimages.org/';
const TAKEAWAY_PHONE_DISPLAY = '0825 194 8323';
const TAKEAWAY_PHONE_HREF = 'tel:+3908251948323';

const cloneMenuData = (data: Category[]): Category[] => JSON.parse(JSON.stringify(data));

const isUploadedImage = (src?: string): boolean => !!src && src.startsWith('data:image/');

const createId = (prefix: string): string => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const clonePiadinaAddonGroups = (): ProductAddonGroup[] =>
  PIADINA_ADDON_GROUPS.map((group) => ({
    ...group,
    options: group.options.map((option) => ({ ...option })),
  }));

const normalizePiadinaAddonGroups = (product: Product): ProductAddonGroup[] => {
  if (product.addonGroups?.length) {
    return product.addonGroups.map((group) => ({
      id: group.id,
      name: group.name,
      options: (group.options || []).map((option) => ({ ...option })),
    }));
  }

  const groups = clonePiadinaAddonGroups();
  const fallbackAddons = product.addons || [];
  if (!fallbackAddons.length) {
    return groups;
  }

  const matchers: Record<string, RegExp> = {
    affettati: /(pancetta|speck|mortadella|prosciutto|salame|bresaola)/i,
    carne: /(hamburger|salsiccia|porchetta|cotechino|pollo|wurstel)/i,
    formaggi: /(squacquerone|mozzarella|scamorza|formagg|gorgonzola|stracchino|brie)/i,
    verdure: /(rucola|peperoni|cipolla|verdur|zucchine|insalata|pomodoro|melanzane|funghi)/i,
    salse: /(salsa|maionese|ketchup|bbq|senape|piccant|yogurt)/i,
  };

  fallbackAddons.forEach((addon) => {
    const groupId = Object.entries(matchers).find(([, regex]) => regex.test(addon.name))?.[0] || 'salse';
    const targetGroup = groups.find((group) => group.id === groupId);
    if (targetGroup) {
      targetGroup.options.push({ ...addon });
    }
  });

  return groups;
};

const normalizeMenuDataForPiadine = (data: Category[]): Category[] =>
  data.map((category) => {
    if (category.id !== 'piadine') {
      return category;
    }

    return {
      ...category,
      products: category.products.map((product) => ({
        ...product,
        addonGroups: normalizePiadinaAddonGroups(product),
      })),
    };
  });

const isValidMenuCategory = (value: unknown): value is Category => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<Category>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.icon === 'string' &&
    typeof candidate.image === 'string' &&
    Array.isArray(candidate.products)
  );
};

const isValidRemoteMenuData = (value: unknown): value is Category[] =>
  Array.isArray(value) && value.length > 0 && value.every(isValidMenuCategory);

/**
 * Merges remote Blob data with local MENU_DATA.
 * - Categories present in both remote and local → use remote version (admin edits).
 * - Categories only in local (new categories added in code) → use local fallback.
 * - Categories only in remote (legacy/orphan) → discarded.
 * This ensures new categories added to MENU_DATA always appear, even if the
 * Netlify Blob hasn't been re-saved since the new category was introduced.
 */
const mergeRemoteWithLocal = (remoteData: Category[]): Category[] => {
  const remoteMap = new Map(remoteData.map((cat) => [cat.id, cat]));
  const localMap = new Map(MENU_DATA.map((cat) => [cat.id, cat]));
  
  const merged = [...remoteData];
  
  MENU_DATA.forEach((localCat) => {
    if (!remoteMap.has(localCat.id)) {
      merged.push(localCat);
    }
  });

  return merged;
};

type NetlifyIdentityUser = {
  jwt: (forceUpdate?: boolean) => Promise<string>;
  token?: { access_token: string };
};

type NetlifyIdentityApi = {
  init: (options?: Record<string, unknown>) => void;
  on: (event: string, callback: (user?: unknown) => void) => void;
  currentUser: () => NetlifyIdentityUser | null;
  open: (panel?: string) => void;
  logout: () => void;
};

declare global {
  interface Window {
    netlifyIdentity?: NetlifyIdentityApi;
  }
}

// --- Image Compression Utility ---
const compressImage = (file: File, maxWidth = 1400, maxHeight = 1400, quality = 0.82): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(img.src);
        
        ctx.drawImage(img, 0, 0, width, height);
        // Compress as WebP for smaller size if supported, fallback to JPEG
        resolve(canvas.toDataURL('image/webp', quality));
      };
      img.onerror = (e) => reject(e);
    };
    reader.onerror = (e) => reject(e);
  });
};

// --- Components ---

const Header = ({ 
  onMenuClick, 
  onBack, 
  onPrevCategory,
  onNextCategory,
  onLogoClick,
  showBack = false, 
  title = "DRAGONFLY17" 
}: { 
  onMenuClick: () => void; 
  onBack?: () => void; 
  onPrevCategory?: () => void;
  onNextCategory?: () => void;
  onLogoClick?: () => void;
  showBack?: boolean;
  title?: string;
}) => (
  <header className="fixed top-0 left-0 right-0 z-50 glass-header h-16 px-4 relative flex items-center">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-start w-12">
      {showBack ? (
        <button onClick={onBack} className="p-2 hover:bg-wood-light/20 rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5 text-gold" />
        </button>
      ) : (
        <button onClick={onMenuClick} className="p-2 hover:bg-wood-light/20 rounded-full transition-colors">
          <Menu className="w-5 h-5 text-gold" />
        </button>
      )}
    </div>
    
    <div className="mx-auto flex flex-col items-center justify-center min-w-0 px-14">
      {!showBack ? (
        <img
          src="/dragonfly-logoV.png"
          alt="Dragonfly17 Genuine Pub "
          loading="eager"
          decoding="async"
          className="h-17 md:h-20 w-auto object-contain [filter:brightness(1.4)_contrast(1.22)_saturate(1.7)_drop-shadow(0_0_16px_rgba(255,224,140,0.95))_drop-shadow(0_0_34px_rgba(212,175,55,0.75))] animate-[pulse_2.4s_ease-in-out_infinite]"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevCategory}
            className="p-1 text-gold/80 hover:text-gold transition-colors"
            aria-label="Categoria precedente"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <h1 className="vintage-title text-lg md:text-xl text-gold tracking-[0.2em] leading-none truncate max-w-[170px] md:max-w-[270px] text-center">{title}</h1>
          <button
            onClick={onNextCategory}
            className="p-1 text-gold/80 hover:text-gold transition-colors"
            aria-label="Categoria successiva"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
    
    <div className="absolute right-[10px] md:right-[14px] top-1/2 -translate-y-1/2 flex items-center justify-end w-[96px] md:w-[104px]">
      {showBack ? (
        <button
          onClick={onLogoClick}
          className="p-1 hover:bg-wood-light/20 rounded-lg transition-colors"
          aria-label="Torna alla home"
        >
          <img
            src="/dragonfly-logoV.png"
            alt="Dragonfly logo"
            loading="eager"
            decoding="async"
            className="h-[72px] md:h-[80px] w-auto object-contain [filter:brightness(1.4)_contrast(1.22)_saturate(1.7)_drop-shadow(0_0_18px_rgba(255,224,140,0.95))_drop-shadow(0_0_36px_rgba(212,175,55,0.78))] animate-[pulse_2.4s_ease-in-out_infinite]"
            referrerPolicy="no-referrer"
          />
        </button>
      ) : (
        <a 
          href="https://maps.app.goo.gl/3bNHBbaiWMwcgMGdA"
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 hover:bg-wood-light/20 rounded-full transition-colors"
        >
          <MapPin className="w-5 h-5 text-gold" />
        </a>
      )}
    </div>
  </header>
);

const Hero = ({ onCategorySelect }: { onCategorySelect: (id: string) => void }) => (
  <section className="relative -mt-16 h-[50vh] md:h-[58vh] w-full overflow-hidden">
    <img 
      src="/dragonfly-hero.webp"
      alt="Dragon Fly Pub Atmosphere" 
      loading="eager"
      decoding="async"
      fetchPriority="high"
      className="w-full h-full object-cover object-[center_38%]"
      referrerPolicy="no-referrer"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-wood-dark via-wood-dark/35 to-wood-dark/10" />
    <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="vintage-title text-4xl md:text-6xl text-cream mb-2 italic">Benvenuti a Casa</h2>
        <p className="text-beige/80 text-lg mb-6 max-w-md">Il gusto della tradizione, l'anima del pub.</p>
        <button 
          onClick={() => onCategorySelect('panini')}
          className="bg-gold text-wood-dark px-5 py-2 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-accent-orange transition-colors"
        >
          Scopri il Menu
        </button>
      </motion.div>
    </div>
  </section>
);

const CategoryGrid = ({ categories, onSelect }: { categories: Category[]; onSelect: (cat: Category) => void }) => (
  <section className="px-4 py-8">
    <h3 className="vintage-title text-2xl text-gold mb-6 border-b border-gold/20 pb-2">Categorie</h3>
    <div className="grid grid-cols-2 gap-4">
      {categories.map((cat, idx) => (
        <motion.div
          key={cat.id}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.05 }}
          onClick={() => onSelect(cat)}
          className="relative aspect-[16/10] rounded-xl overflow-hidden card-shadow cursor-pointer group"
        >
          {cat.image ? (
            <div className="w-full h-full bg-gradient-to-br from-wood-medium/45 via-wood-dark/60 to-wood-dark/80">
              <img 
                src={cat.image} 
                alt={cat.name} 
                loading="lazy"
                decoding="async"
                className={`w-full h-full transition-transform duration-500 group-hover:scale-110 ${
                  isUploadedImage(cat.image) ? 'object-contain p-2' : 'object-cover'
                }`}
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-wood-medium/45 via-wood-dark/60 to-wood-dark/80 flex items-center justify-center">
              <img
                src="/dragonfly-logoV.png"
                alt="Dragonfly placeholder"
                loading="lazy"
                decoding="async"
                className="h-20 md:h-24 w-auto object-contain opacity-98 [filter:brightness(1.35)_contrast(1.25)_saturate(1.5)_drop-shadow(0_2px_12px_rgba(212,175,55,0.55))]"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
            <div className="flex flex-col items-center">
              <span className="vintage-title text-base md:text-lg text-white uppercase tracking-wider">{cat.name}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

const QuickMenuList = ({ categories, onSelect }: { categories: Category[]; onSelect: (cat: Category) => void }) => (
  <section className="px-4 py-6 bg-wood-medium/20">
    <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat)}
          className="whitespace-nowrap px-4 py-2 rounded-full border border-gold/30 text-beige hover:bg-gold hover:text-wood-dark transition-all text-base font-medium"
        >
          {cat.name}
        </button>
      ))}
    </div>
  </section>
);

const TakeawayInfo = ({ className = '' }: { className?: string }) => (
  <div className={`rounded-2xl border border-gold/20 bg-wood-medium/10 p-4 ${className}`}>
    <p className="text-[11px] md:text-xs uppercase tracking-[0.14em] text-gold/85 mb-1">Asporto</p>
    <p className="text-sm text-beige/85 leading-relaxed">In paese gratis, paesi limitrofi 2,50€.</p>
    <a
      href={TAKEAWAY_PHONE_HREF}
      className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-gold/35 bg-gold/10 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-wood-dark transition-colors"
      aria-label={`Chiama ${TAKEAWAY_PHONE_DISPLAY}`}
    >
      <Phone className="w-4 h-4" />
      Chiama {TAKEAWAY_PHONE_DISPLAY}
    </a>
  </div>
);

const HomeDomicilioHighlight = () => (
  <section className="px-4 pt-6 pb-2">
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl border border-gold/30 bg-[linear-gradient(135deg,rgba(212,175,55,0.17)_0%,rgba(109,65,30,0.35)_45%,rgba(24,17,11,0.92)_100%)] p-5 md:p-6 card-shadow"
    >
      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-20 h-48 w-48 rounded-full bg-accent-orange/20 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold/90">Consegna a domicilio</p>
          <h3 className="vintage-title mt-1 text-2xl md:text-3xl text-cream">🚚 Domicilio</h3>
          <p className="mt-2 text-sm md:text-base text-beige/85 leading-relaxed max-w-xl">
            In paese gratis, paesi limitrofi 2,50€.
          </p>
        </div>

        <a
          href={TAKEAWAY_PHONE_HREF}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gold/40 bg-gold/15 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-gold hover:bg-gold hover:text-wood-dark transition-colors"
          aria-label={`Chiama ${TAKEAWAY_PHONE_DISPLAY}`}
        >
          <Phone className="w-4 h-4" />
          Chiama {TAKEAWAY_PHONE_DISPLAY}
        </a>
      </div>
    </motion.div>
  </section>
);

const ProductCard = ({
  product,
  compactNoImage = false,
  categoryId
}: {
  product: Product;
  compactNoImage?: boolean;
  categoryId?: string;
}) => {
  const [showAllergens, setShowAllergens] = useState(false);
  const [openAddonGroupId, setOpenAddonGroupId] = useState<string | null>(null);

  const displayPrice =
    product.price ||
    (product.prices && product.prices.length > 0 ? product.prices.map((entry) => `${entry.label} ${entry.value}`).join(' / ') : '');
  const hasMultiPrices = !!product.prices && product.prices.length > 0;
  const showCompactMultiPrices = compactNoImage && hasMultiPrices;

  useEffect(() => {
    setOpenAddonGroupId(null);
  }, [product.id]);

  const addonGroups = product.addonGroups || [];

  if (compactNoImage) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-3 rounded-2xl border border-gold/15 bg-wood-medium/10 px-4 py-3 card-shadow overflow-hidden"
      >
        {product.soldOut && (
          <div className="absolute inset-x-0 top-0 z-10 border-b border-red-200/70 bg-[repeating-linear-gradient(-45deg,rgba(127,29,29,0.96),rgba(127,29,29,0.96)_10px,rgba(239,68,68,0.96)_10px,rgba(239,68,68,0.96)_20px)] py-1 text-center">
            <span className="text-[10px] font-black tracking-[0.28em] text-white uppercase">TERMINATO</span>
          </div>
        )}

        <div className={`flex items-start justify-between gap-4 ${product.soldOut ? 'pt-6' : ''}`}>
          <div>
            <div className="flex items-center gap-2">
              {product.vegan && (
                <span className="inline-flex items-center rounded-full border border-emerald-200/70 bg-emerald-600/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  🌱 Vegan
                </span>
              )}
              <h4 className="text-cream font-semibold text-lg leading-tight">{product.name}</h4>
            </div>
            {product.description && (
              <p className="mt-1 text-xs text-beige/70 leading-relaxed">{product.description}</p>
            )}
          </div>
          {(!showCompactMultiPrices && displayPrice) && <span className="text-gold font-bold text-lg whitespace-nowrap">{displayPrice}</span>}
        </div>

        {showCompactMultiPrices && (
          <div className="flex flex-wrap gap-2 mt-3">
            {product.prices!.map((p, i) => (
              <div key={i} className="flex flex-col items-center bg-wood-dark/50 border border-gold/20 rounded-xl px-3 py-1 min-w-[72px]">
                <span className="text-[10px] text-gold/60 uppercase font-bold">{p.label}</span>
                <span className="text-cream font-bold">{p.value}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-wood-medium/10 rounded-3xl overflow-hidden card-shadow mb-6 border border-wood-light/10"
    >
      <div className="relative aspect-[4/3] w-full">
        {product.image ? (
          <div className="w-full h-full bg-gradient-to-br from-wood-medium/45 via-wood-dark/60 to-wood-dark/80">
            <img 
              src={product.image} 
              alt={product.name} 
              loading="lazy"
              decoding="async"
              className={`w-full h-full ${isUploadedImage(product.image) ? 'object-contain p-2' : 'object-cover'}`}
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-wood-medium/45 via-wood-dark/75 to-black/85">
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-gold/12 blur-2xl" />
            <div className="absolute -bottom-14 -right-10 w-44 h-44 rounded-full bg-accent-orange/15 blur-2xl" />
            <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.18),transparent_45%),radial-gradient(circle_at_75%_80%,rgba(212,175,55,0.22),transparent_42%)]" />

            <div className="absolute inset-0 flex items-center justify-center p-5">
              <div className="w-full h-full rounded-2xl border border-gold/20 bg-wood-dark/35 backdrop-blur-[1px] flex flex-col items-center justify-center text-center px-4">
                <img
                  src="/dragonfly-logoV.png"
                  alt="Dragonfly placeholder"
                  loading="lazy"
                  decoding="async"
                  className="h-24 md:h-32 w-auto object-contain mb-3 [filter:brightness(1.4)_contrast(1.3)_saturate(1.6)_drop-shadow(0_3px_14px_rgba(212,175,55,0.6))]"
                />
                <p className="text-gold/80 text-[10px] uppercase tracking-[0.18em] font-semibold mb-1">Selezione Dragonfly</p>
                <p className="text-beige/85 text-sm leading-tight max-w-[220px] line-clamp-2">{product.name}</p>
              </div>
            </div>
          </div>
        )}
        <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
          {product.vegan && (
            <div className="bg-emerald-700/90 backdrop-blur-sm px-3 py-1 rounded-full border border-emerald-200/70">
              <span className="text-white font-bold text-sm uppercase tracking-wider">🌱 Vegan</span>
            </div>
          )}
          {product.format && (
            <div className="bg-wood-dark/80 backdrop-blur-sm px-4 py-1 rounded-full border border-gold/30">
              <span className="text-gold font-bold text-lg">{product.format}</span>
            </div>
          )}
        </div>

        {product.soldOut && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-3">
            <div className="w-[140%] -rotate-12 border-y-4 border-red-200/90 bg-[repeating-linear-gradient(-45deg,rgba(127,29,29,0.96),rgba(127,29,29,0.96)_14px,rgba(239,68,68,0.96)_14px,rgba(239,68,68,0.96)_28px)] py-2 text-center shadow-2xl">
              <span className="text-white font-black tracking-[0.32em] text-sm md:text-base uppercase">TERMINATO</span>
            </div>
          </div>
        )}
        {product.price && (
          <div className="absolute top-4 right-4 bg-wood-dark/80 backdrop-blur-sm px-4 py-1 rounded-full border border-gold/30">
            <span className="text-gold font-bold text-lg">{product.price}</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h4 className="vintage-title text-2xl text-cream">{product.name}</h4>
          {product.allergens && product.allergens.length > 0 && (
            <button 
              onClick={() => setShowAllergens(!showAllergens)}
              className="p-2 text-gold/60 hover:text-gold transition-colors"
              title="Allergeni"
            >
              <AlertCircle className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-beige/70 text-sm leading-relaxed mb-4">{product.description}</p>
        
        <AnimatePresence>
          {showAllergens && product.allergens && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-wood-dark/40 rounded-xl p-3 border border-gold/10">
                <p className="text-[10px] text-gold uppercase font-bold mb-2 tracking-widest">Allergeni:</p>
                <div className="flex flex-wrap gap-2">
                  {product.allergens.map((a, i) => (
                    <span key={i} className="text-[10px] bg-gold/10 text-beige px-2 py-0.5 rounded-md border border-gold/20">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {product.prices && (
          <div className="flex flex-wrap gap-2 mt-4">
            {product.prices.map((p, i) => (
              <div key={i} className="flex flex-col items-center bg-wood-dark/50 border border-gold/20 rounded-xl px-3 py-1 min-w-[60px]">
                <span className="text-[10px] text-gold/60 uppercase font-bold">{p.label}</span>
                <span className="text-cream font-bold">{p.value}</span>
              </div>
            ))}
          </div>
        )}

        {addonGroups.length > 0 && (
          <div className="mt-4 rounded-xl border border-gold/20 bg-wood-dark/35 p-3">
            <p className="text-[10px] text-gold uppercase font-bold tracking-widest mb-2">Aggiunte</p>
            <div className="grid gap-2 sm:grid-cols-2 mb-2">
              {addonGroups.map((group) => (
                <div key={group.id} className="space-y-1">
                  <button
                    onClick={() => setOpenAddonGroupId((prev) => (prev === group.id ? null : group.id))}
                    className="w-full px-3 py-2 text-xs uppercase tracking-wider font-semibold rounded-lg border border-gold/25 text-beige hover:text-gold hover:bg-gold/10 transition-colors"
                  >
                    {group.name}
                  </button>
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {openAddonGroupId && (
                <motion.div
                  key={openAddonGroupId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-wood-dark/40 rounded-xl p-3 border border-gold/10">
                    <p className="text-[10px] text-gold uppercase font-bold mb-2 tracking-widest">
                      {addonGroups.find((group) => group.id === openAddonGroupId)?.name}
                    </p>
                    <div className="grid gap-1.5">
                      {(addonGroups.find((group) => group.id === openAddonGroupId)?.options || []).map((option, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-beige/90">{option.name}</span>
                          <span className="text-gold font-semibold">{option.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {addonGroups.length === 0 && product.addons && product.addons.length > 0 && (
          <div className="mt-4 rounded-xl border border-gold/20 bg-wood-dark/35 p-3">
            <p className="text-[10px] text-gold uppercase font-bold tracking-widest mb-2">Aggiunte</p>
            <div className="grid gap-1.5">
              {product.addons.map((addon, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-beige/90">{addon.name}</span>
                  <span className="text-gold font-semibold">{addon.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Sidebar = ({ isOpen, onClose, categories, onCategorySelect, onContactClick }: { isOpen: boolean; onClose: () => void; categories: Category[]; onCategorySelect: (cat: Category) => void; onContactClick: () => void }) => {
  const [isTakeawayOpen, setIsTakeawayOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsTakeawayOpen(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[80%] max-w-xs bg-wood-dark z-[70] p-8 card-shadow border-r border-gold/10 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="vintage-title text-2xl text-gold uppercase tracking-wider">Dragonfly17</h2>
              <button onClick={onClose} className="p-2 text-beige">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-8">
              <h3 className="text-gold uppercase tracking-widest text-xs font-bold mb-4 opacity-50">Menu</h3>
              <nav className="space-y-4">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onCategorySelect(cat);
                      onClose();
                    }}
                    className="w-full flex items-center gap-4 text-lg text-beige hover:text-gold transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="space-y-4 pt-8 border-t border-gold/10">
              <div>
                <button
                  onClick={() => setIsTakeawayOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between gap-4 text-lg text-beige hover:text-gold transition-colors text-left"
                  aria-expanded={isTakeawayOpen}
                >
                  <span className="flex items-center gap-4">
                    <span className="text-xl leading-none">🚚</span>
                    Asporto
                  </span>
                  <ChevronRight className={`w-5 h-5 transition-transform ${isTakeawayOpen ? 'rotate-90' : ''}`} />
                </button>

                <AnimatePresence initial={false}>
                  {isTakeawayOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 rounded-xl border border-gold/20 bg-wood-medium/10 p-3 ml-9">
                        <p className="text-sm text-beige/85 leading-relaxed">In paese gratis, paesi limitrofi 2,50€.</p>
                        <a
                          href={TAKEAWAY_PHONE_HREF}
                          className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg border border-gold/35 bg-gold/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-wood-dark transition-colors"
                          aria-label={`Chiama ${TAKEAWAY_PHONE_DISPLAY}`}
                        >
                          <Phone className="w-4 h-4" />
                          Chiama {TAKEAWAY_PHONE_DISPLAY}
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <a
                href={TAKEAWAY_PHONE_HREF}
                onClick={onClose}
                className="w-full flex items-center gap-4 text-lg text-beige hover:text-gold transition-colors text-left"
                aria-label={`Prenota un tavolo chiamando ${TAKEAWAY_PHONE_DISPLAY}`}
              >
                <Phone className="w-5 h-5" /> Prenota Tavolo
              </a>
              <a href="https://maps.app.goo.gl/3bNHBbaiWMwcgMGdA" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-lg text-beige hover:text-gold transition-colors">
                <MapPin className="w-5 h-5" /> Dove Siamo
              </a>
            </div>

            <div className="mt-12 text-center">
              <p className="text-[10px] text-beige/40 uppercase tracking-widest">© 2026 Dragonfly17 Genuine Pub </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const AdminPanel = ({
  isOpen,
  onClose,
  categories,
  onSave,
  onResetDefaults,
  onLogout,
}: {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSave: (nextData: Category[]) => void;
  onResetDefaults: () => void;
  onLogout: () => void;
}) => {
  const [draft, setDraft] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const nextDraft = cloneMenuData(categories);
    setDraft(nextDraft);
    setSelectedCategoryId((prev) => prev || nextDraft[0]?.id || '');
  }, [isOpen, categories]);

  const selectedCategory = useMemo(
    () => draft.find((cat) => cat.id === selectedCategoryId) || null,
    [draft, selectedCategoryId]
  );

  const isPiadineCategory = selectedCategory?.id === 'piadine';

  const updateCategoryField = (field: 'name' | 'image', value: string) => {
    setDraft((prev) => prev.map((cat) => (cat.id === selectedCategoryId ? { ...cat, [field]: value } : cat)));
  };

  const updateProductField = (productId: string, field: keyof Product, value: any) => {
    setDraft((prev) =>
      prev.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;
        return {
          ...cat,
          products: cat.products.map((product) => {
            if (product.id !== productId) return product;

            if (field === 'allergens') {
              const allergens = (value as string)
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
              return { ...product, allergens };
            }

            return { ...product, [field]: value };
          }),
        };
      })
    );
  };

  const addCategory = () => {
    const newCategory: Category = {
      id: createId('cat'),
      name: 'Nuova Categoria',
      icon: '🍽️',
      image: '',
      products: [],
    };

    setDraft((prev) => [...prev, newCategory]);
    setSelectedCategoryId(newCategory.id);
  };

  const deleteCategory = () => {
    if (!selectedCategoryId) return;
    setDraft((prev) => {
      const next = prev.filter((cat) => cat.id !== selectedCategoryId);
      setSelectedCategoryId(next[0]?.id || '');
      return next;
    });
  };

  const addProduct = () => {
    if (!selectedCategoryId) return;

    const currentCategory = draft.find((cat) => cat.id === selectedCategoryId);
    if (currentCategory?.id === 'piadine' && currentCategory.products.length >= 1) {
      return;
    }

    const newProduct: Product = {
      id: createId('prod'),
      name: 'Nuovo Prodotto',
      description: 'Descrizione prodotto',
      price: '0.00€',
      image: '',
      allergens: [],
      vegan: false,
      soldOut: false,
      addons: [],
      addonGroups: selectedCategoryId === 'piadine' ? clonePiadinaAddonGroups() : undefined,
    };

    setDraft((prev) =>
      prev.map((cat) => (cat.id === selectedCategoryId ? { ...cat, products: [...cat.products, newProduct] } : cat))
    );
  };

  const deleteProduct = (productId: string) => {
    if (isPiadineCategory && selectedCategory?.products.length === 1) {
      return;
    }

    setDraft((prev) =>
      prev.map((cat) =>
        cat.id === selectedCategoryId
          ? { ...cat, products: cat.products.filter((product) => product.id !== productId) }
          : cat
      )
    );
  };

  const moveProduct = (productId: string, direction: 'up' | 'down') => {
    setDraft((prev) =>
      prev.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;

        const currentIndex = cat.products.findIndex((product) => product.id === productId);
        if (currentIndex === -1) return cat;

        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= cat.products.length) return cat;

        const nextProducts = [...cat.products];
        const [moved] = nextProducts.splice(currentIndex, 1);
        nextProducts.splice(targetIndex, 0, moved);

        return { ...cat, products: nextProducts };
      })
    );
  };

  const addProductAddonOption = (productId: string, groupId: string) => {
    setDraft((prev) =>
      prev.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;
        return {
          ...cat,
          products: cat.products.map((product) => {
            if (product.id !== productId) return product;

            const nextGroups = (product.addonGroups?.length ? product.addonGroups : clonePiadinaAddonGroups()).map((group) => {
              if (group.id !== groupId) return group;
              return {
                ...group,
                options: [...group.options, { name: 'Nuova aggiunta', price: '+0.50€' }],
              };
            });

            return { ...product, addonGroups: nextGroups };
          }),
        };
      })
    );
  };

  const updateProductAddonOption = (
    productId: string,
    groupId: string,
    optionIndex: number,
    field: keyof ProductAddon,
    value: string
  ) => {
    setDraft((prev) =>
      prev.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;
        return {
          ...cat,
          products: cat.products.map((product) => {
            if (product.id !== productId) return product;

            const nextGroups = (product.addonGroups?.length ? product.addonGroups : clonePiadinaAddonGroups()).map((group) => {
              if (group.id !== groupId) return group;
              const nextOptions = [...group.options];
              if (!nextOptions[optionIndex]) return group;
              nextOptions[optionIndex] = { ...nextOptions[optionIndex], [field]: value };
              return { ...group, options: nextOptions };
            });

            return { ...product, addonGroups: nextGroups };
          }),
        };
      })
    );
  };

  const deleteProductAddonOption = (productId: string, groupId: string, optionIndex: number) => {
    setDraft((prev) =>
      prev.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;
        return {
          ...cat,
          products: cat.products.map((product) => {
            if (product.id !== productId) return product;

            const nextGroups = (product.addonGroups?.length ? product.addonGroups : clonePiadinaAddonGroups()).map((group) => {
              if (group.id !== groupId) return group;
              const nextOptions = group.options.filter((_, i) => i !== optionIndex);
              return { ...group, options: nextOptions };
            });

            return { ...product, addonGroups: nextGroups };
          }),
        };
      })
    );
  };

  const saveDraft = () => {
    onSave(draft);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[90]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed inset-3 md:inset-8 z-[95] bg-wood-dark border border-gold/20 rounded-2xl overflow-hidden flex flex-col"
          >
            <div className="px-4 md:px-6 py-3 border-b border-gold/15 flex items-center justify-between">
              <h2 className="vintage-title text-gold text-xl md:text-2xl">Gestione Menu</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 border border-gold/25 rounded-lg text-xs uppercase tracking-wider text-beige hover:text-gold transition-colors"
                >
                  Logout
                </button>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-wood-light/20 transition-colors" aria-label="Chiudi pannello admin">
                  <X className="w-5 h-5 text-gold" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
              <div className="flex flex-wrap gap-2 items-center">
                <label className="text-xs uppercase tracking-widest text-gold/70">Categoria</label>
                <select
                  value={selectedCategoryId}
                  onChange={(event) => setSelectedCategoryId(event.target.value)}
                  className="bg-wood-medium/20 border border-gold/20 rounded-lg px-3 py-2 text-beige"
                >
                  {draft.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button onClick={addCategory} className="px-3 py-2 border border-gold/30 rounded-lg text-gold text-sm hover:bg-gold/10 transition-colors">
                  + Categoria
                </button>
                <button onClick={deleteCategory} className="px-3 py-2 border border-red-300/40 rounded-lg text-red-200 text-sm hover:bg-red-500/10 transition-colors">
                  Elimina Categoria
                </button>
              </div>

              {selectedCategory && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      value={selectedCategory.name}
                      onChange={(event) => updateCategoryField('name', event.target.value)}
                      className="flex-1 bg-wood-medium/20 border border-gold/20 rounded-lg px-3 py-2 text-beige"
                      placeholder="Nome categoria"
                    />
                    <div className="md:col-span-2 flex flex-col gap-2 p-3 bg-wood-medium/10 rounded-xl border border-gold/20">
                      <label className="text-xs uppercase tracking-widest text-gold/70">Immagine Categoria</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const compressed = await compressImage(file, 1400, 1400, 0.82);
                            updateCategoryField('image', compressed);
                          } catch (err) {
                            console.error('Failed to compress image:', err);
                            alert("Errore durante l'elaborazione dell'immagine.");
                          }
                        }}
                        className="text-sm text-beige file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gold file:text-wood-dark hover:file:bg-accent-orange transition-colors"
                      />
                      <input
                        value={selectedCategory.image}
                        onChange={(event) => updateCategoryField('image', event.target.value)}
                        className="bg-wood-medium/20 border border-gold/20 rounded-lg px-3 py-2 text-beige mt-2 text-xs"
                        placeholder="Oppure inserisci URL immagine"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-widest text-gold/70">Prodotti ({selectedCategory.products.length})</p>
                    <button
                      onClick={addProduct}
                      disabled={isPiadineCategory && selectedCategory.products.length >= 1}
                      className="px-3 py-2 border border-gold/30 rounded-lg text-gold text-sm hover:bg-gold/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isPiadineCategory ? 'Solo 1 Piadina' : '+ Prodotto'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedCategory.products.map((product, index) => {
                      const colorClasses = [
                        'border-indigo-500/40 bg-indigo-900/20',
                        'border-emerald-500/40 bg-emerald-900/20',
                        'border-amber-500/40 bg-amber-900/20',
                        'border-rose-500/40 bg-rose-900/20',
                        'border-cyan-500/40 bg-cyan-900/20',
                        'border-fuchsia-500/40 bg-fuchsia-900/20'
                      ][index % 6];
                      return (
                      <div key={product.id} className={`border rounded-xl p-3 md:p-4 space-y-3 ${colorClasses}`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-wood-dark/50 text-gold/80 text-xs font-bold border border-gold/20">{index + 1}</span>
                            <p className="text-gold text-sm md:text-base font-bold uppercase tracking-wider">{product.name || 'Nuovo Prodotto'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => moveProduct(product.id, 'up')}
                              disabled={index === 0}
                              className="px-2 py-1 text-xs border border-gold/30 rounded-md text-gold hover:bg-gold/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Su
                            </button>
                            <button
                              onClick={() => moveProduct(product.id, 'down')}
                              disabled={index === selectedCategory.products.length - 1}
                              className="px-2 py-1 text-xs border border-gold/30 rounded-md text-gold hover:bg-gold/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Giu
                            </button>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              disabled={isPiadineCategory && selectedCategory.products.length === 1}
                              className="px-2 py-1 text-xs border border-red-300/40 rounded-md text-red-200 hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Elimina
                            </button>
                          </div>
                        </div>
                        <input
                          value={product.name}
                          onChange={(event) => updateProductField(product.id, 'name', event.target.value)}
                          className="w-full bg-wood-dark/40 border border-gold/15 rounded-lg px-3 py-2 text-beige"
                          placeholder="Nome prodotto"
                        />
                        <textarea
                          value={product.description}
                          onChange={(event) => updateProductField(product.id, 'description', event.target.value)}
                          className="w-full bg-wood-dark/40 border border-gold/15 rounded-lg px-3 py-2 text-beige min-h-[74px]"
                          placeholder="Descrizione"
                        />
                        <input
                          value={product.format || ''}
                          onChange={(event) => updateProductField(product.id, 'format', event.target.value)}
                          className="w-full bg-wood-dark/40 border border-gold/15 rounded-lg px-3 py-2 text-beige"
                          placeholder="Formato (es. 33cl, 50cl)"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <label className="flex items-center gap-2 rounded-lg border border-gold/15 bg-wood-dark/25 px-3 py-2 text-beige text-sm">
                            <input
                              type="checkbox"
                              checked={!!product.vegan}
                              onChange={(event) => updateProductField(product.id, 'vegan', event.target.checked)}
                              className="h-4 w-4 accent-emerald-500"
                            />
                            Prodotto vegano (badge in alto a sinistra)
                          </label>

                          <label className="flex items-center gap-2 rounded-lg border border-red-300/30 bg-red-900/20 px-3 py-2 text-red-100 text-sm">
                            <input
                              type="checkbox"
                              checked={!!product.soldOut}
                              onChange={(event) => updateProductField(product.id, 'soldOut', event.target.checked)}
                              className="h-4 w-4 accent-red-500"
                            />
                            Esaurito (mostra barra TERMINATO)
                          </label>
                        </div>

                        <div className="flex flex-col gap-2 p-3 bg-wood-dark/20 rounded-xl border border-gold/10">
                          <label className="text-xs uppercase tracking-widest text-gold/70">Immagine Prodotto</label>
                          
                          {/* Dropdown per immagini disponibili dalla cartella */}
                          {CATEGORY_IMAGE_FOLDERS[selectedCategoryId] && CATEGORY_IMAGE_FOLDERS[selectedCategoryId].length > 0 && (
                            <div className="flex flex-col gap-2">
                              <label className="text-xs uppercase tracking-widest text-gold/50">Seleziona dalla cartella</label>
                              <select
                                value={product.image}
                                onChange={(e) => updateProductField(product.id, 'image', e.target.value)}
                                className="w-full bg-wood-dark/40 border border-gold/15 rounded-lg px-3 py-2 text-beige text-sm"
                              >
                                <option value="">-- Scegli immagine --</option>
                                {CATEGORY_IMAGE_FOLDERS[selectedCategoryId].map((img) => {
                                  const fileName = img.split('/').pop() || '';
                                  return (
                                    <option key={img} value={img}>
                                      {fileName}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          )}
                          
                          <div className="border-t border-gold/10 pt-3">
                            <label className="text-xs uppercase tracking-widest text-gold/50 mb-2 block">Oppure carica un file</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  const compressed = await compressImage(file, 1400, 1400, 0.82);
                                  updateProductField(product.id, 'image', compressed);
                                } catch (err) {
                                  console.error('Failed to compress image:', err);
                                  alert("Errore durante l'elaborazione dell'immagine.");
                                }
                              }}
                              className="text-sm text-beige file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gold file:text-wood-dark hover:file:bg-accent-orange transition-colors"
                            />
                          </div>
                          
                          <input
                            value={product.image}
                            onChange={(event) => updateProductField(product.id, 'image', event.target.value)}
                            className="w-full bg-wood-dark/40 border border-gold/15 rounded-lg px-3 py-2 text-beige text-xs"
                            placeholder="Oppure inserisci URL foto"
                          />

                          {product.image && (
                            <div className="mt-2 rounded-xl border border-gold/15 overflow-hidden bg-gradient-to-br from-wood-medium/45 via-wood-dark/60 to-wood-dark/80 h-36">
                              <img
                                src={product.image}
                                alt={`Anteprima ${product.name}`}
                                className={`w-full h-full ${isUploadedImage(product.image) ? 'object-contain p-2' : 'object-cover'}`}
                                loading="lazy"
                                decoding="async"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-3 mt-3 p-3 bg-wood-dark/20 rounded-xl border border-gold/10">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs uppercase tracking-widest text-gold/70">Prezzo Unico</label>
                            <input
                              value={product.price || ''}
                              onChange={(event) => {
                                updateProductField(product.id, 'price', event.target.value);
                                updateProductField(product.id, 'prices', undefined);
                              }}
                              className="w-full bg-wood-dark/40 border border-gold/15 rounded-lg px-3 py-2 text-beige"
                              placeholder="Prezzo (es. 8.50€)"
                              disabled={!!product.prices?.length}
                            />
                          </div>

                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gold/10">
                            <label className="text-xs uppercase tracking-widest text-gold/70">Formati Multipli (es. per cl)</label>
                            <button
                              onClick={() => {
                                const currentPrices = product.prices || [];
                                updateProductField(product.id, 'prices', [...currentPrices, { label: '33cl', value: '5.00€' }]);
                                updateProductField(product.id, 'price', undefined);
                              }}
                              className="px-2 py-1 bg-gold/10 text-gold text-xs rounded border border-gold/20 hover:bg-gold/20 transition-colors"
                            >
                              + Formato
                            </button>
                          </div>
                          
                          {product.prices?.map((p, pIndex) => (
                            <div key={pIndex} className="flex gap-2 items-center">
                              <input
                                value={p.label}
                                onChange={(e) => {
                                  const newPrices = [...(product.prices || [])];
                                  newPrices[pIndex] = { ...newPrices[pIndex], label: e.target.value };
                                  updateProductField(product.id, 'prices', newPrices);
                                }}
                                className="w-1/3 bg-wood-dark/40 border border-gold/15 rounded-lg px-2 py-1.5 text-beige text-sm"
                                placeholder="es. 33cl"
                              />
                              <input
                                value={p.value}
                                onChange={(e) => {
                                  const newPrices = [...(product.prices || [])];
                                  newPrices[pIndex] = { ...newPrices[pIndex], value: e.target.value };
                                  updateProductField(product.id, 'prices', newPrices);
                                }}
                                className="flex-1 bg-wood-dark/40 border border-gold/15 rounded-lg px-2 py-1.5 text-beige text-sm"
                                placeholder="Prezzo"
                              />
                              <button
                                onClick={() => {
                                  const newPrices = (product.prices || []).filter((_, i) => i !== pIndex);
                                  updateProductField(product.id, 'prices', newPrices.length ? newPrices : undefined);
                                }}
                                className="text-red-400 p-1 rounded hover:bg-red-500/20"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <input
                          value={product.allergens?.join(', ') || ''}
                          onChange={(event) => updateProductField(product.id, 'allergens', event.target.value)}
                          className="w-full bg-wood-dark/40 border border-gold/15 rounded-lg px-3 py-2 text-beige"
                          placeholder="Allergeni separati da virgola"
                        />

                        {isPiadineCategory && (
                          <div className="space-y-3 mt-3 p-3 bg-wood-dark/20 rounded-xl border border-gold/10">
                            <label className="text-xs uppercase tracking-widest text-gold/70">
                              Aggiunte personalizzabili ({PIADINA_ADDON_GROUPS.length} menu)
                            </label>

                            {(product.addonGroups?.length ? product.addonGroups : PIADINA_ADDON_GROUPS).map((group) => (
                              <div key={group.id} className="space-y-2 rounded-lg border border-gold/10 bg-wood-dark/20 p-2.5">
                                <div className="flex justify-between items-center">
                                  <p className="text-xs uppercase tracking-wider text-gold/80">{group.name}</p>
                                  <button
                                    onClick={() => addProductAddonOption(product.id, group.id)}
                                    className="px-2 py-1 bg-gold/10 text-gold text-xs rounded border border-gold/20 hover:bg-gold/20 transition-colors"
                                  >
                                    + Aggiunta
                                  </button>
                                </div>

                                {group.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex gap-2 items-center">
                                    <input
                                      value={option.name}
                                      onChange={(e) => updateProductAddonOption(product.id, group.id, optionIndex, 'name', e.target.value)}
                                      className="flex-1 bg-wood-dark/40 border border-gold/15 rounded-lg px-2 py-1.5 text-beige text-sm"
                                      placeholder="Nome aggiunta"
                                    />
                                    <input
                                      value={option.price}
                                      onChange={(e) => updateProductAddonOption(product.id, group.id, optionIndex, 'price', e.target.value)}
                                      className="w-28 bg-wood-dark/40 border border-gold/15 rounded-lg px-2 py-1.5 text-beige text-sm"
                                      placeholder="+1.00€"
                                    />
                                    <button
                                      onClick={() => deleteProductAddonOption(product.id, group.id, optionIndex)}
                                      className="text-red-400 p-1 rounded hover:bg-red-500/20"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}

                                {group.options.length === 0 && (
                                  <p className="text-beige/55 text-xs italic">Nessuna aggiunta in questo gruppo.</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      );
                    })}
                    {selectedCategory.products.length === 0 && (
                      <p className="text-beige/55 text-sm italic">Nessun prodotto in questa categoria.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 md:px-6 py-3 border-t border-gold/15 flex flex-wrap gap-2 justify-end">
              <button
                onClick={onResetDefaults}
                className="px-3 py-2 border border-gold/20 rounded-lg text-beige/80 text-sm hover:bg-wood-light/20 transition-colors"
              >
                Ripristina Default
              </button>
              <button
                onClick={saveDraft}
                className="px-4 py-2 rounded-lg bg-gold text-wood-dark font-semibold text-sm hover:bg-accent-orange transition-colors"
              >
                Salva Modifiche
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const AdminAccessGate = ({
  isAuthReady,
  hasIdentity,
  onOpenLogin,
  onOpenRecovery,
}: {
  isAuthReady: boolean;
  hasIdentity: boolean;
  onOpenLogin: () => void;
  onOpenRecovery: () => void;
}) => (
  <div className="fixed inset-0 z-[85] bg-black/75 backdrop-blur-sm flex items-center justify-center px-4">
    <div className="w-full max-w-md rounded-2xl border border-gold/25 bg-wood-dark p-6 md:p-7 card-shadow">
      <h2 className="vintage-title text-2xl text-gold mb-3">Accesso Admin</h2>
      <p className="text-beige/80 text-sm leading-relaxed mb-5">
        Inserisci email e password tramite il login Netlify per entrare nel pannello di gestione menu.
      </p>

      {hasIdentity ? (
        <div className="space-y-3">
          <button
            onClick={onOpenLogin}
            className="w-full rounded-xl bg-gold text-wood-dark py-3 font-semibold uppercase tracking-wider text-sm hover:bg-accent-orange transition-colors"
            disabled={!isAuthReady}
          >
            {isAuthReady ? 'Apri Login' : 'Caricamento...'}
          </button>
          <button
            onClick={onOpenRecovery}
            className="w-full rounded-xl border border-gold/35 text-gold py-3 font-semibold uppercase tracking-wider text-sm hover:bg-gold/10 transition-colors"
            disabled={!isAuthReady}
          >
            Reimposta Password
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-red-300/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          Login non disponibile: il widget Netlify Identity non e stato caricato.
        </div>
      )}

      <p className="mt-4 text-xs text-beige/55">
        Se non hai mai impostato la password, premi "Reimposta Password" e usa il link email ricevuto.
      </p>
    </div>
  </div>
);

const PrivacyPolicyModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-[100]"
          onClick={onClose}
        />
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="fixed inset-4 md:inset-10 z-[105] bg-wood-dark border border-gold/20 rounded-2xl overflow-hidden flex flex-col"
        >
          <div className="px-4 md:px-6 py-3 border-b border-gold/15 flex items-center justify-between">
            <h2 className="vintage-title text-gold text-xl md:text-2xl">Privacy Policy</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-wood-light/20 transition-colors" aria-label="Chiudi privacy policy">
              <X className="w-5 h-5 text-gold" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 text-sm text-beige/85 leading-relaxed">
            <p>Ultimo aggiornamento: 28/03/2026</p>

            <section>
              <h3 className="text-gold uppercase tracking-wider text-xs mb-1">Titolare del trattamento</h3>
              <p>Dragonfly17 Genuine Pub </p>
              <p>Email: diciasettefg@libero.it</p>
            </section>

            <section>
              <h3 className="text-gold uppercase tracking-wider text-xs mb-1">Dati raccolti</h3>
              <p>Possiamo trattare dati di contatto inviati volontariamente e dati tecnici di navigazione necessari al funzionamento del sito.</p>
            </section>

            <section>
              <h3 className="text-gold uppercase tracking-wider text-xs mb-1">Finalita del trattamento</h3>
              <p>I dati sono trattati per rispondere alle richieste, gestire il servizio e garantire sicurezza e funzionamento della piattaforma.</p>
            </section>

            <section>
              <h3 className="text-gold uppercase tracking-wider text-xs mb-1">Base giuridica</h3>
              <p>Esecuzione di misure precontrattuali, adempimenti di legge e legittimo interesse del titolare.</p>
            </section>

            <section>
              <h3 className="text-gold uppercase tracking-wider text-xs mb-1">Conservazione</h3>
              <p>I dati sono conservati per il tempo strettamente necessario alle finalita indicate e agli obblighi normativi.</p>
            </section>

            <section>
              <h3 className="text-gold uppercase tracking-wider text-xs mb-1">Diritti dell interessato</h3>
              <p>Puoi richiedere accesso, rettifica, cancellazione, limitazione, opposizione e portabilita dei dati scrivendo a info@dragonflypub.it.</p>
            </section>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// --- Main App ---

export default function App() {
  const [menuData, setMenuData] = useState<Category[]>(normalizeMenuDataForPiadine(MENU_DATA));
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const normalizedPath =
    typeof window !== 'undefined' ? window.location.pathname.replace(/\/+$/, '') || '/' : '';

  const authHashParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.hash.replace(/^#/, '')) : null;
  const authQueryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const hasAuthToken = !!(
    authHashParams?.get('invite_token') ||
    authQueryParams?.get('invite_token') ||
    authHashParams?.get('confirmation_token') ||
    authQueryParams?.get('confirmation_token') ||
    authHashParams?.get('recovery_token') ||
    authQueryParams?.get('recovery_token') ||
    authHashParams?.get('token') ||
    authQueryParams?.get('token') ||
    authHashParams?.get('type') === 'recovery' ||
    authQueryParams?.get('type') === 'recovery'
  );

  const isAdminRoute = typeof window !== 'undefined' && normalizedPath === '/peppoo7';
  const hasIdentity = typeof window !== 'undefined' && !!window.netlifyIdentity;

  useEffect(() => {
    const identity = window.netlifyIdentity;
    if (!identity) {
      console.warn('Netlify Identity widget not loaded');
      setIsAuthReady(true);
      return;
    }

    try {
      // Netlify widget auto-initializes on DOMContentLoaded.
      // Calling init() again can destroy the token-triggered modal.
      // We only bind the logic.
      setIsAuthenticated(!!identity.currentUser());
      console.log('Netlify Identity state checked successfully');
    } catch (err) {
      console.error('Failed to check Netlify Identity:', err);
    }
    setIsAuthReady(true);
    
    // Netlify Identity widget automatically reads `#invite_token` and `#recovery_token` and pops up natively.
    // If the user already has session and route is admin, open admin immediately.
    if (identity.currentUser() && isAdminRoute) {
      setIsAdminOpen(true);
    }

    identity.on('login', () => {
      setIsAuthenticated(true);
      if (isAdminRoute) {
        setIsAdminOpen(true);
      }
    });

    identity.on('logout', () => {
      setIsAuthenticated(false);
      setIsAdminOpen(false);
    });
  }, [isAdminRoute]);

  useEffect(() => {
    if (!isAuthReady || !isAdminRoute || isAuthenticated || hasAuthToken) return;
    const identity = window.netlifyIdentity;
    if (identity && !identity.currentUser()) {
       identity.open('login');
    }
  }, [isAuthReady, isAdminRoute, isAuthenticated, hasAuthToken]);

  const openAdminLogin = () => {
    const identity = window.netlifyIdentity;
    if (!identity) {
      console.error('Netlify Identity widget not available');
      alert('Login non disponibile. Ricarica la pagina.');
      return;
    }
    
    console.log('Opening Netlify Identity login form');
    identity.open('login');
  };

  const openAdminRecovery = () => {
    const identity = window.netlifyIdentity;
    if (!identity) {
      alert('Recupero password non disponibile. Ricarica la pagina.');
      return;
    }

    identity.open('recovery');
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch('/.netlify/functions/menu?t=' + new Date().getTime());
        if (!res.ok) {
          console.warn('Remote menu fetch failed with status', res.status, '– using local MENU_DATA.');
          setMenuData(normalizeMenuDataForPiadine(MENU_DATA));
          return;
        }

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.toLowerCase().includes('application/json')) {
          console.warn('Remote menu endpoint did not return JSON. Using local MENU_DATA fallback.');
          setMenuData(normalizeMenuDataForPiadine(MENU_DATA));
          return;
        }

        const parsed = await res.json();
        if (parsed === null) {
          // Blob is empty – first deploy, use local data as-is.
          console.info('Remote menu Blob is empty. Using local MENU_DATA.');
          setMenuData(normalizeMenuDataForPiadine(MENU_DATA));
          return;
        }

        if (isValidRemoteMenuData(parsed)) {
          // Merge: remote categories override local ones by ID; new local categories fill gaps.
          const merged = mergeRemoteWithLocal(parsed);
          setMenuData(normalizeMenuDataForPiadine(merged));
          return;
        }

        console.warn('Remote menu payload is invalid. Using local MENU_DATA fallback.');
        setMenuData(normalizeMenuDataForPiadine(MENU_DATA));
      } catch (err) {
        console.error('Failed to load remote menu', err);
        setMenuData(normalizeMenuDataForPiadine(MENU_DATA));
      }
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    if (!currentCategory) return;
    const synced = menuData.find((cat) => cat.id === currentCategory.id) || null;
    if (!synced) {
      setCurrentCategory(null);
      return;
    }
    if (synced !== currentCategory) {
      setCurrentCategory(synced);
    }
  }, [menuData, currentCategory]);

  const currentCategoryIndex = useMemo(() => {
    if (!currentCategory) return -1;
    return menuData.findIndex((cat) => cat.id === currentCategory.id);
  }, [currentCategory, menuData]);

  const goToPrevCategory = () => {
    if (currentCategoryIndex < 0 || menuData.length === 0) return;
    const prevIndex = (currentCategoryIndex - 1 + menuData.length) % menuData.length;
    setCurrentCategory(menuData[prevIndex]);
    setSearchQuery("");
  };

  const goToNextCategory = () => {
    if (currentCategoryIndex < 0 || menuData.length === 0) return;
    const nextIndex = (currentCategoryIndex + 1) % menuData.length;
    setCurrentCategory(menuData[nextIndex]);
    setSearchQuery("");
  };

  const handleCategoryTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  };

  const handleCategoryTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartXRef.current;
    const dy = touch.clientY - touchStartYRef.current;

    touchStartXRef.current = null;
    touchStartYRef.current = null;

    const horizontalSwipeThreshold = 60;
    const isMostlyHorizontal = Math.abs(dx) > Math.abs(dy) * 1.2;

    if (!isMostlyHorizontal || Math.abs(dx) < horizontalSwipeThreshold) return;

    if (dx < 0) {
      goToNextCategory();
      return;
    }

    goToPrevCategory();
  };

  const goToContactSection = () => {
    setCurrentCategory(null);
    setSearchQuery("");
    window.setTimeout(() => {
      document.getElementById('contattaci')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const logoutAdmin = () => {
    const identity = window.netlifyIdentity;
    if (identity) {
      identity.logout();
      return;
    }
    setIsAuthenticated(false);
    setIsAdminOpen(false);
  };

  // Scroll to top when category changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentCategory]);

  // Handle back button to return to home instead of closing the site
  useEffect(() => {
    const handlePopState = () => {
      if (currentCategory) {
        // If we're viewing a category, go back to home
        setCurrentCategory(null);
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('popstate', handlePopState);
    // Push initial state so back button works
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentCategory]);

  const filteredProducts = useMemo(() => {
    if (!currentCategory) return [];
    if (!searchQuery) return currentCategory.products;
    return currentCategory.products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentCategory, searchQuery]);

  return (
    <div className="min-h-screen pb-0 relative">
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-wood-dark/30 via-wood-dark/10 to-wood-dark/40" />

      <div className="relative z-10">
      <Header 
        onMenuClick={() => setIsSidebarOpen(true)} 
        onBack={() => setCurrentCategory(null)}
        onPrevCategory={goToPrevCategory}
        onNextCategory={goToNextCategory}
        onLogoClick={() => {
          setCurrentCategory(null);
          setSearchQuery("");
        }}
        showBack={!!currentCategory}
        title={currentCategory ? currentCategory.name.toUpperCase() : "DRAGONFLY17"}
      />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        categories={menuData}
        onCategorySelect={setCurrentCategory}
        onContactClick={goToContactSection}
      />

      <AdminPanel
        isOpen={isAdminOpen && isAuthenticated && isAdminRoute}
        onClose={() => setIsAdminOpen(false)}
        categories={menuData}
        onSave={async (nextData) => {
          const normalizedData = normalizeMenuDataForPiadine(nextData);
          setMenuData(normalizedData);
          try {
            const token = await window.netlifyIdentity?.currentUser()?.jwt();
            const res = await fetch('/.netlify/functions/menu', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify(normalizedData)
            });
            if (res.ok) {
              alert('✅ Nuovo menù pubblicato istantaneamente per tutti i clienti!');
            } else {
              let errorMsg = 'Salvataggio Cloud fallito (' + res.status + ')';
              try {
                const errData = await res.json();
                if (errData.error) errorMsg += ': ' + errData.error;
                if (errData.details) errorMsg += '\nDettagli: ' + errData.details;
              } catch (e) {
                // Ignore parse error
              }
              alert('Attenzione: ' + errorMsg + '\n\nSe hai inserito immagini grandi, prova a usare URL invece di caricare dal dispositivo.');
            }
          } catch (e) {
            console.error(e);
            alert('Errore di connessione server durante il salvataggio.');
          }
        }}
        onResetDefaults={() => {
          setMenuData(cloneMenuData(MENU_DATA));
          setCurrentCategory(null);
          setSearchQuery('');
          setIsAdminOpen(false);
        }}
        onLogout={logoutAdmin}
      />

      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      {isAdminRoute && !isAuthenticated && (
        <AdminAccessGate
          isAuthReady={isAuthReady}
          hasIdentity={hasIdentity}
          onOpenLogin={openAdminLogin}
          onOpenRecovery={openAdminRecovery}
        />
      )}

      <main className="pt-16">
        <AnimatePresence mode="wait">
          {!currentCategory ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero onCategorySelect={(id) => setCurrentCategory(menuData.find(c => c.id === id) || null)} />
              <QuickMenuList categories={menuData} onSelect={setCurrentCategory} />
              <CategoryGrid categories={menuData} onSelect={setCurrentCategory} />
              <HomeDomicilioHighlight />
              
              <footer className="mt-0 border-t border-gold/20 bg-gradient-to-b from-wood-dark/90 to-wood-dark/95">
                <div className="px-4 md:px-8 py-3 md:py-3.5 grid grid-cols-[1fr_auto_1fr] items-start gap-4">
                  <div id="contattaci" className="text-left">
                    <a href="#" className="text-[11px] md:text-xs uppercase tracking-[0.14em] text-beige/80 hover:text-gold transition-colors">Contattaci</a>
                    <div className="mt-1.5 text-[11px] md:text-xs text-beige/70 leading-tight space-y-0.5">
                      <p>+39 389 598 1018</p>
                      <p>+39 388 955 5020</p>
                      <p>+39 0825 194 8323</p>
                      <p>diciasettefg@libero.it</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gold/80">
                    <a href="https://www.instagram.com/dragonfly_genuinepub/" className="hover:text-gold transition-colors" aria-label="Instagram">
                      <Instagram className="w-3.5 h-3.5" />
                    </a>
                    <a href="https://www.facebook.com/dragonflylivemusicpub" className="hover:text-gold transition-colors" aria-label="Facebook">
                      <Facebook className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="text-right">
                    <button
                      onClick={() => setIsPrivacyOpen(true)}
                      className="text-[11px] md:text-xs uppercase tracking-[0.16em] text-beige/65 hover:text-gold transition-colors"
                    >
                      Privacy Policy
                    </button>
                    <div className="mt-2 flex items-center justify-end pr-0 md:pr-0 -mr-2 md:-mr-3">
                      <img
                        src="/Scritta_Logo-NoSfondo.webp"
                        alt="Credits logo"
                        loading="lazy"
                        decoding="async"
                        className="h-8 md:h-9 w-auto max-w-[170px] object-contain opacity-100"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>
              </footer>
            </motion.div>
          ) : (
            <motion.div
              key="category"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onTouchStart={handleCategoryTouchStart}
              onTouchEnd={handleCategoryTouchEnd}
              className="px-4 py-6"
            >
              {/* Search Bar */}
              <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/50" />
                <input 
                  type="text" 
                  placeholder="Cerca un piatto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-wood-medium/20 border border-gold/20 rounded-full py-3 pl-12 pr-4 text-cream focus:outline-none focus:border-gold transition-colors"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-5 h-5 text-gold/50" />
                  </button>
                )}
              </div>

              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div key={product.id}>
                    <ProductCard product={product} compactNoImage={!product.image} categoryId={currentCategory.id} />
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <p className="text-beige/50 italic">Nessun prodotto trovato...</p>
                </div>
              )}

              <div className="mt-8 p-4 bg-wood-medium/5 border border-gold/10 rounded-2xl text-center">
                <p className="text-beige/60 text-sm italic">Costo del coperto: <span className="text-gold font-bold">{SERVICE_CHARGE}</span></p>
              </div>

              <button 
                onClick={() => setCurrentCategory(null)}
                className="w-full mt-8 py-4 border border-gold/30 rounded-2xl text-gold font-bold uppercase tracking-widest hover:bg-gold/10 transition-colors"
              >
                Torna al Menu
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      </div>
    </div>
  );
}
