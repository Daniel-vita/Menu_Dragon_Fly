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
import { MENU_DATA, Category, Product, SERVICE_CHARGE } from './data';
import { AdminPanel } from './components/admin/AdminPanel';
import { AdminAccessGate } from './components/admin/AdminAccessGate';
import { cloneMenuData, normalizeMenuDataForPiadine } from './components/admin/adminUtils';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const MENU_STORAGE_KEY = 'dragonfly-menu-data-v1';
const IMAGE_UPLOAD_HELPER_URL = 'https://postimages.org/';
const TAKEAWAY_PHONE_DISPLAY = '0825 194 8323';
const TAKEAWAY_PHONE_HREF = 'tel:+3908251948323';

const withTimeout = <T,>(promise: PromiseLike<T>, ms: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('timeout'));
    }, ms);

    Promise.resolve(promise)
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });

const isValidRemoteMenuData = (value: unknown): value is Category[] =>
  Array.isArray(value) && value.length > 0;

/**
 * Merges remote Blob data with local MENU_DATA.
 * - Categories present in both remote and local → use remote version as-is (admin edits win on every field).
 * - Categories only in local (new categories added in code) → use local fallback.
 * - Categories only in remote (legacy/orphan) → discarded.
 * This ensures admin updates always have priority while still showing newly added
 * local categories when the Blob has not been updated yet.
 */
const mergeRemoteWithLocal = (remoteData: Category[]): Category[] => {
  const localMap = new Map(MENU_DATA.map((cat) => [cat.id, cat]));

  const merged = remoteData.map((remoteCat) => {
    const localCat = localMap.get(remoteCat.id);
    if (!localCat) return remoteCat;

    // If category exists remotely, keep the remote/admin version untouched.
    return remoteCat;
  });

  // Categorie presenti nel codice ma non nel Blob → aggiungile
  MENU_DATA.forEach((localCat) => {
    if (!merged.find((cat) => cat.id === localCat.id)) {
      merged.push(localCat);
    }
  });

  return merged;
};

type DbAddonOption = {
  name: string;
  price: string;
  sort_order: number | null;
};

type DbAddonGroup = {
  id: string;
  name: string;
  sort_order: number | null;
  addon_options?: DbAddonOption[];
};

type DbProductPrice = {
  label: string;
  value: string | null;
  position: number | null;
};

type DbProductAllergen = {
  allergen: string;
  position: number | null;
};

type DbProduct = {
  id: string;
  name: string;
  description: string | null;
  descriptions?: string[] | null;
  price: string | null;
  image: string | null;
  format: string | null;
  vegan: boolean | null;
  sold_out: boolean | null;
  sort_order: number | null;
  product_prices?: DbProductPrice[];
  product_allergens?: DbProductAllergen[];
  addon_groups?: DbAddonGroup[];
};

type DbCategory = {
  id: string;
  name: string;
  icon: string;
  image: string | null;
  sort_order: number | null;
  products?: DbProduct[];
};

const normalizeDescriptions = (descriptions?: Array<string | null | undefined> | null): string[] =>
  (descriptions || [])
    .map((description) => (description || '').trim())
    .filter(Boolean);

const normalizeAddonGroupId = (productId: string, groupId: string): string => `${productId}__${groupId}`;

const denormalizeAddonGroupId = (rawId: string): string => {
  const separator = '__';
  const separatorIndex = rawId.indexOf(separator);
  if (separatorIndex < 0) {
    return rawId;
  }
  return rawId.slice(separatorIndex + separator.length) || rawId;
};

const mapDbToMenuData = (categories: DbCategory[]): Category[] =>
  categories
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((category) => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      image: category.image || '',
      products: (category.products || [])
        .slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description || '',
          descriptions: normalizeDescriptions(product.descriptions),
          price: product.price || undefined,
          image: product.image || '',
          format: product.format || undefined,
          vegan: !!product.vegan,
          soldOut: !!product.sold_out,
          prices: (product.product_prices || [])
            .slice()
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map((entry) => ({
              label: entry.label,
              value: entry.value || undefined,
            })),
          allergens: (product.product_allergens || [])
            .slice()
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map((entry) => entry.allergen),
          addonGroups: (product.addon_groups || [])
            .slice()
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((group) => ({
              id: denormalizeAddonGroupId(group.id),
              name: group.name,
              options: (group.addon_options || [])
                .slice()
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .map((option) => ({
                  name: option.name,
                  price: option.price,
                })),
            })),
        })),
    }));

