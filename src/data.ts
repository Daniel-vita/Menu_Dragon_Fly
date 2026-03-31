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
  format?: string;
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

export const CATEGORY_IMAGE_FOLDERS: Record<string, string[]> = {
  birre_bottiglia: [
    '/Birre_Bottiglia/alpine.webp',
    '/Birre_Bottiglia/ceres.webp',
    '/Birre_Bottiglia/Chimay_blue.webp',
    '/Birre_Bottiglia/Chimay_red.webp',
    '/Birre_Bottiglia/chiway_triple.webp',
    '/Birre_Bottiglia/CHOUFFE.webp',
    '/Birre_Bottiglia/Dimont.webp',
    '/Birre_Bottiglia/dimont_Ipa.webp',
    '/Birre_Bottiglia/Flötzinger.webp',
    '/Birre_Bottiglia/Guinners.webp',
    '/Birre_Bottiglia/löwenbrau.webp',
    '/Birre_Bottiglia/mill_ican.webp',
    '/Birre_Bottiglia/Rascals_jail_break_lager.webp',
    '/Birre_Bottiglia/spalter_analcolica.webp',
    '/Birre_Bottiglia/spalter_pils.webp',
    '/Birre_Bottiglia/treggia.webp'
  ],
  birre_artigianali: [],
  cocktail: [],
  dolci: [],
  fritti: [],
  panini: [],
  patatine: [],
  pinse: []
};

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
    image: "https://images.unsplash.com/photo-1608270861620-7476fef55afe?auto=format&fit=crop&q=80&w=800",
    products: [
      {
        id: "b1",
        name: "Nelson IPA",
        description: "IPA aromatica e moderna, caratterizzata da note tropicali e agrumate grazie ai luppoli neozelandesi. Corpo medio e finale amarognolo persistente.",
        price: "6,50€",
        image: "/Birre_Bottiglia/alpine.webp",
        allergens: ["Glutine"],
        format: "33cl"
      },
      {
        id: "b2",
        name: "DIMONT IPA (senza glutine)",
        description: "IPA dal profilo fresco e luppolato, con sentori di agrumi e resina. Bilanciata e accessibile, adatta anche a chi cerca una birra senza glutine.",
        price: "6,50€",
        image: "/Birre_Bottiglia/dimont_Ipa.webp",
        allergens: ["Senza glutine"],
        format: "33cl"
      },
      {
        id: "b3",
        name: "DIMONT Ambrata (senza glutine)",
        description: "Birra ambrata dal gusto morbido e maltato, con leggere note di caramello e tostato. Finale equilibrato e poco amaro.",
        price: "6,50€",
        image: "/Birre_Bottiglia/Dimont.webp",
        allergens: ["Senza glutine"],
        format: "33cl"
      },
      {
        id: "b4",
        name: "Rascals Jailbreak Lager (senza glutine)",
        description: "Lager fresca e pulita, dal gusto leggero e beverino. Note di cereale e luppolo delicato, perfetta per una bevuta dissetante.",
        price: "7€",
        image: "/Birre_Bottiglia/Rascals_jail_break_lager.webp",
        allergens: ["Senza glutine"],
        format: "44cl"
      },
      {
        id: "b5",
        name: "Chimay Triple",
        description: "Birra trappista bionda, complessa e speziata, con note fruttate e lievitate. Corpo pieno e finale secco.",
        price: "6€",
        image: "/Birre_Bottiglia/chiway_triple.webp",
        allergens: ["Glutine"],
        format: "33cl"
      },
      {
        id: "b6",
        name: "Chimay Blue",
        description: "Strong ale scura, intensa e corposa, con aromi di frutta secca, caramello e spezie. Ideale da meditazione.",
        price: "6€",
        image: "/Birre_Bottiglia/Chimay_blue.webp",
        allergens: ["Glutine"],
        format: "33cl"
      },
      {
        id: "b7",
        name: "Chimay Red",
        description: "Dubbel dal gusto equilibrato, con note di malto, frutta rossa e una leggera speziatura. Morbida e rotonda.",
        price: "6€",
        image: "/Birre_Bottiglia/Chimay_red.webp",
        allergens: ["Glutine"],
        format: "33cl"
      },
      {
        id: "b8",
        name: "La Chouffe Blonde",
        description: "Belgian ale dorata, fruttata e speziata, con note di coriandolo e agrumi. Corpo medio e finale vivace.",
        price: "6€",
        image: "/Birre_Bottiglia/CHOUFFE.webp",
        allergens: ["Glutine"],
        format: "33cl"
      },
      {
        id: "b9",
        name: "Flötzinger Weissbier Hell",
        description: "Weissbier tedesca torbida e rinfrescante, con tipiche note di banana e chiodi di garofano. Morbida e dissetante.",
        price: "5,50€",
        image: "/Birre_Bottiglia/Flötzinger.webp",
        allergens: ["Glutine"],
        format: "50cl"
      },
      {
        id: "b10",
        name: "Spalter Pils",
        description: "Pils chiara e secca, con amaro elegante e note erbacee di luppolo. Molto beverina e classica.",
        price: "2,50€",
        image: "/Birre_Bottiglia/spalter_pils.webp",
        allergens: ["Glutine"],
        format: "33cl"
      },
      {
        id: "b11",
        name: "Spalter Analcolica",
        description: "Birra analcolica leggera e fresca, con gusto delicato e note di malto e cereale. Ideale per chi evita l'alcol.",
        price: "2,50€",
        image: "/Birre_Bottiglia/spalter_analcolica.webp",
        allergens: ["Glutine"],
        format: "33cl"
      },
      {
        id: "b12",
        name: "Treggia Colle Rosso Chiara",
        description: "Birra artigianale chiara ad alta gradazione, con profilo intenso e complesso. Note maltate e leggermente fruttate.",
        price: "6€",
        image: "/Birre_Bottiglia/treggia.webp",
        allergens: ["Glutine"],
        format: "33cl"
      },
      {
        id: "b13",
        name: "Mill ICAN Extra",
        description: "Birra dal carattere deciso, con buon equilibrio tra malto e luppolo. Corpo medio e finale persistente.",
        price: "6€",
        image: "/Birre_Bottiglia/mill_ican.webp",
        allergens: ["Glutine"],
        format: "33cl"
      },
      {
        id: "b14",
        name: "Ceres",
        description: "Strong lager dal gusto intenso e leggermente dolce, con buona struttura e finale caldo.",
        price: "3€",
        image: "/Birre_Bottiglia/ceres.webp",
        allergens: ["Glutine"],
        format: "33cl"
      },
      {
        id: "b15",
        name: "Löwenbräu",
        description: "Lager classica tedesca, pulita e bilanciata, con leggere note maltate e finale fresco.",
        price: "2,50€",
        image: "/Birre_Bottiglia/löwenbrau.webp",
        allergens: ["Glutine"],
        format: "33cl"
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
        description: "Dolce ed erbaceo, ideale da bere ghiacciato.",
        price: "2.00€",
        image: "https://images.unsplash.com/photo-1569701813229-33284b643e3c?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "a2",
        name: "Jägermeister",
        description: "Amaro tedesco speziato, a base di 56 erbe.",
        price: "2.00€",
        image: "https://images.unsplash.com/photo-1569701813229-33284b643e3c?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "a3",
        name: "Montenegro",
        description: "Equilibrato, dolce-amaro con note di arancia.",
        price: "2.50€",
        image: "https://images.unsplash.com/photo-1569701813229-33284b643e3c?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "a4",
        name: "Jefferson",
        description: "Amaro calabrese naturale con agrumi e rosmarino.",
        price: "2.50€",
        image: "https://images.unsplash.com/photo-1569701813229-33284b643e3c?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "a5",
        name: "Limoncello",
        description: "Liquore dolce e fresco alle scorze di limone.",
        price: "2.50€",
        image: "https://images.unsplash.com/photo-1569701813229-33284b643e3c?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "a6",
        name: "Vecchia Romagna",
        description: "Storico brandy italiano, morbido e legnoso.",
        price: "2.00€",
        image: "https://images.unsplash.com/photo-1569701813229-33284b643e3c?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "a7",
        name: "Amaro al tartufo",
        description: "Particolare, con note terrose di tartufo.",
        price: "2.00€",
        image: "https://images.unsplash.com/photo-1569701813229-33284b643e3c?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "a8",
        name: "Borsci San Marzano",
        description: "Dolce e liquoroso, con un tocco di rum.",
        price: "2.00€",
        image: "https://images.unsplash.com/photo-1569701813229-33284b643e3c?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "a9",
        name: "Amaro Lucano",
        description: "Profilo balsamico, agrumato e ben bilanciato.",
        price: "2.00€",
        image: "https://images.unsplash.com/photo-1569701813229-33284b643e3c?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "a10",
        name: "Fernet-Branca",
        description: "Intenso, molto amaro e fortemente speziato.",
        price: "2.00€",
        image: "https://images.unsplash.com/photo-1569701813229-33284b643e3c?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "a11",
        name: "Brancamenta",
        description: "Fresco e balsamico, con spiccate note di menta.",
        price: "2.00€",
        image: "https://images.unsplash.com/photo-1569701813229-33284b643e3c?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "a12",
        name: "Liquirizia",
        description: "Liquore denso, dolce-amaro alla radice di liquirizia.",
        price: "2.50€",
        image: "https://images.unsplash.com/photo-1569701813229-33284b643e3c?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "a13",
        name: "Petrus Boonekamp",
        description: "Amarissimo e secco, senza zuccheri aggiunti.",
        price: "2.00€",
        image: "https://images.unsplash.com/photo-1569701813229-33284b643e3c?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "a14",
        name: "Caffè Borghetti",
        description: "Liquore dolce al vero caffè espresso italiano.",
        price: "2.00€",
        image: "https://images.unsplash.com/photo-1569701813229-33284b643e3c?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "a15",
        name: "Averna",
        description: "Morbido, corposo, con note di erbe mediterranee.",
        price: "2.00€",
        image: "https://images.unsplash.com/photo-1569701813229-33284b643e3c?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "a16",
        name: "Baileys",
        description: "Dolce e vellutata crema al whiskey irlandese.",
        price: "2.50€",
        image: "https://images.unsplash.com/photo-1569701813229-33284b643e3c?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "g1",
        name: "Diciotto Lune",
        description: "Affinata in botte, morbida con sentori di vaniglia.",
        price: "2.50€",
        image: "https://images.unsplash.com/photo-1516733968668-dbdce39c46ef?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "g2",
        name: "903 Barricata e Bianca",
        description: "Barricata (calda/speziata) o Bianca (secca/pulita).",
        price: "2.50€",
        image: "https://images.unsplash.com/photo-1516733968668-dbdce39c46ef?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "g3",
        name: "Poli Bianca / Secca Dry",
        description: "Distillato artigianale veneto, deciso e asciutto.",
        price: "3.00€",
        image: "https://images.unsplash.com/photo-1516733968668-dbdce39c46ef?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "g4",
        name: "Poli Barricata / Sarpa Oro",
        description: "Invecchiata in legno, aromatica e complessa.",
        price: "3.00€",
        image: "https://images.unsplash.com/photo-1516733968668-dbdce39c46ef?auto=format&fit=crop&q=80&w=800"
      }
    ]
  }
];
