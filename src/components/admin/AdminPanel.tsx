import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, ChevronUp, ChevronDown, Plus, Trash2, Tag, Image, AlignLeft, Package, Settings2, Save, RotateCcw, LogOut, ChevronRight, ChevronDown as ChevronDownIcon } from 'lucide-react';
import { Category, Product, ProductAddon, ProductAddonGroup } from '../../data';
import { CATEGORY_IMAGE_FOLDERS } from '../../data';
import { cloneMenuData, createId, getDefaultAddonGroups, compressImage } from './adminUtils';

type AdminPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSave: (nextData: Category[]) => void;
  onResetDefaults: () => void;
  onLogout: () => void;
};

// ─── Section Accordion ────────────────────────────────────────────────────────
const Section = ({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-gold/15 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-wood-medium/10 hover:bg-wood-medium/20 transition-colors"
      >
        <div className="flex items-center gap-2 text-gold/90 text-xs uppercase tracking-widest font-semibold">
          {icon}
          {title}
        </div>
        {open ? (
          <ChevronDownIcon className="w-4 h-4 text-gold/50" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gold/50" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Field Label ──────────────────────────────────────────────────────────────
const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[10px] uppercase tracking-widest text-gold/55 mb-1">{children}</label>
);

// ─── Input styles ─────────────────────────────────────────────────────────────
const inputCls =
  'w-full bg-wood-dark/50 border border-gold/15 rounded-lg px-3 py-2 text-beige text-sm placeholder:text-beige/30 focus:outline-none focus:border-gold/40 transition-colors';

// ─── Description List ────────────────────────────────────────────────────────
const DescriptionList = ({
  descriptions,
  onChange,
}: {
  descriptions: string[];
  onChange: (next: string[]) => void;
}) => {
  const addDescription = () => {
    onChange([...descriptions, '']);
  };

  const updateDescription = (index: number, value: string) => {
    const next = [...descriptions];
    next[index] = value;
    onChange(next);
  };

  const removeDescription = (index: number) => {
    onChange(descriptions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2 rounded-lg border border-gold/15 bg-wood-dark/45 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-widest text-gold/55">Descrizioni aggiuntive</p>
        <button
          type="button"
          onClick={addDescription}
          className="flex items-center gap-1 rounded-lg border border-gold/25 bg-gold/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold hover:bg-gold/20 transition-colors"
        >
          <Plus className="w-3 h-3" /> Aggiungi
        </button>
      </div>

      {descriptions.length === 0 ? (
        <p className="text-xs text-beige/45 italic">Nessuna descrizione aggiuntiva. Premi “Aggiungi” per inserirne una.</p>
      ) : (
        <div className="space-y-2">
          {descriptions.map((description, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-[11px] font-bold text-gold">
                {index + 1}
              </span>
              <input
                value={description}
                onChange={(event) => updateDescription(index, event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addDescription();
                  }
                }}
                className={inputCls}
                placeholder={index === 0 ? 'Es. Limone' : 'Es. Pesca'}
              />
              <button
                type="button"
                onClick={() => removeDescription(index)}
                className="rounded-lg border border-red-400/25 bg-red-500/10 p-2 text-red-200 hover:bg-red-500/20 transition-colors"
                aria-label={`Rimuovi descrizione ${index + 1}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({
  product, index, total, selectedCategoryId, isPiadineCategory,
  onUpdate, onDelete, onMove, onAddAddon, onUpdateAddon, onDeleteAddon,
  addonGroupsFallback,
}: {
  product: Product;
  index: number;
  total: number;
  selectedCategoryId: string;
  isPiadineCategory: boolean;
  addonGroupsFallback: ProductAddonGroup[];
  onUpdate: (field: keyof Product, value: any) => void;
  onDelete: () => void;
  onMove: (dir: 'up' | 'down') => void;
  onAddAddon: (groupId: string) => void;
  onUpdateAddon: (groupId: string, optionIndex: number, field: keyof ProductAddon, value: string) => void;
  onDeleteAddon: (groupId: string, optionIndex: number) => void;
}) => {
  const [expanded, setExpanded] = useState(true);

  const descriptions: string[] = Array.isArray((product as any).descriptions)
    ? (product as any).descriptions.map((item: string) => item ?? '')
    : [];
  const addonGroups = product.addonGroups?.length ? product.addonGroups : addonGroupsFallback;

  const handleDescriptionsChange = (next: string[]) => {
    onUpdate('descriptions' as keyof Product, next);
  };

  return (
    <div className="border border-gold/15 rounded-2xl overflow-hidden bg-wood-dark/20 shadow-md">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-wood-medium/10 border-b border-gold/10">
        <div className="flex flex-col gap-0.5">
          <button onClick={() => onMove('up')} disabled={index === 0} className="text-gold/40 hover:text-gold disabled:opacity-20 transition-colors">
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onMove('down')} disabled={index === total - 1} className="text-gold/40 hover:text-gold disabled:opacity-20 transition-colors">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold shrink-0">
          {index + 1}
        </span>

        <button onClick={() => setExpanded((v) => !v)} className="flex-1 text-left text-sm font-semibold text-beige/90 truncate hover:text-gold transition-colors">
          {product.name || 'Nuovo Prodotto'}
        </button>

        <div className="flex items-center gap-1.5 ml-auto">
          {product.soldOut && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 text-[10px] uppercase tracking-wide">Esaurito</span>
          )}
          {product.vegan && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] uppercase tracking-wide">Vegan</span>
          )}
          <button onClick={() => setExpanded((v) => !v)} className="p-1.5 rounded-lg text-gold/50 hover:text-gold hover:bg-gold/10 transition-colors">
            {expanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <button onClick={onDelete} disabled={isPiadineCategory && total === 1} className="p-1.5 rounded-lg text-red-400/60 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Nome */}
              <div>
                <FieldLabel>Nome prodotto</FieldLabel>
                <input
                  value={product.name}
                  onChange={(e) => onUpdate('name', e.target.value)}
                  className={inputCls}
                  placeholder="Nome prodotto"
                />
              </div>

              {/* Descrizioni */}
              <Section title="Descrizioni" icon={<Tag className="w-3.5 h-3.5" />}>
                <FieldLabel>Descrizione base</FieldLabel>
                <textarea
                  value={product.description || ''}
                  onChange={(e) => onUpdate('description', e.target.value)}
                  className={inputCls + ' min-h-[92px]'}
                  placeholder="Descrizione principale del prodotto"
                />
                <DescriptionList descriptions={descriptions} onChange={handleDescriptionsChange} />
                <p className="text-[10px] text-beige/35 mt-1">
                  Premi <kbd className="bg-wood-medium/30 px-1 py-0.5 rounded text-[10px]">Invio</kbd> per aggiungerne una nuova riga.
                </p>
              </Section>

              {/* Prezzo */}
              <Section title="Prezzo" icon={<Tag className="w-3.5 h-3.5" />}>
                <FieldLabel>Prezzo unico</FieldLabel>
                <input
                  value={product.price || ''}
                  onChange={(e) => { onUpdate('price', e.target.value); onUpdate('prices', undefined); }}
                  className={inputCls}
                  placeholder="Es. 8.50€"
                  disabled={!!product.prices?.length}
                />

                <div className="mt-3 pt-3 border-t border-gold/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <FieldLabel>Formati multipli (es. cl)</FieldLabel>
                    <button
                      onClick={() => {
                        const currentPrices = product.prices || [];
                        onUpdate('prices', [...currentPrices, { label: '33cl', value: '5.00€' }]);
                        onUpdate('price', undefined);
                      }}
                      className="flex items-center gap-1 px-2 py-1 bg-gold/10 text-gold text-xs rounded-lg border border-gold/20 hover:bg-gold/20 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Formato
                    </button>
                  </div>
                  {product.prices?.map((p, pIndex) => (
                    <div key={pIndex} className="flex gap-2 items-center">
                      <input
                        value={p.label}
                        onChange={(e) => {
                          const newPrices = [...(product.prices || [])];
                          newPrices[pIndex] = { ...newPrices[pIndex], label: e.target.value };
                          onUpdate('prices', newPrices);
                        }}
                        className="w-1/3 bg-wood-dark/50 border border-gold/15 rounded-lg px-2 py-1.5 text-beige text-xs focus:outline-none focus:border-gold/40"
                        placeholder="33cl"
                      />
                      <input
                        value={p.value}
                        onChange={(e) => {
                          const newPrices = [...(product.prices || [])];
                          newPrices[pIndex] = { ...newPrices[pIndex], value: e.target.value };
                          onUpdate('prices', newPrices);
                        }}
                        className="flex-1 bg-wood-dark/50 border border-gold/15 rounded-lg px-2 py-1.5 text-beige text-xs focus:outline-none focus:border-gold/40"
                        placeholder="5.00€"
                      />
                      <button
                        onClick={() => {
                          const newPrices = (product.prices || []).filter((_, i) => i !== pIndex);
                          onUpdate('prices', newPrices.length ? newPrices : undefined);
                        }}
                        className="text-red-400/70 p-1 rounded hover:bg-red-500/15 hover:text-red-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Dettagli */}
              <Section title="Dettagli" icon={<Package className="w-3.5 h-3.5" />} defaultOpen={false}>
                <FieldLabel>Formato (es. 33cl, 50cl)</FieldLabel>
                <input value={product.format || ''} onChange={(e) => onUpdate('format', e.target.value)} className={inputCls} placeholder="Formato" />

                <FieldLabel>Allergeni (separati da virgola)</FieldLabel>
                <input value={product.allergens?.join(', ') || ''} onChange={(e) => onUpdate('allergens', e.target.value)} className={inputCls} placeholder="Es. glutine, latticini" />

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <label className="flex items-center gap-2 rounded-lg border border-gold/15 bg-wood-dark/30 px-3 py-2 text-beige text-xs cursor-pointer hover:bg-wood-dark/50 transition-colors">
                    <input type="checkbox" checked={!!product.vegan} onChange={(e) => onUpdate('vegan', e.target.checked)} className="h-3.5 w-3.5 accent-emerald-500" />
                    🌿 Vegano
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-900/10 px-3 py-2 text-red-100 text-xs cursor-pointer hover:bg-red-900/20 transition-colors">
                    <input type="checkbox" checked={!!product.soldOut} onChange={(e) => onUpdate('soldOut', e.target.checked)} className="h-3.5 w-3.5 accent-red-500" />
                    ⚠️ Esaurito
                  </label>
                </div>
              </Section>

              {/* Immagine */}
              <Section title="Immagine" icon={<Image className="w-3.5 h-3.5" />} defaultOpen={false}>
                {CATEGORY_IMAGE_FOLDERS[selectedCategoryId]?.length > 0 && (
                  <div>
                    <FieldLabel>Seleziona dalla cartella</FieldLabel>
                    <select value={product.image} onChange={(e) => onUpdate('image', e.target.value)} className={inputCls}>
                      <option value="">-- Scegli immagine --</option>
                      {CATEGORY_IMAGE_FOLDERS[selectedCategoryId].map((img) => (
                        <option key={img} value={img}>{img.split('/').pop() || ''}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <FieldLabel>Carica file</FieldLabel>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const compressed = await compressImage(file, 1400, 1400, 0.82);
                        onUpdate('image', compressed);
                      } catch { alert("Errore durante l'elaborazione dell'immagine."); }
                    }}
                    className="text-xs text-beige file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gold file:text-wood-dark hover:file:bg-accent-orange transition-colors"
                  />
                </div>
                <div>
                  <FieldLabel>URL immagine</FieldLabel>
                  <input value={product.image} onChange={(e) => onUpdate('image', e.target.value)} className={inputCls} placeholder="https://…" />
                </div>
                {product.image && (
                  <div className="rounded-xl border border-gold/15 overflow-hidden h-32">
                    <img src={product.image} alt={`Anteprima ${product.name}`} className="w-full h-full object-cover" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                  </div>
                )}
              </Section>

              {/* Addons */}
              {addonGroups.length > 0 && (
                <Section title={`Aggiunte (${addonGroups.length} menu)`} icon={<Settings2 className="w-3.5 h-3.5" />} defaultOpen={false}>
                  {addonGroups.map((group) => (
                    <div key={group.id} className="rounded-lg border border-gold/10 bg-wood-dark/20 p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-xs uppercase tracking-wider text-gold/70">{group.name}</p>
                        <button onClick={() => onAddAddon(group.id)} className="flex items-center gap-1 px-2 py-1 bg-gold/10 text-gold text-[11px] rounded border border-gold/20 hover:bg-gold/20 transition-colors">
                          <Plus className="w-3 h-3" /> Aggiunta
                        </button>
                      </div>
                      {group.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex gap-2 items-center">
                          <input value={option.name} onChange={(e) => onUpdateAddon(group.id, optionIndex, 'name', e.target.value)} className="flex-1 bg-wood-dark/40 border border-gold/15 rounded-lg px-2 py-1.5 text-beige text-xs focus:outline-none focus:border-gold/35" placeholder="Nome aggiunta" />
                          <input value={option.price} onChange={(e) => onUpdateAddon(group.id, optionIndex, 'price', e.target.value)} className="w-24 bg-wood-dark/40 border border-gold/15 rounded-lg px-2 py-1.5 text-beige text-xs focus:outline-none focus:border-gold/35" placeholder="+1.00€" />
                          <button onClick={() => onDeleteAddon(group.id, optionIndex)} className="text-red-400/60 p-1 rounded hover:bg-red-500/15 hover:text-red-300 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {group.options.length === 0 && <p className="text-beige/40 text-xs italic">Nessuna aggiunta in questo gruppo.</p>}
                    </div>
                  ))}
                </Section>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main AdminPanel ──────────────────────────────────────────────────────────
export const AdminPanel = ({ isOpen, onClose, categories, onSave, onResetDefaults, onLogout }: AdminPanelProps) => {
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
  const defaultAddonGroups = getDefaultAddonGroups(selectedCategory?.id);
  const hasAddonGroupsCategory = defaultAddonGroups.length > 0;

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
              const allergens = (value as string).split(',').map((item) => item.trim()).filter(Boolean);
              return { ...product, allergens };
            }
            return { ...product, [field]: value };
          }),
        };
      })
    );
  };

  const addCategory = () => {
    const newCategory: Category = { id: createId('cat'), name: 'Nuova Categoria', icon: '🍽️', image: '', products: [] };
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
    if (currentCategory?.id === 'piadine' && currentCategory.products.length >= 1) return;
    const nextAddonGroups = getDefaultAddonGroups(selectedCategoryId);
    const newProduct: Product = {
      id: createId('prod'), name: 'Nuovo Prodotto', description: '',
      price: '0.00€', image: '', allergens: [], vegan: false, soldOut: false, addons: [],
      addonGroups: nextAddonGroups.length ? nextAddonGroups : undefined,
    };
    setDraft((prev) =>
      prev.map((cat) => (cat.id === selectedCategoryId ? { ...cat, products: [...cat.products, newProduct] } : cat))
    );
  };

  const deleteProduct = (productId: string) => {
    if (isPiadineCategory && selectedCategory?.products.length === 1) return;
    setDraft((prev) =>
      prev.map((cat) =>
        cat.id === selectedCategoryId ? { ...cat, products: cat.products.filter((p) => p.id !== productId) } : cat
      )
    );
  };

  const moveProduct = (productId: string, direction: 'up' | 'down') => {
    setDraft((prev) =>
      prev.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;
        const currentIndex = cat.products.findIndex((p) => p.id === productId);
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
            const nextGroups = (product.addonGroups?.length ? product.addonGroups : defaultAddonGroups).map((group) => {
              if (group.id !== groupId) return group;
              return { ...group, options: [...group.options, { name: 'Nuova aggiunta', price: '+0.50€' }] };
            });
            return { ...product, addonGroups: nextGroups };
          }),
        };
      })
    );
  };

  const updateProductAddonOption = (productId: string, groupId: string, optionIndex: number, field: keyof ProductAddon, value: string) => {
    setDraft((prev) =>
      prev.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;
        return {
          ...cat,
          products: cat.products.map((product) => {
            if (product.id !== productId) return product;
            const nextGroups = (product.addonGroups?.length ? product.addonGroups : defaultAddonGroups).map((group) => {
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
            const nextGroups = (product.addonGroups?.length ? product.addonGroups : defaultAddonGroups).map((group) => {
              if (group.id !== groupId) return group;
              return { ...group, options: group.options.filter((_, i) => i !== optionIndex) };
            });
            return { ...product, addonGroups: nextGroups };
          }),
        };
      })
    );
  };

  const saveDraft = () => { onSave(draft); onClose(); };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-[90]" onClick={onClose} />
          <motion.div
            initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed inset-3 md:inset-8 z-[95] bg-wood-dark border border-gold/15 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gold/10 bg-wood-dark/80 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-gold/60" />
                <h2 className="vintage-title text-gold text-lg md:text-xl tracking-wide">Gestione Menu</h2>
                {selectedCategory && (
                  <>
                    <span className="text-gold/30 mx-1">/</span>
                    <span className="text-beige/70 text-sm">{selectedCategory.name}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onLogout} className="flex items-center gap-1.5 px-3 py-1.5 border border-gold/20 rounded-lg text-[11px] uppercase tracking-wider text-beige/70 hover:text-gold hover:border-gold/40 transition-colors">
                  <LogOut className="w-3 h-3" /> Logout
                </button>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-wood-light/15 transition-colors text-gold/60 hover:text-gold" aria-label="Chiudi">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Layout */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar desktop */}
              <aside className="hidden md:flex flex-col w-52 border-r border-gold/10 bg-wood-dark/50 shrink-0 overflow-y-auto">
                <div className="p-3 space-y-1">
                  {draft.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate ${
                        cat.id === selectedCategoryId
                          ? 'bg-gold/15 text-gold border border-gold/25'
                          : 'text-beige/70 hover:bg-wood-medium/20 hover:text-beige'
                      }`}
                    >
                      {cat.icon && <span className="mr-1.5">{cat.icon}</span>}
                      {cat.name}
                    </button>
                  ))}
                </div>
                <div className="mt-auto p-3 border-t border-gold/10 space-y-1.5">
                  <button onClick={addCategory} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-gold/25 rounded-lg text-gold text-xs hover:bg-gold/10 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Categoria
                  </button>
                  <button onClick={deleteCategory} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-red-400/25 rounded-lg text-red-300/80 text-xs hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Elimina
                  </button>
                </div>
              </aside>

              {/* Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile selector */}
                <div className="md:hidden flex gap-2 px-4 pt-3 pb-2 border-b border-gold/10 items-center flex-wrap">
                  <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} className="flex-1 bg-wood-medium/20 border border-gold/20 rounded-lg px-3 py-2 text-beige text-sm focus:outline-none">
                    {draft.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  <button onClick={addCategory} className="px-3 py-2 border border-gold/25 rounded-lg text-gold text-xs hover:bg-gold/10 transition-colors"><Plus className="w-4 h-4" /></button>
                  <button onClick={deleteCategory} className="px-3 py-2 border border-red-400/25 rounded-lg text-red-300/80 text-xs hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
                  {selectedCategory && (
                    <>
                      {/* Impostazioni categoria */}
                      <Section title="Impostazioni Categoria" icon={<AlignLeft className="w-3.5 h-3.5" />} defaultOpen={false}>
                        <FieldLabel>Nome categoria</FieldLabel>
                        <input value={selectedCategory.name} onChange={(e) => updateCategoryField('name', e.target.value)} className={inputCls} placeholder="Nome categoria" />
                        <FieldLabel>Immagine categoria</FieldLabel>
                        <input type="file" accept="image/*" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try { const compressed = await compressImage(file, 1400, 1400, 0.82); updateCategoryField('image', compressed); }
                          catch { alert("Errore durante l'elaborazione dell'immagine."); }
                        }} className="text-xs text-beige file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gold file:text-wood-dark hover:file:bg-accent-orange transition-colors" />
                        <input value={selectedCategory.image} onChange={(e) => updateCategoryField('image', e.target.value)} className={inputCls + ' mt-2'} placeholder="Oppure inserisci URL immagine" />
                      </Section>

                      {/* Header prodotti */}
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-widest text-gold/55">
                          Prodotti <span className="text-gold/80 font-semibold">({selectedCategory.products.length})</span>
                        </p>
                        <button onClick={addProduct} disabled={isPiadineCategory && selectedCategory.products.length >= 1} className="flex items-center gap-1.5 px-3 py-1.5 border border-gold/30 rounded-lg text-gold text-xs hover:bg-gold/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                          <Plus className="w-3.5 h-3.5" />
                          {isPiadineCategory ? 'Solo 1 Piadina' : 'Prodotto'}
                        </button>
                      </div>

                      {/* Lista prodotti */}
                      <div className="space-y-3">
                        {selectedCategory.products.map((product, index) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            index={index}
                            total={selectedCategory.products.length}
                            selectedCategoryId={selectedCategoryId}
                            isPiadineCategory={isPiadineCategory}
                            addonGroupsFallback={defaultAddonGroups}
                            onUpdate={(field, value) => updateProductField(product.id, field, value)}
                            onDelete={() => deleteProduct(product.id)}
                            onMove={(dir) => moveProduct(product.id, dir)}
                            onAddAddon={(groupId) => addProductAddonOption(product.id, groupId)}
                            onUpdateAddon={(groupId, optionIndex, field, value) => updateProductAddonOption(product.id, groupId, optionIndex, field, value)}
                            onDeleteAddon={(groupId, optionIndex) => deleteProductAddonOption(product.id, groupId, optionIndex)}
                          />
                        ))}
                        {selectedCategory.products.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Package className="w-8 h-8 text-gold/20 mb-3" />
                            <p className="text-beige/40 text-sm">Nessun prodotto in questa categoria.</p>
                            <button onClick={addProduct} className="mt-3 flex items-center gap-1.5 px-4 py-2 border border-gold/25 rounded-lg text-gold text-xs hover:bg-gold/10 transition-colors">
                              <Plus className="w-3.5 h-3.5" /> Aggiungi il primo prodotto
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gold/10 bg-wood-dark/80 backdrop-blur-sm shrink-0">
              <button onClick={onResetDefaults} className="flex items-center gap-1.5 px-3 py-2 border border-gold/15 rounded-lg text-beige/60 text-xs hover:text-beige hover:border-gold/30 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /> Ripristina Default
              </button>
              <button onClick={saveDraft} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gold text-wood-dark font-semibold text-sm hover:bg-accent-orange transition-colors shadow-lg shadow-gold/10">
                <Save className="w-4 h-4" /> Salva Modifiche
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};