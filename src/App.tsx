/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
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

const MENU_STORAGE_KEY = 'dragonfly-menu-data-v1';
const IMAGE_UPLOAD_HELPER_URL = 'https://postimages.org/';

const cloneMenuData = (data: Category[]): Category[] => JSON.parse(JSON.stringify(data));

const createId = (prefix: string): string => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

type NetlifyIdentityApi = {
  init: () => void;
  on: (event: string, callback: (user?: unknown) => void) => void;
  currentUser: () => unknown | null;
  open: (panel?: string) => void;
  logout: () => void;
};

declare global {
  interface Window {
    netlifyIdentity?: NetlifyIdentityApi;
  }
}

// --- Components ---

const Header = ({ 
  onMenuClick, 
  onBack, 
  onPrevCategory,
  onNextCategory,
  onLogoClick,
  showBack = false, 
  title = "DRAGONFLY" 
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
          src="/dragonfly-logo.png"
          alt="Dragonfly Live Music Pub"
          className="h-10 md:h-11 w-auto object-contain"
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
    
    <div className="absolute right-[10px] md:right-[14px] top-1/2 -translate-y-1/2 flex items-center justify-end w-[88px]">
      {showBack ? (
        <button
          onClick={onLogoClick}
          className="p-1 hover:bg-wood-light/20 rounded-lg transition-colors"
          aria-label="Torna alla home"
        >
          <img
            src="/dragonfly-logo.png"
            alt="Dragonfly logo"
            className="h-[64px] md:h-[72px] w-auto object-contain"
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
  <section className="relative -mt-16 h-[60vh] md:h-[68vh] w-full overflow-hidden">
    <img 
      src="/dragonfly-hero.webp"
      alt="Dragon Fly Pub Atmosphere" 
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
          <img 
            src={cat.image} 
            alt={cat.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
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
          className="whitespace-nowrap px-4 py-2 rounded-full border border-gold/30 text-beige hover:bg-gold hover:text-wood-dark transition-all text-sm font-medium"
        >
          {cat.name}
        </button>
      ))}
    </div>
  </section>
);

const ProductCard = ({ product }: { product: Product }) => {
  const [showAllergens, setShowAllergens] = useState(false);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-wood-medium/10 rounded-3xl overflow-hidden card-shadow mb-6 border border-wood-light/10"
    >
      <div className="relative aspect-[4/3] w-full">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
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
              title="Allergenici"
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
                <p className="text-[10px] text-gold uppercase font-bold mb-2 tracking-widest">Allergenici:</p>
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
      </div>
    </motion.div>
  );
};