const fetchMenuFromSupabase = async (): Promise<Category[] | null> => {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('categories')
    .select(`
      id, name, icon, image, sort_order,
      products (
        id, name, description, descriptions, price, image, format, vegan, sold_out, sort_order,
        product_prices ( label, value, position ),
        product_allergens ( allergen, position ),
        addon_groups (
          id, name, sort_order,
          addon_options ( name, price, sort_order )
        )
      )
    `);

  if (error || !data || data.length === 0) {
    return null;
  }

  return mapDbToMenuData(data as DbCategory[]);
};

const syncMenuToSupabase = async (data: Category[]): Promise<{ ok: boolean; error?: string }> => {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, error: 'Supabase non configurato. Imposta VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.' };
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    return { ok: false, error: 'Sessione admin non valida. Effettua nuovamente il login.' };
  }

  const { data: adminRow, error: adminError } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', sessionData.session.user.id)
    .maybeSingle();

  if (adminError || !adminRow) {
    return { ok: false, error: 'Utente autenticato ma non autorizzato come admin.' };
  }

  const categoriesPayload = data.map((category, categoryIndex) => ({
    id: category.id,
    name: category.name,
    icon: category.icon,
    image: category.image || '',
    sort_order: categoryIndex,
  }));

  const productsPayload: Array<Record<string, unknown>> = [];
  const pricesPayload: Array<Record<string, unknown>> = [];
  const allergensPayload: Array<Record<string, unknown>> = [];
  const addonGroupsPayload: Array<Record<string, unknown>> = [];
  const addonOptionsPayload: Array<Record<string, unknown>> = [];

  data.forEach((category, categoryIndex) => {
    category.products.forEach((product, productIndex) => {
      productsPayload.push({
        id: product.id,
        category_id: category.id,
        name: product.name,
        description: product.description || '',
        descriptions: normalizeDescriptions(product.descriptions),
        price: product.price || null,
        image: product.image || '',
        format: product.format || null,
        vegan: !!product.vegan,
        sold_out: !!product.soldOut,
        sort_order: productIndex,
      });

      (product.prices || []).forEach((entry, entryIndex) => {
        pricesPayload.push({
          product_id: product.id,
          label: entry.label,
          value: entry.value || null,
          position: entryIndex,
        });
      });

      (product.allergens || []).forEach((allergen, allergenIndex) => {
        allergensPayload.push({
          product_id: product.id,
          allergen,
          position: allergenIndex,
        });
      });

      (product.addonGroups || []).forEach((group, groupIndex) => {
        const normalizedGroupId = normalizeAddonGroupId(product.id, group.id);
        addonGroupsPayload.push({
          id: normalizedGroupId,
          product_id: product.id,
          name: group.name,
          sort_order: groupIndex,
        });

        (group.options || []).forEach((option, optionIndex) => {
          addonOptionsPayload.push({
            addon_group_id: normalizedGroupId,
            name: option.name,
            price: option.price,
            sort_order: optionIndex,
          });
        });
      });
    });
  });

  const { error: wipeCategoriesError } = await supabase!.from('categories').delete().neq('id', '__none__');
  if (wipeCategoriesError) {
    return { ok: false, error: wipeCategoriesError.message };
  }

  if (categoriesPayload.length > 0) {
    const { error } = await supabase!.from('categories').insert(categoriesPayload);
    if (error) return { ok: false, error: error.message };
  }

  if (productsPayload.length > 0) {
    const { error } = await supabase!.from('products').insert(productsPayload);
    if (error) return { ok: false, error: error.message };
  }

  if (pricesPayload.length > 0) {
    const { error } = await supabase!.from('product_prices').insert(pricesPayload);
    if (error) return { ok: false, error: error.message };
  }

  if (allergensPayload.length > 0) {
    const { error } = await supabase!.from('product_allergens').insert(allergensPayload);
    if (error) return { ok: false, error: error.message };
  }

  if (addonGroupsPayload.length > 0) {
    const { error } = await supabase!.from('addon_groups').insert(addonGroupsPayload);
    if (error) return { ok: false, error: error.message };
  }

  if (addonOptionsPayload.length > 0) {
    const { error } = await supabase!.from('addon_options').insert(addonOptionsPayload);
    if (error) return { ok: false, error: error.message };
  }

  return { ok: true };
};

