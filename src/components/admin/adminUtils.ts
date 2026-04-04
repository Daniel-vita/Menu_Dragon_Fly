import { Category, Product, ProductAddonGroup, PIADINA_ADDON_GROUPS, HOTDOG_ADDON_GROUPS } from '../../data';

export const cloneMenuData = (data: Category[]): Category[] => JSON.parse(JSON.stringify(data));

export const createId = (prefix: string): string => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const cloneAddonGroups = (groups: ProductAddonGroup[]): ProductAddonGroup[] =>
  groups.map((group) => ({
    ...group,
    options: group.options.map((option) => ({ ...option })),
  }));

export const clonePiadinaAddonGroups = (): ProductAddonGroup[] => cloneAddonGroups(PIADINA_ADDON_GROUPS);

export const cloneHotdogAddonGroups = (): ProductAddonGroup[] => cloneAddonGroups(HOTDOG_ADDON_GROUPS);

export const getDefaultAddonGroups = (categoryId?: string): ProductAddonGroup[] => {
  if (categoryId === 'piadine') {
    return clonePiadinaAddonGroups();
  }

  if (categoryId === 'hotdog') {
    return cloneHotdogAddonGroups();
  }

  return [];
};

export const normalizePiadinaAddonGroups = (product: Product): ProductAddonGroup[] => {
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

export const normalizeMenuDataForPiadine = (data: Category[]): Category[] =>
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

export const compressImage = (file: File, maxWidth = 2200, maxHeight = 2200, quality = 0.9): Promise<string> => {
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
        } else if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
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