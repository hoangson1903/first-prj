"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CartItem, Product, sampleProducts, StoreUser } from "@/lib/products";

const money = (amount: number) => new Intl.NumberFormat("vi-VN").format(amount) + "₫";
const categories = ["Tất cả", "Áo thun", "Áo sơ mi", "Quần", "Váy", "Áo khoác", "Phụ kiện"];
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function Storefront() {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadedCart, setLoadedCart] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [showCart, setShowCart] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<StoreUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [registerMode, setRegisterMode] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("macmoc-cart");
      if (saved) setCart(JSON.parse(saved) as CartItem[]);
    } catch (error) {
      console.error("Không thể đọc giỏ hàng đã lưu:", error);
    }
    setLoadedCart(true);
    try {
      const savedUser = localStorage.getItem("macmoc-user");
      if (savedUser) setUser(JSON.parse(savedUser) as StoreUser);
    } catch (error) {
      console.error("Không thể đọc thông tin tài khoản đã lưu:", error);
    }
    fetch(`${API_URL}/api/products`)
      .then((response) => {
        if (!response.ok) throw new Error(`API trả về ${response.status}`);
        return response.json() as Promise<Product[]>;
      })
      .then(setProducts)
      .catch((error: unknown) => console.info("Đang sử dụng danh sách sản phẩm mẫu.", error));
  }, []);

  useEffect(() => {
    if (loadedCart) localStorage.setItem("macmoc-cart", JSON.stringify(cart));
  }, [cart, loadedCart]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const visibleProducts = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase("vi");
    const filtered = products.filter((product) => {
      const matchesCategory = activeCategory === "Tất cả" || product.category === activeCategory;
      const matchesSearch = !normalized || `${product.name} ${product.category} ${product.description}`.toLocaleLowerCase("vi").includes(normalized);
      return matchesCategory && matchesSearch && (!favoritesOnly || favorites.includes(product.id));
    });
    if (sort === "price-asc") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...filtered].sort((a, b) => b.price - a.price);
    return [...filtered].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [products, activeCategory, search, sort, favoritesOnly, favorites]);

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 1_000_000 ? 0 : 30_000;

  function addToCart(product: Product, size = selectedSize) {
    setCart((items) => {
      const existing = items.find((item) => item.product.id === product.id && item.size === size);
      if (existing) return items.map((item) => item === existing ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item);
      return [...items, { product, size, quantity: 1 }];
    });
    setNotice("Đã thêm vào giỏ hàng");
    setActiveProduct(null);
  }

  function updateQuantity(productId: string, size: string, delta: number) {
    setCart((items) => items
      .map((item) => item.product.id === productId && item.size === size
        ? { ...item, quantity: item.quantity + delta }
        : item)
      .filter((item) => item.quantity > 0));
  }

  function openProduct(product: Product) {
    setSelectedSize(product.sizes.includes("M") ? "M" : product.sizes[0]);
    setActiveProduct(product);
  }

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      customerName: form.get("customerName"),
      email: form.get("email"),
      phone: form.get("phone"),
      address: form.get("address"),
      paymentMethod: form.get("paymentMethod"),
      items: cart.map((item) => ({ productId: item.product.id, size: item.size, quantity: item.quantity })),
    };
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? result.detail ?? "Không thể tạo đơn hàng. Vui lòng thử lại.");
      setOrderComplete(result.orderCode);
      setCart([]);
      setCheckout(false);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Có lỗi xảy ra khi đặt hàng.");
    } finally {
      setSubmitting(false);
    }
  }

    
  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthSubmitting(true);
    const form = new FormData(event.currentTarget);
    const register = registerMode;
    const payload = {
      ...(register ? { name: form.get("name") } : {}),
      email: form.get("email"),
      password: form.get("password"),
    };

    try {
      const response = await fetch(`${API_URL}/api/auth/${register ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Không thể đăng nhập. Vui lòng thử lại.");
      }

      localStorage.setItem("macmoc-token", result.token);
      localStorage.setItem("macmoc-user", JSON.stringify(result.user));
      setUser(result.user as StoreUser);
      setAuthOpen(false);
      setNotice(register ? "Tạo tài khoản thành công!" : `Xin chào ${result.user.name}!`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Có lỗi xảy ra.");
    } finally {
      setAuthSubmitting(false);
    }
  }

  function signOut() {
    localStorage.removeItem("macmoc-token");
    localStorage.removeItem("macmoc-user");
    setUser(null);
    setNotice("Bạn đã đăng xuất");
  }

  return (
    <main>
      <div className="announcement">Giao hàng miễn phí cho đơn từ 1.000.000₫ <span>✦</span> Đổi trả dễ dàng trong 7 ngày</div>
      <header className="site-header">
        <a className="brand" href="#" aria-label="Mặc Mộc trang chủ">mặc<span>mộc</span><i>.</i></a>
        <nav className="main-nav" aria-label="Danh mục chính">
          <a href="#collection">Bộ sưu tập</a><a href="#collection">Sản phẩm mới</a><a href="#story">Câu chuyện Mộc</a>
        </nav>
        <div className="header-actions">
          <label className="search-box"><span>⌕</span><input aria-label="Tìm sản phẩm" placeholder="Tìm món đồ bạn yêu..." value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <button className={`icon-button favorite-head ${favoritesOnly ? "is-favorite" : ""}`} aria-label={`Lọc sản phẩm yêu thích, ${favorites.length} món`} aria-pressed={favoritesOnly} onClick={() => { setFavoritesOnly((value) => !value); document.querySelector("#collection")?.scrollIntoView({ behavior: "smooth" }); }}>♡</button>
          {user ? <div className="account-actions"><span className="account-name">{user.name}</span>{user.role === "ADMIN" && <a className="admin-link" href="/admin">Quản trị ↗</a>}<button className="account-logout" onClick={signOut}>Thoát</button></div> : <button className="account-button" onClick={() => { setRegisterMode(false); setAuthOpen(true); }}>Đăng nhập</button>}
          <button className="icon-button bag-button" aria-label={`Mở giỏ hàng, ${itemCount} sản phẩm`} onClick={() => { setShowCart(true); setCheckout(false); }}>♧<span className="bag-count">{itemCount}</span></button>
        </div>
      </header>

      <section className="hero">
        <img className="hero-photo" src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2200&q=90" alt="Bộ sưu tập thời trang phong cách tự nhiên" />
        <div className="hero-shade" />
        <div className="hero-content">
          <span className="eyebrow hero-eyebrow"><span /> BỘ SƯU TẬP THU 2025</span>
          <h1>Mặc điều<br />mình <em>yêu.</em></h1>
          <p>Chạm vào chất liệu tự nhiên.<br />Tìm thấy phiên bản đẹp nhất của bạn.</p>
          <a href="#collection" className="button button-light">Khám phá bộ sưu tập <span>↗</span></a>
        </div>
        <div className="hero-note">01 — 04 <span /> MỘC / THU ĐÔNG</div>
        <div className="hero-side">SLOW FASHION · MADE WITH CARE</div>
      </section>

      <section className="values-strip" id="story">
        <div><span className="value-icon">✳</span><p><strong>Chất liệu tự nhiên</strong><small>Nhẹ dịu với làn da</small></p></div>
        <div><span className="value-icon">◌</span><p><strong>Thiết kế bền lâu</strong><small>Mặc đẹp qua năm tháng</small></p></div>
        <div><span className="value-icon">⌁</span><p><strong>Chăm chút từng đường may</strong><small>Thủ công tại Việt Nam</small></p></div>
        <div><span className="value-icon">♡</span><p><strong>Đổi trả trong 7 ngày</strong><small>Mua sắm thật an tâm</small></p></div>
      </section>

      <section className="collection section-wrap" id="collection">
        <div className="section-heading">
          <div><span className="eyebrow">{favoritesOnly ? "MÓN ĐỒ BẠN YÊU THÍCH" : "MẶC MỘC / 2025"}</span><h2>{favoritesOnly ? <>Đã lưu <em>{favorites.length} món đồ</em></> : <>Những món đồ <em>thân quen</em></>}</h2><p>{favoritesOnly ? "Những món đồ bạn muốn dành riêng cho mình." : "Thiết kế tối giản, để bạn là điều nổi bật nhất."}</p></div>
          <a className="text-link" href="#collection">Khám phá tất cả <span>↗</span></a>
        </div>
        <div className="category-row">
          <div className="category-tabs" role="tablist" aria-label="Lọc danh mục">
            {categories.map((category) => <button key={category} className={activeCategory === category ? "category-tab active" : "category-tab"} onClick={() => setActiveCategory(category)}>{category}</button>)}
          </div>
          <label className="sort-control">Sắp xếp <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sắp xếp sản phẩm"><option value="featured">Nổi bật</option><option value="price-asc">Giá tăng dần</option><option value="price-desc">Giá giảm dần</option></select></label>
        </div>
        <div className="product-grid">
          {visibleProducts.map((product, index) => (
            <article className="product-card" key={product.id}>
              <button className="product-image" onClick={() => openProduct(product)} aria-label={`Xem ${product.name}`}>
                <img src={product.imageUrl} alt={product.name} loading={index > 3 ? "lazy" : "eager"} />
                {product.oldPrice && <span className="sale-tag">- {Math.round((1 - product.price / product.oldPrice) * 100)}%</span>}
                <span className="quick-view">Xem sản phẩm <b>↗</b></span>
              </button>
              <button className={`heart-button ${favorites.includes(product.id) ? "is-favorite" : ""}`} onClick={() => setFavorites((items) => items.includes(product.id) ? items.filter((id) => id !== product.id) : [...items, product.id])} aria-label="Thêm vào yêu thích">{favorites.includes(product.id) ? "♥" : "♡"}</button>
              <div className="product-info"><span className="product-category">{product.category}</span><button className="product-name" onClick={() => openProduct(product)}>{product.name}</button><div className="product-price">{money(product.price)} {product.oldPrice && <del>{money(product.oldPrice)}</del>}</div></div>
              <button className="add-button" onClick={() => openProduct(product)}>+ Thêm nhanh</button>
            </article>
          ))}
        </div>
        {visibleProducts.length === 0 && <div className="empty-results"><span>⌕</span><h3>Chưa tìm thấy món đồ phù hợp</h3><p>Thử từ khóa khác hoặc chọn danh mục bên trên nhé.</p><button className="text-link" onClick={() => { setSearch(""); setActiveCategory("Tất cả"); }}>Xem tất cả sản phẩm ↗</button></div>}
        <div className="collection-footer"><span>ĐANG HIỂN THỊ {visibleProducts.length} / {products.length} SẢN PHẨM</span><a href="#collection">Xem thêm sản phẩm <span>↓</span></a></div>
      </section>

      <section className="editorial">
        <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85" alt="Phong cách tự nhiên từ Mặc Mộc" loading="lazy" />
        <div className="editorial-copy"><span className="eyebrow">MỘC TRONG TỪNG ĐIỀU NHỎ</span><h2>Đẹp theo cách<br /><em>rất riêng.</em></h2><p>Chúng mình tin rằng quần áo đẹp nhất là quần áo khiến bạn được là chính mình. Mỗi thiết kế tại Mặc Mộc đều bắt đầu từ cảm hứng ấy.</p><a className="button button-dark" href="#story">Chuyện của Mặc Mộc <span>↗</span></a></div>
      </section>

      <section className="newsletter">
        <span className="eyebrow">THƯ TỪ MẶC MỘC</span><h2>Một chút dịu dàng<br />trong hộp thư của bạn.</h2><p>Nhận tin về bộ sưu tập mới và những ưu đãi nho nhỏ nhé.</p>
        <form onSubmit={(event) => { event.preventDefault(); setNotice("Cảm ơn bạn đã đăng ký nhận tin!"); (event.currentTarget as HTMLFormElement).reset(); }}><input type="email" placeholder="Địa chỉ email của bạn" required aria-label="Địa chỉ email" /><button type="submit" aria-label="Đăng ký nhận tin">→</button></form>
        <small>Bằng cách đăng ký, bạn đồng ý nhận email từ Mặc Mộc.</small>
      </section>

      <footer className="site-footer">
        <div className="footer-main"><div className="footer-brand"><a className="brand" href="#">mặc<span>mộc</span><i>.</i></a><p>Mặc điều mình yêu.<br />Sống chậm theo cách mình muốn.</p></div>
          <div><h4>KHÁM PHÁ</h4><a href="#collection">Sản phẩm mới</a><a href="#collection">Áo & sơ mi</a><a href="#collection">Quần & váy</a></div>
          <div><h4>HỖ TRỢ</h4><a href="#story">Chính sách đổi trả</a><a href="#story">Hướng dẫn chọn size</a><a href="#story">Liên hệ với Mộc</a></div>
          <div><h4>GHÉ THĂM MỘC</h4><p>12 Nguyễn Trãi, Quận 1<br />TP. Hồ Chí Minh</p><p>hello@macmoc.vn<br />1900 1234 56</p></div>
        </div><div className="footer-bottom"><span>© 2025 MẶC MỘC. MADE WITH CARE IN VIETNAM.</span><span>INSTAGRAM&nbsp;&nbsp; · &nbsp;&nbsp;FACEBOOK&nbsp;&nbsp; · &nbsp;&nbsp;TIKTOK</span></div>
      </footer>

      {notice && <div className="toast" role="status">{notice}</div>}
      {authOpen && <div className="modal-backdrop" onClick={() => setAuthOpen(false)}><section className="auth-modal" role="dialog" aria-modal="true" aria-label={registerMode ? "Đăng ký tài khoản" : "Đăng nhập"} onClick={(event) => event.stopPropagation()}><button className="close-button auth-close" onClick={() => setAuthOpen(false)} aria-label="Đóng">×</button><span className="eyebrow">MẶC MỘC / TÀI KHOẢN</span><h2>{registerMode ? "Tạo tài khoản mới" : "Chào mừng bạn trở lại"}</h2><p>{registerMode ? "Đăng ký để lưu lại những món đồ bạn yêu." : "Đăng nhập để tiếp tục hành trình cùng Mộc."}</p><form className="auth-form" onSubmit={submitAuth}>{registerMode && <label>Họ và tên<input name="name" required maxLength={100} autoComplete="name" placeholder="Nguyễn Minh Anh" /></label>}<label>Email<input name="email" type="email" required maxLength={150} autoComplete="email" placeholder="ban@email.com" /></label><label>Mật khẩu<input name="password" type="password" required minLength={8} maxLength={72} autoComplete={registerMode ? "new-password" : "current-password"} placeholder="Ít nhất 8 ký tự" /></label><button className="button button-dark full-button" disabled={authSubmitting}>{authSubmitting ? "Đang xử lý..." : registerMode ? "Tạo tài khoản" : "Đăng nhập"} <span>↗</span></button></form><button className="auth-switch" onClick={() => setRegisterMode((value) => !value)}>{registerMode ? "Đã có tài khoản? Đăng nhập" : "Bạn mới đến Mặc Mộc? Tạo tài khoản"}</button></section></div>}
      {activeProduct && <div className="modal-backdrop" onClick={() => setActiveProduct(null)}><section className="product-modal" role="dialog" aria-modal="true" aria-label={activeProduct.name} onClick={(event) => event.stopPropagation()}><button className="close-button" onClick={() => setActiveProduct(null)} aria-label="Đóng">×</button><img src={activeProduct.imageUrl} alt={activeProduct.name} /><div className="modal-copy"><span className="eyebrow">{activeProduct.category}</span><h2>{activeProduct.name}</h2><div className="product-price modal-price">{money(activeProduct.price)} {activeProduct.oldPrice && <del>{money(activeProduct.oldPrice)}</del>}</div><p>{activeProduct.description}</p><label className="size-label">CHỌN KÍCH CỠ <a href="#story">Hướng dẫn chọn size</a></label><div className="size-options">{activeProduct.sizes.map((size) => <button key={size} className={size === selectedSize ? "size-option selected" : "size-option"} onClick={() => setSelectedSize(size)}>{size}</button>)}</div><span className="stock-note">{activeProduct.stock > 0 ? `Còn ${activeProduct.stock} sản phẩm` : "Tạm hết hàng"}</span><button className="button button-dark full-button" disabled={activeProduct.stock === 0} onClick={() => addToCart(activeProduct)}>Thêm vào giỏ hàng <span>↗</span></button><div className="modal-promise">♡ &nbsp; Đổi trả miễn phí trong 7 ngày</div></div></section></div>}

      {showCart && <div className="drawer-backdrop" onClick={() => setShowCart(false)}><aside className="cart-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-heading"><div><span className="eyebrow">{checkout ? "THÔNG TIN GIAO HÀNG" : "GIỎ HÀNG CỦA BẠN"}</span><h2>{orderComplete ? "Đặt hàng thành công" : checkout ? "Thanh toán" : `Túi đồ (${itemCount})`}</h2></div><button className="close-button" onClick={() => { setShowCart(false); setOrderComplete(""); }} aria-label="Đóng">×</button></div>
        {orderComplete ? <div className="success-state"><div>✓</div><h3>Cảm ơn bạn đã chọn Mặc Mộc!</h3><p>Đơn hàng <strong>{orderComplete}</strong> đã được ghi nhận. Mộc sẽ sớm liên hệ xác nhận với bạn.</p><button className="button button-dark full-button" onClick={() => { setShowCart(false); setOrderComplete(""); }}>Tiếp tục mua sắm</button></div>
        : checkout ? <form className="checkout-form" onSubmit={placeOrder}><button type="button" className="back-link" onClick={() => setCheckout(false)}>← Quay lại giỏ hàng</button><label>Họ và tên<input name="customerName" autoComplete="name" required maxLength={100} placeholder="Nguyễn Minh Anh" /></label><div className="form-row"><label>Email<input type="email" name="email" autoComplete="email" required placeholder="ban@email.com" /></label><label>Số điện thoại<input name="phone" type="tel" autoComplete="tel" required pattern="[0-9+() .-]{9,20}" placeholder="090 123 4567" /></label></div><label>Địa chỉ nhận hàng<textarea name="address" autoComplete="street-address" required maxLength={300} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" rows={3} /></label><fieldset><legend>PHƯƠNG THỨC THANH TOÁN</legend><label className="radio-option"><input type="radio" name="paymentMethod" value="COD" defaultChecked /> Thanh toán khi nhận hàng (COD)</label><label className="radio-option"><input type="radio" name="paymentMethod" value="BANK_TRANSFER" /> Chuyển khoản ngân hàng</label></fieldset><div className="checkout-total"><span>Tổng thanh toán</span><strong>{money(subtotal + shipping)}</strong></div><button className="button button-dark full-button" disabled={submitting}>{submitting ? "Đang tạo đơn hàng..." : "Đặt hàng"} <span>↗</span></button><small className="secure-note">Thông tin của bạn được bảo mật an toàn.</small></form>
        : cart.length === 0 ? <div className="empty-cart"><div>♧</div><h3>Chiếc túi còn đang trống</h3><p>Mình cùng tìm vài món đồ thật hợp với bạn nhé.</p><button className="button button-dark" onClick={() => setShowCart(false)}>Khám phá sản phẩm</button></div>
        : <><div className="free-ship-note">{subtotal >= 1_000_000 ? "Tuyệt vời! Đơn hàng của bạn được miễn phí giao hàng ✦" : `Mua thêm ${money(1_000_000 - subtotal)} để được miễn phí giao hàng`}</div><div className="cart-items">{cart.map((item) => <div className="cart-item" key={`${item.product.id}-${item.size}`}><img src={item.product.imageUrl} alt={item.product.name} /><div className="cart-item-copy"><strong>{item.product.name}</strong><span>Kích cỡ: {item.size}</span><b>{money(item.product.price)}</b><div className="quantity-control"><button aria-label="Giảm số lượng" onClick={() => updateQuantity(item.product.id, item.size, -1)}>−</button><span>{item.quantity}</span><button aria-label="Tăng số lượng" onClick={() => updateQuantity(item.product.id, item.size, 1)} disabled={item.quantity >= item.product.stock}>+</button><button className="remove-item" onClick={() => setCart((items) => items.filter((entry) => entry !== item))}>Xóa</button></div></div></div>)}</div><div className="cart-summary"><div><span>Tạm tính</span><span>{money(subtotal)}</span></div><div><span>Phí giao hàng</span><span>{shipping === 0 ? "Miễn phí" : money(shipping)}</span></div><div className="summary-total"><strong>Tổng cộng</strong><strong>{money(subtotal + shipping)}</strong></div><button className="button button-dark full-button" onClick={() => setCheckout(true)}>Tiến hành thanh toán <span>↗</span></button><p>Thuế đã bao gồm. Phí giao hàng được tính ở bước thanh toán.</p></div></>}
      </aside></div>}
    </main>
  );
}
