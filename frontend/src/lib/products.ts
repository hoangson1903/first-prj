export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  oldPrice: number | null;
  imageUrl: string;
  sizes: string[];
  colors: string[];
  featured: boolean;
  stock: number;
};

export type CartItem = {
  product: Product;
  size: string;
  quantity: number;
};

export type StoreUser = {
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
};

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;

export const sampleProducts: Product[] = [
  { id: "ao-thun-nang", name: "Áo thun Nắng", category: "Áo thun", description: "Cotton 100% mềm mại, phom dáng rộng vừa, thoáng mát cho mọi ngày.", price: 329000, oldPrice: 390000, imageUrl: photo("photo-1521572163474-6864f9cf17ab"), sizes: ["S", "M", "L", "XL"], colors: ["Kem", "Nâu", "Đen"], featured: true, stock: 28 },
  { id: "so-mi-linen", name: "Sơ mi Linen Mây", category: "Áo sơ mi", description: "Chất linen tự nhiên, nhẹ tênh và thoáng khí cho ngày hè.", price: 549000, oldPrice: null, imageUrl: photo("photo-1598033129183-c4f50c736f10"), sizes: ["S", "M", "L", "XL"], colors: ["Kem", "Nâu", "Đen"], featured: true, stock: 18 },
  { id: "quan-ong-rong", name: "Quần ống rộng Nâu", category: "Quần", description: "Phom suông thanh lịch, chất vải đứng dáng nhưng vẫn dễ chịu.", price: 629000, oldPrice: null, imageUrl: photo("photo-1473966968600-fa801b869a1a"), sizes: ["S", "M", "L", "XL"], colors: ["Kem", "Nâu", "Đen"], featured: true, stock: 15 },
  { id: "ao-khoac-cham", name: "Áo khoác Chàm", category: "Áo khoác", description: "Lớp khoác nhẹ với gam màu chàm trầm, dễ phối đồ mỗi ngày.", price: 890000, oldPrice: 990000, imageUrl: photo("photo-1591047139829-d91aecb6caea"), sizes: ["S", "M", "L", "XL"], colors: ["Kem", "Nâu", "Đen"], featured: false, stock: 12 },
  { id: "dam-lua", name: "Đầm lụa Sớm Mai", category: "Váy", description: "Đầm midi mềm rũ, đường cắt tối giản và tinh tế.", price: 790000, oldPrice: null, imageUrl: photo("photo-1595777457583-95e059d581b8"), sizes: ["S", "M", "L", "XL"], colors: ["Kem", "Nâu", "Đen"], featured: true, stock: 9 },
  { id: "ao-polo-xanh", name: "Áo Polo Thảnh Thơi", category: "Áo thun", description: "Piqué cotton thoáng mát, cổ áo tinh gọn, mặc đẹp từ sáng đến tối.", price: 429000, oldPrice: null, imageUrl: photo("photo-1627225924765-552d49cf47ad"), sizes: ["S", "M", "L", "XL"], colors: ["Kem", "Nâu", "Đen"], featured: false, stock: 22 },
  { id: "quan-short-kaki", name: "Quần short Kaki", category: "Quần", description: "Kaki mềm, cạp thoải mái và túi sâu tiện dụng.", price: 389000, oldPrice: null, imageUrl: photo("photo-1591195853828-11db59a44f6b"), sizes: ["S", "M", "L", "XL"], colors: ["Kem", "Nâu", "Đen"], featured: false, stock: 20 },
  { id: "chan-vay-midi", name: "Chân váy Midi", category: "Váy", description: "Chân váy dáng chữ A nhẹ nhàng, phù hợp nhiều dịp.", price: 519000, oldPrice: 590000, imageUrl: photo("photo-1583496661160-fb5886a0aaaa"), sizes: ["S", "M", "L", "XL"], colors: ["Kem", "Nâu", "Đen"], featured: false, stock: 11 },
  { id: "ao-len-mong", name: "Áo len mỏng Dịu", category: "Áo thun", description: "Len cotton mịn nhẹ, lớp áo lý tưởng cho những ngày se lạnh.", price: 590000, oldPrice: null, imageUrl: photo("photo-1576566588028-4147f3842f27"), sizes: ["S", "M", "L", "XL"], colors: ["Kem", "Nâu", "Đen"], featured: false, stock: 13 },
  { id: "tui-vai-moc", name: "Túi vải Mộc", category: "Phụ kiện", description: "Túi vải canvas dày dặn, điểm nhấn nhỏ cho outfit thường ngày.", price: 219000, oldPrice: null, imageUrl: photo("photo-1544816155-12df9643f363"), sizes: ["S", "M", "L", "XL"], colors: ["Kem", "Nâu", "Đen"], featured: true, stock: 35 },
];
