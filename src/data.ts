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
  vegan?: boolean;
  soldOut?: boolean;
}

export const PIADINA_ADDON_GROUPS: ProductAddonGroup[] = [
  {
    id: 'carne',
    name: 'Carne',
    options: [
      { name: 'Hamburger', price: '+2.00€' },
      { name: 'Salsiccia', price: '+2.00€' },
      { name: 'Porchetta', price: '+2.00€' },
      { name: 'Cotechino', price: '+2.00€' },
      { name: 'Pollo', price: '+2.00€' }
    ]
  },
  {
    id: 'affettati',
    name: 'Affettati',
    options: [
      { name: 'Pancetta', price: '+1.00€' },
      { name: 'Speck', price: '+1.00€' },
      { name: 'Mortadella', price: '+1.00€' }
    ]
  },
  {
    id: 'formaggi',
    name: 'Formaggi',
    options: [
      { name: 'Scamorza', price: '+1.00€' },
      { name: 'Provola', price: '+1.00€' },
      { name: 'Caciocavallo', price: '+1.00€' },
      { name: 'Cheddar', price: '+1.50€' }
    ]
  },
 {
    id: 'verdure',
    name: 'Verdure',
    options: [
      // Verdure a +0.50€
      { name: 'Lattuga', price: '+0.50€' },
      { name: 'Rucola', price: '+0.50€' },
      { name: 'Pomodorini freschi', price: '+0.50€' },
      { name: 'Pomodori secchi', price: '+0.50€' },
      { name: 'Cipolla', price: '+0.50€' },
      
      // Verdure a +1.00€
      { name: 'Funghi misti', price: '+1.00€' },
      { name: 'Porcini', price: '+1.00€' },
      { name: 'Torzella', price: '+1.00€' },
      { name: 'Friarielli', price: '+1.00€' },
      { name: 'Cetrioli sott\'aceto', price: '+1.00€' },
      { name: 'Zucchine grigliate', price: '+1.00€' },
      { name: 'Melanzane grigliate', price: '+1.00€' }
    ]
  },
{
    id: 'salse',
    name: 'Salse',
    options: [
      { name: 'Maionese', price: '+0.50€' },
      { name: 'Ketchup', price: '+0.50€' },
      { name: 'Senape', price: '+0.50€' },
      { name: 'Barbecue', price: '+0.50€' },
      { name: 'Salsa yogurt', price: '+0.50€' },
      { name: 'Salsa guacamole', price: '+0.50€' },
      { name: 'Salsa special', price: '+0.50€' },
      { name: 'Salsa fly', price: '+0.50€' }
    ]
  }
];

export const SERVICE_CHARGE = "1.50€";

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
  hotdog: [],
  panini: [],
  patatine: [],
  pinse: []
};