// --- Image Compression Utility ---
const compressImage = (file: File, maxWidth = 2200, maxHeight = 2200, quality = 0.9): Promise<string> => {
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
        const mimeType = file.type === 'image/png' ? 'image/png' : file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
        resolve(canvas.toDataURL(mimeType, quality));
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
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
  const pricedEntries = (product.prices || []).filter((entry) => !!entry.value?.trim());
  const flavorEntries = (product.prices || []).filter((entry) => !entry.value?.trim());

  const displayPrice =
    product.price ||
    (pricedEntries.length > 0 ? pricedEntries.map((entry) => `${entry.label} ${entry.value}`).join(' / ') : '');
  const hasMultiPrices = pricedEntries.length > 0;
  const showCompactMultiPrices = compactNoImage && hasMultiPrices;

  useEffect(() => {
    setOpenAddonGroupId(null);
  }, [product.id]);

  const addonGroups = product.addonGroups || [];
  const extraDescriptions = Array.isArray(product.descriptions)
    ? product.descriptions.map((description) => description.trim()).filter(Boolean)
    : [];

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

        {extraDescriptions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {extraDescriptions.map((description, i) => (
              <span key={`${description}-${i}`} className="inline-flex items-center gap-1 rounded-full border border-gold/25 bg-wood-dark/50 px-3 py-1 text-xs font-semibold text-beige/90">
                {description}
              </span>
            ))}
          </div>
        )}

        {showCompactMultiPrices && (
          <div className="flex flex-wrap gap-2 mt-3">
            {pricedEntries.map((p, i) => (
              <div key={i} className="flex flex-col items-center bg-wood-dark/50 border border-gold/20 rounded-xl px-3 py-1 min-w-[72px]">
                <span className="text-[10px] text-gold/60 uppercase font-bold">{p.label}</span>
                <span className="text-cream font-bold">{p.value}</span>
              </div>
            ))}
          </div>
        )}

        {flavorEntries.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {flavorEntries.map((flavor, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full border border-gold/25 bg-wood-dark/50 px-3 py-1 text-xs font-semibold text-beige/90">
                {flavor.label}
              </span>
            ))}
          </div>
        )}

        {addonGroups.length > 0 && (
          <div className="mt-4 rounded-xl border border-gold/30 bg-gradient-to-br from-wood-dark/60 to-wood-medium/20 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent flex-1" />
              <p className="text-[10px] text-gold uppercase font-black tracking-[0.2em] px-2">Aggiunte e Variazioni</p>
              <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent flex-1" />
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2">
              {addonGroups.map((group) => (
                <div key={group.id} className="space-y-1">
                  <button
                    onClick={() => setOpenAddonGroupId((prev) => (prev === group.id ? null : group.id))}
                    className={`w-full px-3 py-2 text-xs uppercase tracking-wider font-bold rounded-xl border transition-all duration-300 flex items-center justify-between ${
                      openAddonGroupId === group.id
                        ? 'border-gold text-gold bg-gold/15'
                        : 'border-gold/30 text-cream bg-wood-dark/70'
                    }`}
                  >
                    <span>{group.name}</span>
                    <span className="text-base leading-none font-light">{openAddonGroupId === group.id ? '−' : '+'}</span>
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
                  <div className="bg-black/40 rounded-xl p-3 border border-gold/20 mt-2">
                    <p className="text-[10px] text-gold uppercase font-black mb-2 tracking-[0.15em] border-b border-gold/20 pb-1.5">
                      {addonGroups.find((g) => g.id === openAddonGroupId)?.name}
                    </p>
                    <div className="grid gap-1.5">
                      {(addonGroups.find((g) => g.id === openAddonGroupId)?.options || []).map((opt, i) => (
                        <div key={i} className="flex items-center justify-between text-sm py-0.5">
                          <span className="text-white font-medium">{opt.name}</span>
                          <span className="text-gold font-bold bg-gold/10 px-2 py-0.5 rounded-md text-xs">{opt.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              className="w-full h-full object-cover"
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

        {extraDescriptions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {extraDescriptions.map((description, i) => (
              <span key={`${description}-${i}`} className="inline-flex items-center gap-1 rounded-full border border-gold/25 bg-wood-dark/50 px-3 py-1 text-xs font-semibold text-beige/90">
                {description}
              </span>
            ))}
          </div>
        )}
        
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

        {pricedEntries.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {pricedEntries.map((p, i) => (
              <div key={i} className="flex flex-col items-center bg-wood-dark/50 border border-gold/20 rounded-xl px-3 py-1 min-w-[60px]">
                <span className="text-[10px] text-gold/60 uppercase font-bold">{p.label}</span>
                <span className="text-cream font-bold">{p.value}</span>
              </div>
            ))}
          </div>
        )}
        {flavorEntries.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {flavorEntries.map((flavor, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full border border-gold/25 bg-wood-dark/50 px-3 py-1 text-xs font-semibold text-beige/90">
                {flavor.label}
              </span>
            ))}
          </div>
        )}

        {addonGroups.length > 0 && (
          <div className="mt-5 rounded-2xl border border-gold/40 bg-gradient-to-br from-wood-dark/70 to-wood-medium/30 p-4 shadow-inner">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent flex-1" />
              <p className="text-xs text-gold uppercase font-black tracking-[0.2em] px-2">Aggiunte e Variazioni</p>
              <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent flex-1" />
            </div>
            
            <div className="grid gap-2 sm:grid-cols-2 mb-3">
              {addonGroups.map((group) => (
                <div key={group.id} className="space-y-1">
                  <button
                    onClick={() => setOpenAddonGroupId((prev) => (prev === group.id ? null : group.id))}
                    className={`w-full px-3 py-2 text-xs md:text-sm uppercase tracking-wider font-bold rounded-xl border transition-all duration-300 flex items-center justify-between ${
                      openAddonGroupId === group.id
                        ? 'border-gold text-gold bg-gold/15 shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                        : 'border-gold/30 text-cream hover:border-gold/60 hover:text-white bg-wood-dark/80 hover:bg-wood-dark/90'
                    }`}
                  >
                    <span>{group.name}</span>
                    <span className="text-lg leading-none font-light">{openAddonGroupId === group.id ? '−' : '+'}</span>
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
                  <div className="bg-black/40 rounded-xl p-4 border border-gold/20 shadow-inner mt-2">
                    <p className="text-[11px] text-gold uppercase font-black mb-3 tracking-[0.15em] border-b border-gold/20 pb-2">
                      Scegli da: {addonGroups.find((group) => group.id === openAddonGroupId)?.name}
                    </p>
                    <div className="grid gap-2">
                      {(addonGroups.find((group) => group.id === openAddonGroupId)?.options || []).map((option, i) => (
                        <div key={i} className="flex items-center justify-between text-base py-1">
                          <span className="text-white font-medium">{option.name}</span>
                          <span className="text-gold font-bold bg-gold/10 px-2 py-0.5 rounded-md text-sm">{option.price}</span>
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
          <div className="mt-5 rounded-2xl border border-gold/40 bg-gradient-to-br from-wood-dark/70 to-wood-medium/30 p-4 shadow-inner">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent flex-1" />
              <p className="text-xs text-gold uppercase font-black tracking-[0.2em] px-2">Aggiunte Extra</p>
              <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent flex-1" />
            </div>
            
            <div className="grid gap-2">
              {product.addons.map((addon, i) => (
                <div key={i} className="flex items-center justify-between text-base border-b border-wood-light/10 pb-2 last:border-0 last:pb-0">
                  <span className="text-white font-medium">{addon.name}</span>
                  <span className="text-gold font-bold bg-gold/10 px-2 py-0.5 rounded-md text-sm">{addon.price}</span>
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
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState("");
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const normalizedPath =
    typeof window !== 'undefined' ? window.location.pathname.replace(/\/+$/, '') || '/' : '';

  const isAdminRoute = typeof window !== 'undefined' && normalizedPath === '/peppoo7';
  const isSupabaseReady = isSupabaseConfigured();

  const verifyAdmin = async (): Promise<boolean> => {
    if (!supabase) {
      return false;
    }

    try {
      const { data: sessionData, error: sessionError } = await withTimeout(supabase.auth.getSession(), 7000);
      if (sessionError || !sessionData.session) {
        return false;
      }

      const { data: adminRow, error: adminError } = await withTimeout(
        supabase
          .from('admins')
          .select('id')
          .eq('user_id', sessionData.session.user.id)
          .maybeSingle(),
        7000
      );

      return !adminError && !!adminRow;
    } catch (error) {
      console.error('verifyAdmin failed', error);
      return false;
    }
  };

  useEffect(() => {
    if (!isSupabaseReady || !supabase) {
      setIsAuthReady(true);
      setIsAuthenticated(false);
      return;
    }

    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // Timeout di emergenza: se Supabase non risponde entro 5 secondi, sblocca comunque il gate.
    timeoutId = setTimeout(() => {
      if (isMounted && !isAuthReady) {
        setIsAuthReady(true);
      }
    }, 5000);

    const bootstrapAuth = async () => {
      const isAdmin = await verifyAdmin();
      if (!isMounted) {
        return;
      }

      setIsAuthenticated(isAdmin);
      setIsAuthReady(true);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (isAdminRoute) {
        setIsAdminOpen(isAdmin);
      }
    };

    bootstrapAuth();

    const { data: listener } = supabase!.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) {
        return;
      }

      if (!session) {
        setIsAuthenticated(false);
        setIsAdminOpen(false);
        return;
      }

      let isAdmin = false;
      try {
        const { data: adminRow, error: adminError } = await withTimeout(
          supabase!
            .from('admins')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle(),
          7000
        );
        isAdmin = !adminError && !!adminRow;
      } catch (error) {
        console.error('onAuthStateChange admin check failed', error);
        isAdmin = false;
      }

      if (!isMounted) {
        return;
      }

      setIsAuthenticated(isAdmin);
      if (isAdminRoute) {
        setIsAdminOpen(isAdmin);
      }
    });

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      listener.subscription.unsubscribe();
    };
  }, [isAdminRoute, isSupabaseReady]);

  const openAdminLogin = async () => {
    if (!isSupabaseReady || !supabase) {
      alert('Supabase non configurato. Imposta VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
      return;
    }

    if (!adminEmail || !adminPassword) {
      alert('Inserisci email e password.');
      return;
    }

    setIsAuthLoading(true);
    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({ email: adminEmail, password: adminPassword }),
        10000
      );
      if (error) {
        alert(`Login fallito: ${error.message}`);
        return;
      }

      const isAdmin = await withTimeout(verifyAdmin(), 7000).catch(() => false);
      if (!isAdmin) {
        await supabase.auth.signOut();
        alert('Utente autenticato ma non autorizzato come admin, oppure verifica admin in timeout. Controlla la tabella admins su Supabase.');
        return;
      }

      setIsAuthenticated(true);
      setIsAdminOpen(true);
    } catch (error) {
      console.error('openAdminLogin failed', error);
      alert('Errore di connessione durante il login admin. Riprova tra qualche secondo.');
    } finally {
      setIsAuthLoading(false);
      setIsAuthReady(true);
    }
  };

  const openAdminRecovery = async () => {
    if (!isSupabaseReady || !supabase) {
      alert('Supabase non configurato.');
      return;
    }

    if (!adminEmail) {
      alert('Inserisci prima la tua email admin.');
      return;
    }

    const { error } = await supabase!.auth.resetPasswordForEmail(adminEmail, {
      redirectTo: `${window.location.origin}/peppoo7`,
    });

    if (error) {
      alert('Invio email di recupero fallito.');
      return;
    }

    alert('Email di recupero inviata. Controlla la tua casella di posta.');
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const remoteMenu = await fetchMenuFromSupabase();
        if (remoteMenu && isValidRemoteMenuData(remoteMenu)) {
          const merged = mergeRemoteWithLocal(remoteMenu);
          setMenuData(normalizeMenuDataForPiadine(merged));
          return;
        }

        setMenuData(normalizeMenuDataForPiadine(MENU_DATA));
      } catch (err) {
        console.error('Failed to load remote menu from Supabase', err);
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
    if (supabase) {
      supabase.auth.signOut();
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

  const showAdminLauncher = isAdminRoute && isAuthenticated && !isAdminOpen;

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
          const result = await syncMenuToSupabase(normalizedData);

          if (result.ok) {
            alert('✅ Nuovo menù pubblicato istantaneamente per tutti i clienti!');
          } else {
            alert(`Attenzione: salvataggio cloud fallito. ${result.error || ''}`);
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
          isSupabaseReady={isSupabaseReady}
          email={adminEmail}
          password={adminPassword}
          onEmailChange={setAdminEmail}
          onPasswordChange={setAdminPassword}
          onLogin={openAdminLogin}
          onOpenRecovery={openAdminRecovery}
          isLoading={isAuthLoading}
        />
      )}

      {showAdminLauncher && (
        <div className="fixed bottom-4 right-4 z-[86] flex gap-2">
          <button
            onClick={() => setIsAdminOpen(true)}
            className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold uppercase tracking-wider text-wood-dark shadow-lg hover:bg-accent-orange transition-colors"
          >
            Apri Admin
          </button>
          <button
            onClick={logoutAdmin}
            className="rounded-xl border border-gold/30 bg-wood-dark/80 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-beige hover:text-gold transition-colors"
          >
            Logout
          </button>
        </div>
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
