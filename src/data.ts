export interface ProductPrice {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price?: string;
  prices?: ProductPrice[];
  image: string;
  allergens?: string[];
}

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
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
    products: [
      {
        id: "p1",
        name: "Dragonfly Burger",
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
    image: "https://images.unsplash.com/photo-1628191010210-a59de33e5941?auto=format&fit=crop&q=80&w=800",
    products: [
      {
        id: "pi1",
        name: "Classica",
        description: "Prosciutto crudo, squacquerone, rucola.",
        price: "7.50€",
        image: "https://images.unsplash.com/photo-1628191010210-a59de33e5941?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "pi2",
        name: "Contadina",
        description: "Salsiccia, peperoni, cipolla.",
        price: "8.50€",
        image: "https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&q=80&w=800"
      }
    ]
  },
  {
    id: "fritti",
    name: "Fritti",
    icon: "🍟",
    image: "https://images.unsplash.com/photo-1573016608464-54269945138e?auto=format&fit=crop&q=80&w=800",
    products: [
      {
        id: "f1",
        name: "Patatine Rustiche",
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
        description: "Patatine, anelli di cipolla, mozzarelline, crocchette.",
        price: "9.50€",
        image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=800"
      }
    ]
  },
  {
    id: "cocktail",
    name: "Cocktail",
    icon: "🍸",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800",
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
    name: "Birre",
    icon: "🍺",
    image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=800",
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
    name: "Birre Artigianali",
    icon: "🍻",
    image: "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800",
    products: [
      {
        id: "bi1",
        name: "Coca Cola",
        description: "33cl in vetro.",
        price: "3.50€",
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "bi2",
        name: "Acqua Naturale/Frizzante",
        description: "50cl.",
        price: "1.50€",
        image: "https://images.unsplash.com/photo-1523362628744-0c100150b504?auto=format&fit=crop&q=80&w=800"
      }
    ]
  },
  {
    id: "dolci",
    name: "Dolci",
    icon: "🍰",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1569701813229-33284b643e3c?auto=format&fit=crop&q=80&w=800",
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
