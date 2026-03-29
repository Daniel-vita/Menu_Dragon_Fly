export interface ProductPrice {
  label: string;
  value: string;
}

export interface ProductAddon {
  name: string;
  price: string;
}

export interface ProductAddonGroup {
  id: string;
  name: string;
  options: ProductAddon[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price?: string;
  prices?: ProductPrice[];
  addons?: ProductAddon[];
  addonGroups?: ProductAddonGroup[];
  image: string;
  allergens?: string[];
}

export const PIADINA_ADDON_GROUPS: ProductAddonGroup[] = [
  {
    id: 'carne',
    name: 'Carne',
    options: [
      { name: 'Prosciutto crudo', price: '+2.00€' },
      { name: 'Salsiccia', price: '+2.20€' },
      { name: 'Speck', price: '+2.00€' }
    ]
  },
  {
    id: 'formaggi',
    name: 'Formaggi',
    options: [
      { name: 'Squacquerone', price: '+1.50€' },
      { name: 'Mozzarella', price: '+1.20€' },
      { name: 'Scamorza', price: '+1.40€' }
    ]
  },
  {
    id: 'verdure',
    name: 'Verdure',
    options: [
      { name: 'Rucola', price: '+0.80€' },
      { name: 'Peperoni', price: '+1.00€' },
      { name: 'Cipolla', price: '+0.70€' }
    ]
  },
  {
    id: 'salse',
    name: 'Salse',
    options: [
      { name: 'Maionese', price: '+0.50€' },
      { name: 'Salsa BBQ', price: '+0.70€' },
      { name: 'Salsa piccante', price: '+0.70€' }
    ]
  }
];

export const SERVICE_CHARGE = "2.00€";

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  products: Product[];
}