export const MENU_DATA: Category[] = [
  {
    id: "panini",
    name: "Panini",
    icon: "🍔",
    image: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=1200",
    products: [
      {
        id: "p4",
        name: "BIG FLY",
        description: "Hamburger di scottona 250 gr, pancetta, cheddar, cipolle caramellate, lattuga e pomodoro.",
        price: "11,00€",
        image: ""
      },
      {
        id: "p5",
        name: "DUBLINO",
        description: "Hamburger di scottona, speck caramellato, 4 formaggi fusi, rucola, pomodoro e salsa BBQ.",
        price: "10,00€",
        image: "",
        soldOut: true
      },
      {
        id: "p6",
        name: "KRABBY PATTY",
        description: "Hamburger di scottona, ketchup, senape, cetrioli sott'aceto, cipolla, lattuga, cheddar e pomodoro.",
        price: "8,50€",
        image: "/Panini/Krabby.webp"
      },
      {
        id: "p7",
        name: "IRPINO",
        description: "Cotechino irpino, pesto di friarielli, fonduta di caciocavallo.",
        price: "9,00€",
        image: ""
      },
      {
        id: "p8",
        name: "MORTA MIA!",
        description: "Mortadella alla piastra, pesto di pistacchio, cheddar e stracciatella.",
        price: "8,00€",
        image: ""
      },
      {
        id: "p9",
        name: "BOSCO NOBILE",
        description: "Hamburger di scottona, pesto di nocciole, fonduta di caciocavallo, funghi porcini e pancetta croccante.",
        price: "13,00€",
        image: ""
      },
      {
        id: "p10",
        name: "LIMMITIELLO",
        description: "Cotechino, caciocavallo, crema al tartufo e confettura di mirtilli.",
        price: "11,50€",
        image: ""
      },
      {
        id: "p11",
        name: "FIT FLY",
        description: "Panino ai cereali, pollo grigliato, avocado, pomodoro, lattuga e salsa yogurt.",
        price: "7,50€",
        image: ""
      },
      {
        id: "p12",
        name: "VEG BOOM",
        description: "Panino ai cereali, hamburger di patate, zucchine grigliate, melanzane grigliate, pomodori secchi e salsa guacamole.",
        price: "8,00€",
        image: "/Panini/Krabby.webp",
        vegan: true
      },
      {
        id: "p13",
        name: "CHICKEN FLY",
        description: "Bun morbido, pollo impanato, pancetta croccante, cheddar e salsa speciale.",
        price: "9,00€",
        image: ""
      },
      {
        id: "p14",
        name: "FLY SMASH",
        description: "Bun morbido, doppio hamburger smash, cheddar, cipolla, cetrioli sott'aceto e salsa fly.",
        price: "11,00€",
        image: ""
      }
    ]
  },
  {
    id: "piadine",
    name: "Piadine",
    icon: "🌯",
    image: "https://images.pexels.com/photos/4958641/pexels-photo-4958641.jpeg?auto=compress&cs=tinysrgb&w=1200",
    products: [
      {
        id: "pi1",
        name: "Piadina Personalizzabile",
        description: "Base piadina da comporre come vuoi: scegli gli extra qui sotto.",
        price: "3.00€",
        image: "https://pixabay.com/get/g189a821c8f564141566b04d456fba53a9da8072efa9fb5d96e5848ba86993a8006208c5b174b2cb3c9247922fdea30d1_1920.jpg",
        addonGroups: PIADINA_ADDON_GROUPS
      }
    ]
  },
  {
    id: "hotdog",
    name: "Hot Dog",
    icon: "🌭",
    image: "https://images.pexels.com/photos/4518656/pexels-photo-4518656.jpeg?auto=compress&cs=tinysrgb&w=1200",
    products: [
      {
        id: "hd1",
        name: "Hot Dog con Wurstel Tedesco",
        description: "Con cipolla fritta e salsa a scelta.",
        price: "5,00€",
        image: ""
      }
    ]
  },
{
    id: "pinse",
    name: "Pinse Romagnole",
    icon: "🍕",
  image: "https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=1200",
    products: [
      {
        id: "pn1",
        name: "Pancetta e Torzella",
        description: "Mozzarella, pancetta e torzella",
        price: "12.00€",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "pn2",
        name: "Piennolo",
        description: "Mozzarella e pomodoro del piennolo in salsa",
        price: "10.00€",
        image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "pn3",
        name: "Salsiccia e Friarielli",
        description: "Provola salsiccia e friarielli",
        price: "11.00€",
        image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=800"
      }
    ]
  },
  {
    id: "patatine",
    name: "Patate Paesane",
    icon: "🥔",
    image: "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=1200",
    products: [
      {
        id: "pp1",
        name: "Porzione Classica",
        description: "Patate paesane classiche.",
        prices: [
          { label: "Piccola", value: "3,00€" },
          { label: "Media", value: "4,00€" },
          { label: "Grande", value: "5,00€" }
        ],
        image: ""
      },
      {
        id: "pp2",
        name: "Patate Pancetta e Cheddar",
        description: "Patate paesane con pancetta e cheddar.",
        prices: [
          { label: "Piccola", value: "5,50€" },
          { label: "Media", value: "7,50€" },
          { label: "Grande", value: "10,50€" }
        ],
        image: ""
      },
      {
        id: "pp3",
        name: "Patate Porchetta e Provola",
        description: "Patate paesane con porchetta e provola.",
        prices: [
          { label: "Piccola", value: "5,00€" },
          { label: "Media", value: "7,00€" },
          { label: "Grande", value: "10,00€" }
        ],
        image: ""
      },
      {
        id: "pp4",
        name: "Patate Salsiccia, Caciocavallo e Tartufo",
        description: "Patate paesane con salsiccia, caciocavallo e tartufo.",
        prices: [
          { label: "Piccola", value: "7,00€" },
          { label: "Media", value: "9,00€" },
          { label: "Grande", value: "12,00€" }
        ],
        image: ""
      }
    ]
  },
  {
    id: "fritti",
    name: "Fritti",
    icon: "🍟",
    image: "https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg?auto=compress&cs=tinysrgb&w=1200",
    products: [
      {
        id: "f1",
        name: "Mini Involtini Primavera",
        description: "Mini involtini primavera.",
        prices: [
          { label: "Al pz", value: "0,80€" },
          { label: "Porzione 5 pz", value: "3,50€" }
        ],
        image: ""
      },
      {
        id: "f2",
        name: "Mini Parmigianine di Melanzane",
        description: "Mini parmigianine di melanzane.",
        prices: [
          { label: "Al pz", value: "0,50€" },
          { label: "Porzione 5 pz", value: "2,00€" }
        ],
        image: ""
      },
      {
        id: "f3",
        name: "Nuggets Jalapenos Rossi e Formaggio",
        description: "Nuggets jalapenos rossi e formaggio.",
        prices: [
          { label: "Al pz", value: "1,00€" },
          { label: "Porzione 5 pz", value: "4,50€" }
        ],
        image: ""
      }
    ]
  },
  {
    id: "cocktail",
    name: "Cocktail",
    icon: "🍸",
    image: "https://images.pexels.com/photos/1304544/pexels-photo-1304544.jpeg?auto=compress&cs=tinysrgb&w=1200",
    products: [
      {
        id: "c1",
        name: "Milano-Torino",
        description: "Vermouth rosso e bitter rosso: l'equilibrio perfetto tra dolce e amaro, classico senza tempo.",
        price: "4,00€",
        image: ""
      },
      {
        id: "c2",
        name: "Negroni",
        description: "Vermouth rosso, bitter rosso e gin. Intenso, deciso, l'icona dell'aperitivo all'italiana.",
        price: "5,00€",
        image: ""
      },
      {
        id: "c3",
        name: "Negroni Sbagliato",
        description: "Vermouth rosso, bitter rosso e spumante. La versione più frizzante e leggera del celebre cocktail.",
        price: "5,00€",
        image: ""
      },
      {
        id: "c4",
        name: "Americano",
        description: "Vermouth rosso, bitter rosso e acqua tonica. Lungo, rinfrescante, ideale per un aperitivo senza fretta.",
        price: "5,00€",
        image: ""
      },
      {
        id: "c5",
        name: "Long Island Iced Tea",
        description: "Vodka, gin, rum bianco, tequila, triple sec, succo di limone, sciroppo di zucchero e una spruzzata di Coca-Cola. Potente e sorprendentemente morbido.",
        price: "5,00€",
        image: ""
      },
      {
        id: "c6",
        name: "Japanese Iced Tea",
        description: "Vodka, gin, rum bianco, tequila, Midori, succo di limone, sciroppo di zucchero e limonata. La versione fresca e dal carattere verde mela.",
        price: "5,00€",
        image: ""
      },
      {
        id: "c7",
        name: "Moscow Mule",
        description: "Vodka, succo di lime e ginger beer. Servito nel caratteristico boccale di rame, fresco e speziato.",
        price: "5,00€",
        image: ""
      },
      {
        id: "c8",
        name: "London Mule",
        description: "Gin, succo di lime e ginger beer. L'eleganza botanica del gin incontra la freschezza piccante dello zenzero.",
        price: "5,00€",
        image: ""
      },
      {
        id: "c9",
        name: "Mexican Mule",
        description: "Tequila, succo di lime e ginger beer. Un tripudio di freschezza agrodolce con il carattere deciso dell'agave.",
        price: "5,00€",
        image: ""
      },
      {
        id: "c10",
        name: "Jamaican Mule",
        description: "Rum scuro, succo di lime e ginger beer. Caldo, avvolgente, con note di melassa e spezie.",
        price: "5,00€",
        image: ""
      }
    ]
  },
  {
    id: "birre",
    name: "Birre in Bottiglia",
    icon: "🍺",
    image: "https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=1200",
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
    image: "https://images.pexels.com/photos/1269025/pexels-photo-1269025.jpeg?auto=compress&cs=tinysrgb&w=1200",
    products: [
      {
        id: "ba1",
        name: "Hofmann Pils",
        description: "Pilsner (5%) - Hofmann, Germania. Note di fiori, crosta di pane e miele, con sfumature di erba tagliata e spezie.",
        prices: [
          { label: "0.2 cl", value: "2€" },
          { label: "0.3 cl", value: "3€" },
          { label: "0.5 cl", value: "5€" }
        ],
        image: ""
      },
      {
        id: "ba2",
        name: "Rascals Mosaic IPA",
        description: "IPA (6,3%) - Rascals. Fruttata, erbacea e agrumata con finale pulito e fresco.",
        prices: [
          { label: "Mezza pinta", value: "3,5€" },
          { label: "Pinta", value: "6€" }
        ],
        image: ""
      },
      {
        id: "ba3",
        name: "Rascals Scotch Ale",
        description: "Scotch Ale (6,5%) - Rascals. Maltata, colore rubino, note dolci e caramellate con finale secco e tostato.",
        prices: [
          { label: "0.4 cl", value: "5€" }
        ],
        image: ""
      },
      {
        id: "ba4",
        name: "Guinness",
        description: "Stout (4,2%) - Guinness, Irlanda. Birra alla spina con tecnologia MicroDraught, cremosa e iconica.",
        prices: [
          { label: "0.5 cl", value: "7€" }
        ],
        image: ""
      }
    ]
  },
  {
    id: "bibite",
    name: "Bibite",
    icon: "🥤",
    image: "https://images.pexels.com/photos/2775860/pexels-photo-2775860.jpeg?auto=compress&cs=tinysrgb&w=1200",
    products: [
      {
        id: "bi1",
        name: "Coca-Cola",
        description: "Bottiglietta in vetro.",
        price: "2,50€",
        image: ""
      },
      {
        id: "bi2",
        name: "Pepsi",
        description: "Bottiglia.",
        price: "2,50€",
        image: ""
      },
      {
        id: "bi3",
        name: "Sprite",
        description: "Bottiglietta in vetro.",
        price: "2,50€",
        image: ""
      },
      {
        id: "bi4",
        name: "Fanta",
        description: "Bottiglietta in plastica.",
        price: "2,50€",
        image: ""
      },
      {
        id: "bi5",
        name: "Estathe",
        description: "Gusti limone o pesca.",
        price: "2,50€",
        image: ""
      },
      {
        id: "bi6",
        name: "Succo Yoga",
        description: "Bottiglietta.",
        price: "2,50€",
        image: ""
      },
      {
        id: "bi7",
        name: "Gatorade",
        description: "Bottiglia gialla o arancione.",
        price: "2,00€",
        image: ""
      },
      {
        id: "bi8",
        name: "Acqua Naturale",
        description: "Bottiglietta.",
        price: "1,00€",
        image: ""
      },
      {
        id: "bi9",
        name: "Acqua Frizzante",
        description: "Bottiglietta azzurra.",
        price: "1,00€",
        image: ""
      }
    ]
  },
  {
    id: "dolci",
    name: "Dolci",
    icon: "🍰",
    image: "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=1200",
    products: [
      {
        id: "d1",
        name: "Cheesecake",
        description: "Gusti: Lotus, Cioccolato Bianco, Confettura Mirtillo, Confettura Albicocca.",
        price: "5,50€",
        image: ""
      }
    ]
  },
  {
    id: "amari",
    name: "Amari",
    icon: "🥃",
    products: [
      {
        id: "a1",
        name: "Amaro del Capo",
        description: "Dolce ed erbaceo, ideale da bere ghiacciato.",
        price: "2.00€",
        image: ""
      },
      {
        id: "a2",
        name: "Jägermeister",
        description: "Amaro tedesco speziato, a base di 56 erbe.",
        price: "2.00€",
        image: ""
      },
      {
        id: "a3",
        name: "Montenegro",
        description: "Equilibrato, dolce-amaro con note di arancia.",
        price: "2.50€",
        image: ""
      },
      {
        id: "a4",
        name: "Jefferson",
        description: "Amaro calabrese naturale con agrumi e rosmarino.",
        price: "2.50€",
        image: ""
      },
      {
        id: "a5",
        name: "Limoncello",
        description: "Liquore dolce e fresco alle scorze di limone.",
        price: "2.50€",
        image: ""
      },
      {
        id: "a6",
        name: "Vecchia Romagna",
        description: "Storico brandy italiano, morbido e legnoso.",
        price: "2.00€",
        image: ""
      },
      {
        id: "a7",
        name: "Amaro al tartufo",
        description: "Particolare, con note terrose di tartufo.",
        price: "2.00€",
        image: ""
      },
      {
        id: "a8",
        name: "Borsci San Marzano",
        description: "Dolce e liquoroso, con un tocco di rum.",
        price: "2.00€",
        image: ""
      },
      {
        id: "a9",
        name: "Amaro Lucano",
        description: "Profilo balsamico, agrumato e ben bilanciato.",
        price: "2.00€",
        image: ""
      },
      {
        id: "a10",
        name: "Fernet-Branca",
        description: "Intenso, molto amaro e fortemente speziato.",
        price: "2.00€",
        image: ""
      },
      {
        id: "a11",
        name: "Brancamenta",
        description: "Fresco e balsamico, con spiccate note di menta.",
        price: "2.00€",
        image: ""
      },
      {
        id: "a12",
        name: "Liquirizia",
        description: "Liquore denso, dolce-amaro alla radice di liquirizia.",
        price: "2.50€",
        image: ""
      },
      {
        id: "a13",
        name: "Petrus Boonekamp",
        description: "Amarissimo e secco, senza zuccheri aggiunti.",
        price: "2.00€",
        image: ""
      },
      {
        id: "a14",
        name: "Caffè Borghetti",
        description: "Liquore dolce al vero caffè espresso italiano.",
        price: "2.00€",
        image: ""
      },
      {
        id: "a15",
        name: "Averna",
        description: "Morbido, corposo, con note di erbe mediterranee.",
        price: "2.00€",
        image: ""
      },
      {
        id: "a16",
        name: "Baileys",
        description: "Dolce e vellutata crema al whiskey irlandese.",
        price: "2.50€",
        image: ""
      },
      {
        id: "g1",
        name: "Diciotto Lune",
        description: "Affinata in botte, morbida con sentori di vaniglia.",
        price: "2.50€",
        image: ""
      },
      {
        id: "g2",
        name: "903 Barricata e Bianca",
        description: "Barricata (calda/speziata) o Bianca (secca/pulita).",
        price: "2.50€",
        image: ""
      },
      {
        id: "g3",
        name: "Poli Bianca / Secca Dry",
        description: "Distillato artigianale veneto, deciso e asciutto.",
        price: "3.00€",
        image: ""
      },
      {
        id: "g4",
        name: "Poli Barricata / Sarpa Oro",
        description: "Invecchiata in legno, aromatica e complessa.",
        price: "3.00€",
        image: ""
      }
    ],
    image: "/Amari.png"
  }
];