const Sidebar = ({ isOpen, onClose, categories, onCategorySelect, onContactClick }: { isOpen: boolean; onClose: () => void; categories: Category[]; onCategorySelect: (cat: Category) => void; onContactClick: () => void }) => (
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
            <h2 className="vintage-title text-2xl text-gold uppercase tracking-wider">Dragonfly</h2>
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
            <button
              onClick={() => {
                onContactClick();
                onClose();
              }}
              className="w-full flex items-center gap-4 text-lg text-beige hover:text-gold transition-colors text-left"
            >
              <Phone className="w-5 h-5" /> Prenota Tavolo
            </button>
            <a href="https://maps.app.goo.gl/3bNHBbaiWMwcgMGdA" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-lg text-beige hover:text-gold transition-colors">
              <MapPin className="w-5 h-5" /> Dove Siamo
            </a>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-[10px] text-beige/40 uppercase tracking-widest">© 2026 Dragonfly Live Music Pub</p>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

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

  const updateCategoryField = (field: 'name' | 'image', value: string) => {
    setDraft((prev) => prev.map((cat) => (cat.id === selectedCategoryId ? { ...cat, [field]: value } : cat)));
  };

  const updateProductField = (productId: string, field: keyof Product, value: string) => {
    setDraft((prev) =>
      prev.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;
        return {
          ...cat,
          products: cat.products.map((product) => {
            if (product.id !== productId) return product;

            if (field === 'allergens') {
              const allergens = value
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
      image: '/dragonfly-hero.webp',
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

    const newProduct: Product = {
      id: createId('prod'),
      name: 'Nuovo Prodotto',
      description: 'Descrizione prodotto',
      price: '0.00€',
      image: '/dragonfly-hero.webp',
      allergens: [],
    };

    setDraft((prev) =>
      prev.map((cat) => (cat.id === selectedCategoryId ? { ...cat, products: [...cat.products, newProduct] } : cat))
    );
  };

  const deleteProduct = (productId: string) => {
    setDraft((prev) =>
      prev.map((cat) =>
        cat.id === selectedCategoryId
          ? { ...cat, products: cat.products.filter((product) => product.id !== productId) }
          : cat
      )
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
                      className="bg-wood-medium/20 border border-gold/20 rounded-lg px-3 py-2 text-beige"
                      placeholder="Nome categoria"
                    />
                    <input
                      value={selectedCategory.image}
                      onChange={(event) => updateCategoryField('image', event.target.value)}
                      className="bg-wood-medium/20 border border-gold/20 rounded-lg px-3 py-2 text-beige"
                      placeholder="URL immagine categoria"
                    />
                    <a
                      href={IMAGE_UPLOAD_HELPER_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="md:col-span-2 text-xs text-gold/80 hover:text-gold transition-colors"
                    >
                      Carica immagine e incolla URL
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-widest text-gold/70">Prodotti ({selectedCategory.products.length})</p>
                    <button onClick={addProduct} className="px-3 py-2 border border-gold/30 rounded-lg text-gold text-sm hover:bg-gold/10 transition-colors">
                      + Prodotto
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedCategory.products.map((product) => (
                      <div key={product.id} className="border border-gold/15 rounded-xl p-3 md:p-4 bg-wood-medium/10 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-gold text-sm uppercase tracking-wider">{product.name}</p>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="px-2 py-1 text-xs border border-red-300/40 rounded-md text-red-200 hover:bg-red-500/10 transition-colors"
                          >
                            Elimina
                          </button>
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
                        <div className="grid md:grid-cols-3 gap-2">
                          <input
                            value={product.price || ''}
                            onChange={(event) => updateProductField(product.id, 'price', event.target.value)}
                            className="bg-wood-dark/40 border border-gold/15 rounded-lg px-3 py-2 text-beige"
                            placeholder="Prezzo (es. 8.50€)"
                          />
                          <input
                            value={product.image}
                            onChange={(event) => updateProductField(product.id, 'image', event.target.value)}
                            className="md:col-span-2 bg-wood-dark/40 border border-gold/15 rounded-lg px-3 py-2 text-beige"
                            placeholder="URL foto prodotto"
                          />
                          <a
                            href={IMAGE_UPLOAD_HELPER_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="md:col-span-3 text-xs text-gold/80 hover:text-gold transition-colors"
                          >
                            Carica foto prodotto e incolla URL
                          </a>
                        </div>
                        <input
                          value={product.allergens?.join(', ') || ''}
                          onChange={(event) => updateProductField(product.id, 'allergens', event.target.value)}
                          className="w-full bg-wood-dark/40 border border-gold/15 rounded-lg px-3 py-2 text-beige"
                          placeholder="Allergeni separati da virgola"
                        />
                      </div>
                    ))}
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
}: {
  isAuthReady: boolean;
  hasIdentity: boolean;
  onOpenLogin: () => void;
}) => (
  <div className="fixed inset-0 z-[85] bg-black/75 backdrop-blur-sm flex items-center justify-center px-4">
    <div className="w-full max-w-md rounded-2xl border border-gold/25 bg-wood-dark p-6 md:p-7 card-shadow">
      <h2 className="vintage-title text-2xl text-gold mb-3">Accesso Admin</h2>
      <p className="text-beige/80 text-sm leading-relaxed mb-5">
        Inserisci email e password tramite il login Netlify per entrare nel pannello di gestione menu.
      </p>

      {hasIdentity ? (
        <button
          onClick={onOpenLogin}
          className="w-full rounded-xl bg-gold text-wood-dark py-3 font-semibold uppercase tracking-wider text-sm hover:bg-accent-orange transition-colors"
          disabled={!isAuthReady}
        >
          {isAuthReady ? 'Apri Login' : 'Caricamento...'}
        </button>
      ) : (
        <div className="rounded-xl border border-red-300/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          Login non disponibile: il widget Netlify Identity non e stato caricato.
        </div>
      )}

      <p className="mt-4 text-xs text-beige/55">
        Se hai chiuso il popup o non compare il campo password, premi di nuovo "Apri Login".
      </p>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [menuData, setMenuData] = useState<Category[]>(MENU_DATA);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedPath =
    typeof window !== 'undefined' ? window.location.pathname.replace(/\/+$/, '') || '/' : '';

  const authHashParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.hash.replace(/^#/, '')) : null;
  const authQueryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const hasInviteToken = !!(
    authHashParams?.get('invite_token') ||
    authQueryParams?.get('invite_token') ||
    authHashParams?.get('confirmation_token') ||
    authQueryParams?.get('confirmation_token')
  );
  const hasRecoveryToken = !!(authHashParams?.get('recovery_token') || authQueryParams?.get('recovery_token'));

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
      identity.init();
      setIsAuthenticated(!!identity.currentUser());
      console.log('Netlify Identity initialized successfully');
    } catch (err) {
      console.error('Failed to initialize Netlify Identity:', err);
    }
    setIsAuthReady(true);

    if (hasInviteToken) {
      identity.open('signup');
    }
    if (hasRecoveryToken) {
      identity.open('recovery');
    }

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
  }, [isAdminRoute, hasInviteToken, hasRecoveryToken]);

  useEffect(() => {
    if (!isAuthReady || !isAdminRoute || isAuthenticated || hasInviteToken || hasRecoveryToken) return;
    const identity = window.netlifyIdentity;
    identity?.open('login');
  }, [isAuthReady, isAdminRoute, isAuthenticated, hasInviteToken, hasRecoveryToken]);

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MENU_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setMenuData(parsed);
      }
    } catch {
      // Keep defaults if storage is invalid.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menuData));
  }, [menuData]);

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
        title={currentCategory ? currentCategory.name.toUpperCase() : "DRAGONFLY"}
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
        onSave={(nextData) => setMenuData(nextData)}
        onResetDefaults={() => {
          setMenuData(cloneMenuData(MENU_DATA));
          setCurrentCategory(null);
          setSearchQuery('');
          setIsAdminOpen(false);
        }}
        onLogout={logoutAdmin}
      />

      {isAdminRoute && !isAuthenticated && (
        <AdminAccessGate
          isAuthReady={isAuthReady}
          hasIdentity={hasIdentity}
          onOpenLogin={openAdminLogin}
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
              
              <footer className="mt-0 border-t border-gold/20 bg-gradient-to-b from-wood-dark/90 to-wood-dark/95">
                <div className="px-4 md:px-8 py-3 md:py-3.5 grid grid-cols-[1fr_auto_1fr] items-start gap-4">
                  <div id="contattaci" className="text-left">
                    <a href="#" className="text-[11px] md:text-xs uppercase tracking-[0.14em] text-beige/80 hover:text-gold transition-colors">Contattaci</a>
                    <div className="mt-1.5 text-[11px] md:text-xs text-beige/70 leading-tight space-y-0.5">
                      <p>+39 389 598 1018</p>
                      <p>+39 333 123 4567</p>
                      <p>info@dragonflypub.it</p>
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
                    <a href="#" className="text-[11px] md:text-xs uppercase tracking-[0.16em] text-beige/65 hover:text-gold transition-colors">Credits</a>
                    <div className="mt-2 flex items-center justify-end pr-0 md:pr-0 -mr-2 md:-mr-3">
                      <img
                        src="/Scritta_Logo-NoSfondo.webp"
                        alt="Credits logo"
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
                    <ProductCard product={product} />
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