export const MENU_DATA: Category[] = [
  {
    id: "panini",
    name: "Panini",
    icon: "🍔",
    image: "https://pixabay.com/get/g6020268201e6f65c825d672fbe2e207452fbc8627a906992cbba50c12f0e694ad595afa88800b4b6ab7d801f9e76162e_1920.jpg",
    products: [
      {
        id: "p1",
        name: "Dragonfly17 Burger",
        description: "Manzo 200g, cheddar, bacon croccante, cipolla caramellata, salsa segreta.",
        price: "12.50€",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
        allergens: ["Glutine", "Lattosio", "Uova"]
      },
      {
        id: "p2",
        name: "Smoky BBQ",
        description: "Manzo, provola affumicata, anelli di cipolla, salsa BBQ, lattuga.",
        price: "11.00€",
        image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=800",
        allergens: ["Glutine", "Lattosio", "Senape"]
      },
      {
        id: "p3",
        name: "Veggie Delight",
        description: "Burger di ceci, zucchine grigliate, pomodoro, maionese vegana.",
        price: "10.50€",
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800"
      }
    ]
  },
  {
    id: "piadine",
    name: "Piadine",
    icon: "🌯",
    image: "https://pixabay.com/get/g56ae24f9f90166d39e871fe217befdad8d50b1f60dfa89d2f90fbe6fb1051a9e32a195f6903827f11b76c41d78668329_1920.jpg",
    products: [
      {
        id: "pi1",
        name: "Piadina Personalizzabile",
        description: "Base piadina da comporre come vuoi: scegli gli extra qui sotto.",
        price: "5.00€",
        image: "https://pixabay.com/get/g189a821c8f564141566b04d456fba53a9da8072efa9fb5d96e5848ba86993a8006208c5b174b2cb3c9247922fdea30d1_1920.jpg",
        addonGroups: PIADINA_ADDON_GROUPS
      }
    ]
  },
  {
    id: "pinse",
    name: "Pinse",
    icon: "🍕",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800",
    products: [
      {
        id: "pn1",
        name: "Pinsa Margherita",
        description: "Pomodoro, mozzarella e basilico.",
        price: "8.50€",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "pn2",
        name: "Pinsa Prosciutto e Rucola",
        description: "Mozzarella, prosciutto crudo e rucola fresca.",
        price: "10.00€",
        image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=800"
      }
    ]
  },
  {
    id: "patane-paesane",
    name: "Patane Paesane",
    icon: "🥔",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=800",
    products: [
      {
        id: "pp1",
        name: "patane Paesane",
        description: "patane paesane croccanti, servite calde.",
        price: "5.00€",
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=800"
      }
    ]
  },
  {
    id: "fritti",
    name: "Fritti",
    icon: "🍟",
    image: "https://pixabay.com/get/g1763d19c94e4d13fe5c4c08d4bdc39d911ea66a89529b24a269e9974c23edbfa3d41b09430955d4b04943a9123f7aafc_1920.jpg",
    products: [
      {
        id: "f1",
        name: "patane Rustiche",
        description: "Patate fritte con buccia, sale marino e rosmarino.",
        price: "4.50€",
        image: "https://images.unsplash.com/photo-1573016608464-54269945138e?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "f2",
        name: "Anelli di Cipolla",
        description: "Anelli di cipolla in pastella alla birra (8 pezzi).",
        price: "5.50€",
        image: "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "f3",
        name: "Mix Fritti",
        description: "patane, anelli di cipolla, mozzarelline, crocchette.",
        price: "9.50€",
        image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=800"
      }
    ]
  },
  {
    id: "cocktail",
    name: "Cocktail",
    icon: "🍸",
    image: "https://pixabay.com/get/g8ff6e44b22c7b32ae1071881c32efa623f8e16628b6505c030af73bb190c6c6cb12c2eb84f2f694c942393d527589182_1920.jpg",
    products: [
      {
        id: "c1",
        name: "Negroni",
        description: "Gin, Campari, Vermouth Rosso.",
        price: "8.00€",
        image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "c2",
        name: "Old Fashioned",
        description: "Bourbon, Angostura, zucchero, scorza d'arancia.",
        price: "9.00€",
        image: "https://images.unsplash.com/photo-1514218953589-2d7d37efd2dc?auto=format&fit=crop&q=80&w=800"
      }
    ]
  },
  {
    id: "birre",
    name: "Birre in Bottiglia",
    icon: "🍺",
    image: "https://pixabay.com/get/g967922e805207d7d741431846cd6e020bc4ffdc37271bcb76a900cb0f8365224266b278122f4a8b9a48f05e71e032869_1920.jpg",
    products: [
      {
        id: "b1",
        name: "Lager alla Spina",
        description: "Fresca e beverina.",
        prices: [
          { label: "0.2L", value: "3.50€" },
          { label: "0.4L", value: "5.00€" },
          { label: "1.0L", value: "11.00€" }
        ],
        image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "b2",
        name: "Rossa d'Abbazia",
        description: "Note di malto e caramello.",
        prices: [
          { label: "0.2L", value: "4.00€" },
          { label: "0.4L", value: "6.00€" }
        ],
        image: "https://images.unsplash.com/photo-1559526323-cb2f2fe2591b?auto=format&fit=crop&q=80&w=800"
      }
    ]
  },
  {
    id: "birre-artigianali",
    name: "Birre alla Spina",
    icon: "🍻",
    image: "https://pixabay.com/get/g30fe19f5f64efddafbe3c251076331bd21c937244b1ae1989c02b1a2ae7608e1db602750e6eb040f35afbe787d51f42d_1920.jpg",
    products: [
      {
        id: "ba1",
        name: "IPA Tropicale",
        description: "Note di mango e frutto della passione.",
        prices: [
          { label: "33cl", value: "7.00€" },
          { label: "50cl", value: "9.50€" }
        ],
        image: "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "ba2",
        name: "Stout al Cioccolato",
        description: "Scura, densa, persistente.",
        prices: [
          { label: "33cl", value: "7.50€" },
          { label: "50cl", value: "10.00€" }
        ],
        image: "https://images.unsplash.com/photo-1584225064785-c62a8b43d148?auto=format&fit=crop&q=80&w=800"
      }
    ]
  },
  {
    id: "bibite",
    name: "Bibite",
    icon: "🥤",
    image: "https://pixabay.com/get/gbd8d9efeb6925c5b3814b4ae3537737c088fbd0e99f590b84cfa80164cac819ecc2e2bd581c6396f51915b5aeb9b98ea_1920.jpg",
    products: [
      {
        id: "bi1",
        name: "Coca Cola",
        description: "33cl in vetro.",
        price: "3.50€",
        image: ""
      },
      {
        id: "bi2",
        name: "Acqua Naturale/Frizzante",
        description: "50cl.",
        price: "1.50€",
        image: ""
      }
    ]
  },
  {
    id: "dolci",
    name: "Dolci",
    icon: "🍰",
    image: "https://pixabay.com/get/g485b9e841d1ec7d624a280f09def9526f41843ae07ee38f18f99ae7586d979117801e84830a78e364c5d8e7608436360_1920.jpg",
    products: [
      {
        id: "d1",
        name: "Tiramisù della Casa",
        description: "Fatto a mano con caffè espresso.",
        price: "6.00€",
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "d2",
        name: "Cheesecake ai Frutti di Bosco",
        description: "Fresca e cremosa.",
        price: "6.00€",
        image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=800"
      }
    ]
  },
  {
    id: "amari",
    name: "Amari",
    icon: "🥃",
    image: "https://pixabay.com/get/geec1c368c9d2f097d495740ee357bc70068e60dffcb20f30c01969da66b71c706b0a0d2dfcca34726585da23d93d0eff_1920.jpg",
    products: [
      {
        id: "a1",
        name: "Amaro del Capo",
        description: "Ghiacciato.",
        price: "4.00€",
        image: ""
      },
      {
        id: "a2",
        name: "Grappa Barricata",
        description: "Invecchiata in botti di rovere.",
        price: "5.00€",
        image: ""
      }
    ]
  }
];
