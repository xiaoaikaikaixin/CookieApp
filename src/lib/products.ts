export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: "cny" | "nuts" | "deals";
  description: string;
  ingredients: string;
}

export interface GiftSet {
  id: string;
  name: string;
  desc: string;
  price: number;
  image: string;
}

export const products: Product[] = [
  {
    id: "pineapple-tart",
    name: "Pineapple Tart",
    price: 19.8,
    rating: 4.9,
    reviews: 128,
    image: "/images/pineapple-tart.png",
    category: "cny",
    description:
      "Buttery, melt-in-your-mouth pastry filled with tangy homemade pineapple jam. A Chinese New Year classic, handcrafted daily in small batches using premium butter and fresh pineapples picked at peak ripeness.",
    ingredients:
      "Butter, wheat flour, pineapple jam (pineapple, sugar), egg, sugar, milk powder, salt.",
  },
  {
    id: "almond-cookies",
    name: "Almond Cookies",
    price: 19.8,
    rating: 4.8,
    reviews: 96,
    image: "/images/almond-cookies.png",
    category: "nuts",
    description:
      "Crisp, delicately sweet cookies packed with roasted almond flakes. A light, buttery bite that pairs perfectly with tea or coffee.",
    ingredients: "Wheat flour, butter, almond flakes, sugar, egg, salt.",
  },
  {
    id: "chocolate-cookies",
    name: "Chocolate Cookies",
    price: 19.8,
    rating: 4.9,
    reviews: 142,
    image: "/images/chocolate-cookies.png",
    category: "deals",
    description:
      "Rich, fudgy chocolate crinkle cookies dusted with icing sugar. Deeply chocolatey with a soft, chewy centre.",
    ingredients:
      "Wheat flour, cocoa powder, butter, sugar, egg, chocolate chips, icing sugar.",
  },
  {
    id: "kuih-bangkit",
    name: "Kuih Bangkit Cookies",
    price: 19.8,
    rating: 4.7,
    reviews: 74,
    image: "/images/kuih-bangkit.png",
    category: "cny",
    description:
      "Traditional tapioca cookies that melt in your mouth, infused with fragrant coconut milk and pandan. A festive favourite.",
    ingredients: "Tapioca flour, coconut milk, sugar, egg, pandan extract.",
  },
  {
    id: "peanut-cookies",
    name: "Peanut Cookies",
    price: 16.8,
    rating: 4.6,
    reviews: 58,
    image:
      "https://images.unsplash.com/photo-1675670701819-26b4ba81dc40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    category: "nuts",
    description:
      "Crumbly, nutty cookies made with freshly ground roasted peanuts. A simple, comforting classic.",
    ingredients: "Peanuts, wheat flour, sugar, vegetable oil, salt.",
  },
  {
    id: "cashew-cookies",
    name: "Cashew Nut Cookies",
    price: 24.8,
    rating: 4.8,
    reviews: 63,
    image:
      "https://images.unsplash.com/photo-1764607080323-f9c760408cd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    category: "nuts",
    description:
      "Buttery shortbread-style cookies topped with a whole roasted cashew. Rich, indulgent, and satisfyingly crunchy.",
    ingredients: "Wheat flour, butter, whole cashew nuts, sugar, egg.",
  },
  {
    id: "green-bean-cookies",
    name: "Green Bean Cookies",
    price: 15.8,
    rating: 4.5,
    reviews: 41,
    image:
      "https://images.unsplash.com/photo-1603092222141-667ae849508f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    category: "deals",
    description:
      "Light, delicately sweet cookies made from ground mung beans. A gentle, not-too-sweet treat.",
    ingredients: "Mung bean flour, vegetable oil, sugar, salt.",
  },
  {
    id: "coconut-cookies",
    name: "Coconut Cookies",
    price: 17.8,
    rating: 4.7,
    reviews: 52,
    image:
      "https://images.unsplash.com/photo-1619272132353-54f96ef393a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    category: "deals",
    description:
      "Toasted desiccated coconut baked into a buttery, golden cookie. Fragrant and full of tropical flavour.",
    ingredients: "Wheat flour, butter, desiccated coconut, sugar, egg.",
  },
];

export const giftSets: GiftSet[] = [
  {
    id: "spring-festival-set",
    name: "Spring Festival Set",
    desc: "8 assorted cookies in premium gift box",
    price: 38.0,
    image: "/images/gift-box-1.png",
  },
  {
    id: "deluxe-gift-hamper",
    name: "Deluxe Gift Hamper",
    desc: "12 premium cookies + tea set",
    price: 68.8,
    image: "/images/gift-box-5.png",
  },
  {
    id: "mini-treats-box",
    name: "Mini Treats Box",
    desc: "4 mini treats, perfect for sharing",
    price: 25.0,
    image:
      "https://images.unsplash.com/photo-1589283467257-3c3b52945db1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: "premium-assorted-tin",
    name: "Premium Assorted Tin",
    desc: "16 assorted cookies in a keepsake tin",
    price: 88.0,
    image:
      "https://images.unsplash.com/photo-1726733969863-c5544cde7186?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: "family-sharing-set",
    name: "Family Sharing Set",
    desc: "10 cookies + 2 festive drinks",
    price: 55.0,
    image:
      "https://images.unsplash.com/photo-1606293926980-ff0313a65624?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
];

export const categories = [
  { id: "cny", label: "CNY Cookies", image: "/images/category-cny.png" },
  { id: "gift", label: "Gift Box", image: "/images/gift-box-4.png" },
  { id: "nuts", label: "Cashnut & Nuts", image: "/images/category-nuts.png" },
  {
    id: "deals",
    label: "Daily Deals",
    image:
      "https://images.unsplash.com/photo-1771886587700-2096f5edef4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
] as const;

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function getGiftSet(id: string) {
  return giftSets.find((g) => g.id === id);
}
