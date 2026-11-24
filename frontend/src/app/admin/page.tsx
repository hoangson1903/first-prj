"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Product, StoreUser } from "@/lib/products";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const money = (amount: number) => new Intl.NumberFormat("vi-VN").format(amount) + "₫";

type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  monthlyRevenue: { month: string; revenue: number }[];
  recentOrders: { id: string; orderCode: string; status: string; total: number; createdAt: string }[];
};

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadDashboard = useCallback(async () => {
    const token = localStorage.getItem("macmoc-token");
    const savedUser = localStorage.getItem("macmoc-user");
    if (!token || !savedUser) {
      router.replace("/");
      return;
    }
    const user = JSON.parse(savedUser) as StoreUser;
    if (user.role !== "ADMIN") {
      router.replace("/");
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsResponse, productsResponse] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, { headers }),
        fetch(`${API_URL}/api/admin/products`, { headers }),
      ]);
      if ([statsResponse.status, productsResponse.status].some((status) => status === 401 || status === 403)) {
        localStorage.removeItem("macmoc-token");
        localStorage.removeItem("macmoc-user");
        router.replace("/");
        return;
      }
      if (!statsResponse.ok || !productsResponse.ok) throw new Error("Không tải được dữ liệu quản trị.");
      const [dashboard, productList] = await Promise.all([
        statsResponse.json() as Promise<DashboardStats>,
        productsResponse.json() as Promise<Product[]>,
      ]);
      setStats(dashboard);
      setProducts(productList);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const oldPrice = String(form.get("oldPrice") ?? "").trim();
    const payload = {
      name: form.get("name"),
      category: form.get("category"),
      description: form.get("description"),
      price: Number(form.get("price")),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      imageUrl: form.get("imageUrl"),
      sizes: String(form.get("sizes")).split(",").map((value) => value.trim()).filter(Boolean),
      colors: String(form.get("colors")).split(",").map((value) => value.trim()).filter(Boolean),
      featured: form.get("featured") === "on",
      stock: Number(form.get("stock")),
    };
    try {
      const response = await fetch(`${API_URL}/api/admin/products${editingProduct ? `/${encodeURIComponent(editingProduct.id)}` : ""}`, {
        method: editingProduct ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("macmoc-token") ?? ""}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? (editingProduct ? "Không thể cập nhật sản phẩm." : "Không thể thêm sản phẩm."));
      formElement.reset();
      setNotice(editingProduct ? `Đã cập nhật sản phẩm “${(result as Product).name}”.` : `Đã thêm sản phẩm “${(result as Product).name}”.`);
      setEditingProduct(null);
      await loadDashboard();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Có lỗi xảy ra.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Xóa sản phẩm “${product.name}”? Sản phẩm sẽ không còn xuất hiện trong cửa hàng.`)) return;
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/admin/products/${encodeURIComponent(product.id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("macmoc-token") ?? ""}` },
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message ?? "Không thể xóa sản phẩm.");
      }
      if (editingProduct?.id === product.id) setEditingProduct(null);
      setNotice(`Đã xóa sản phẩm “${product.name}”.`);
      await loadDashboard();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Có lỗi xảy ra.");
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <a className="brand" href="/">mặc<span>mộc</span><i>.</i></a>
        <div><a href="/">← Về cửa hàng</a><span>TRANG QUẢN TRỊ</span></div>
      </header>
      <section className="admin-content">
        <div className="admin-title"><div><span className="eyebrow">MẶC MỘC / ADMIN</span><h1>Tổng quan cửa hàng</h1><p>Doanh thu dưới đây là tổng giá trị đơn hàng đã tạo, chưa trừ hoàn/hủy.</p></div><div className="admin-title-actions"><a className="admin-refresh" href="#products">Danh sách sản phẩm ↓</a><button className="admin-refresh" onClick={() => void loadDashboard()}>↻ Làm mới</button></div></div>
        {error && <div className="admin-alert" role="alert">{error}</div>}
        {notice && <div className="admin-success" role="status">{notice}</div>}
        {loading ? <div className="admin-loading">Đang tải dữ liệu cửa hàng...</div> : stats && <>
          <div className="stats-grid">
            <article><span>DOANH THU ĐƠN HÀNG</span><strong>{money(stats.totalRevenue)}</strong><small>Tổng giá trị đơn đã tạo</small></article>
            <article><span>ĐƠN HÀNG</span><strong>{stats.totalOrders}</strong><small>Tất cả trạng thái</small></article>
            <article><span>SẢN PHẨM</span><strong>{stats.totalProducts}</strong><small>Đang có trong cửa hàng</small></article>
            <article><span>KHÁCH HÀNG</span><strong>{stats.totalCustomers}</strong><small>Tài khoản đã đăng ký</small></article>
          </div>
          <div className="admin-columns">
            <section className="admin-panel"><div className="panel-heading"><div><span className="eyebrow">HIỆU QUẢ KINH DOANH</span><h2>Doanh thu theo tháng</h2></div></div>
              {stats.monthlyRevenue.length ? <div className="revenue-list">{stats.monthlyRevenue.map((month) => {
                const max = Math.max(...stats.monthlyRevenue.map((entry) => entry.revenue), 1);
                return <div className="revenue-row" key={month.month}><span>{month.month}</span><div className="revenue-track"><i style={{ width: `${Math.max(3, month.revenue / max * 100)}%` }} /></div><strong>{money(month.revenue)}</strong></div>;
              })}</div> : <p className="admin-empty">Chưa có đơn hàng để thống kê.</p>}
            </section>
            <section className="admin-panel"><div className="panel-heading"><div><span className="eyebrow">ĐƠN MỚI NHẤT</span><h2>Đơn hàng gần đây</h2></div></div>
              {stats.recentOrders.length ? <div className="order-list">{stats.recentOrders.map((order) => <div className="admin-order" key={order.id}><div><strong>{order.orderCode}</strong><small>{new Date(order.createdAt).toLocaleDateString("vi-VN")} · {order.status}</small></div><b>{money(order.total)}</b></div>)}</div> : <p className="admin-empty">Chưa có đơn hàng.</p>}
            </section>
          </div>
          <section className="admin-panel products-panel" id="products"><div className="panel-heading"><div><span className="eyebrow">QUẢN LÝ DANH MỤC</span><h2>Danh sách sản phẩm cửa hàng <small>({products.length})</small></h2></div><label className="product-search"><span>⌕</span><input aria-label="Tìm sản phẩm trong danh sách quản trị" placeholder="Tìm sản phẩm..." value={productQuery} onChange={(event) => setProductQuery(event.target.value)} /></label></div>
            {products.length ? <div className="managed-products">{products.filter((product) => `${product.name} ${product.category}`.toLocaleLowerCase("vi").includes(productQuery.trim().toLocaleLowerCase("vi"))).map((product) => <article className="managed-product" key={product.id}>
              <img src={product.imageUrl} alt={product.name} />
              <div className="managed-product-info"><strong>{product.name}</strong><span>{product.category} · {money(product.price)}{product.oldPrice ? ` · Giá cũ ${money(product.oldPrice)}` : ""}</span><small>{product.description}</small><small>Tồn kho: {product.stock} · Size: {product.sizes.join(", ")} · Màu: {product.colors.join(", ")}{product.featured ? " · Nổi bật" : ""}</small></div>
              <div className="managed-product-actions"><button onClick={() => { setEditingProduct(product); document.querySelector("#product-form")?.scrollIntoView({ behavior: "smooth" }); }}>Sửa</button><button className="delete-product-button" onClick={() => void deleteProduct(product)}>Xóa</button></div>
            </article>)}</div> : <p className="admin-empty">Chưa có sản phẩm nào.</p>}
            {products.length > 0 && !products.some((product) => `${product.name} ${product.category}`.toLocaleLowerCase("vi").includes(productQuery.trim().toLocaleLowerCase("vi"))) && <p className="admin-empty">Không tìm thấy sản phẩm phù hợp.</p>}
          </section>
          <section className="admin-panel add-product-panel" id="product-form"><div className="panel-heading"><div><span className="eyebrow">{editingProduct ? "CHỈNH SỬA SẢN PHẨM" : "QUẢN LÝ DANH MỤC"}</span><h2>{editingProduct ? editingProduct.name : "Thêm sản phẩm mới"}</h2></div>{editingProduct && <button className="cancel-edit-button" onClick={() => setEditingProduct(null)}>Hủy chỉnh sửa</button>}</div>
            <form className="product-form" key={editingProduct?.id ?? "new-product"} onSubmit={saveProduct}>
              <label>Tên sản phẩm<input name="name" required maxLength={120} defaultValue={editingProduct?.name ?? ""} /></label>
              <label>Danh mục<input name="category" required maxLength={60} placeholder="Ví dụ: Áo thun" defaultValue={editingProduct?.category ?? ""} /></label>
              <label className="wide-field">Mô tả<textarea name="description" rows={3} required maxLength={1000} defaultValue={editingProduct?.description ?? ""} /></label>
              <label>Giá bán (₫)<input name="price" type="number" min="1" step="1000" required defaultValue={editingProduct?.price ?? ""} /></label>
              <label>Giá cũ (₫), không bắt buộc<input name="oldPrice" type="number" min="1" step="1000" defaultValue={editingProduct?.oldPrice ?? ""} /></label>
              <label className="wide-field">Đường dẫn hình ảnh<input name="imageUrl" type="url" required maxLength={500} placeholder="https://..." defaultValue={editingProduct?.imageUrl ?? ""} /></label>
              <label>Kích cỡ, cách nhau bằng dấu phẩy<input name="sizes" defaultValue={editingProduct?.sizes.join(", ") ?? "S, M, L, XL"} required /></label>
              <label>Màu sắc, cách nhau bằng dấu phẩy<input name="colors" defaultValue={editingProduct?.colors.join(", ") ?? "Kem, Nâu, Đen"} required /></label>
              <label>Số lượng tồn<input name="stock" type="number" min="0" max="100000" defaultValue={editingProduct?.stock ?? 10} required /></label>
              <label className="featured-option"><input name="featured" type="checkbox" defaultChecked={editingProduct?.featured ?? false} /> Đánh dấu sản phẩm nổi bật</label>
              <div className="wide-field"><button className="button button-dark" disabled={saving}>{saving ? "Đang lưu..." : editingProduct ? "Lưu thay đổi" : "Thêm sản phẩm"} <span>↗</span></button></div>
            </form>
          </section>
        </>}
      </section>
    </main>
  );
}
