package vn.macmoc.store.controller;

import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.TreeMap;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.Valid;
import vn.macmoc.store.dto.CreateProductRequest;
import vn.macmoc.store.model.Order;
import vn.macmoc.store.model.Product;
import vn.macmoc.store.repository.OrderRepository;
import vn.macmoc.store.repository.ProductRepository;
import vn.macmoc.store.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final ProductRepository products;
    private final OrderRepository orders;
    private final UserRepository users;
    public AdminController(ProductRepository products, OrderRepository orders, UserRepository users) {
        this.products = products;
        this.orders = orders;
        this.users = users;
    }

    @GetMapping("/stats")
    public DashboardStats stats(HttpServletRequest request) {
        requireAdmin(request);
        var allOrders = orders.findAll();
        var monthly = new TreeMap<String, Double>();
        double revenue = 0;
        for (Order order : allOrders) {
            revenue += order.getTotal();
            if (order.getCreatedAt() != null) {
                String month = YearMonth.from(order.getCreatedAt().atZone(ZoneId.systemDefault())).toString();
                monthly.merge(month, order.getTotal(), Double::sum);
            }
        }
        var recentOrders = new ArrayList<>(allOrders);
        recentOrders.sort((a, b) -> {
            if (a.getCreatedAt() == null) return b.getCreatedAt() == null ? 0 : 1;
            if (b.getCreatedAt() == null) return -1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });
        return new DashboardStats(revenue, allOrders.size(), products.count(),
                users.countByRole("CUSTOMER"),
                monthly.entrySet().stream().map(entry -> new MonthlyRevenue(entry.getKey(), entry.getValue())).toList(),
                recentOrders.stream().limit(10).toList());
    }

    @PostMapping("/products")
    public Product addProduct(HttpServletRequest httpRequest, @Valid @RequestBody CreateProductRequest request) {
        requireAdmin(httpRequest);
        var product = new Product(null, request.name().trim(), request.category().trim(),
                request.description().trim(), request.price(), request.oldPrice(), request.imageUrl().trim(),
                List.copyOf(request.sizes()), List.copyOf(request.colors()), request.featured(), request.stock());
        return products.save(product);
    }

    @GetMapping("/products")
    public List<Product> listProducts(HttpServletRequest request) {
        requireAdmin(request);
        return products.findAll();
    }

    @PutMapping("/products/{id}")
    public Product updateProduct(HttpServletRequest request, @PathVariable String id,
                                 @Valid @RequestBody CreateProductRequest productRequest) {
        requireAdmin(request);
        var product = products.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));
        product.setName(productRequest.name().trim());
        product.setCategory(productRequest.category().trim());
        product.setDescription(productRequest.description().trim());
        product.setPrice(productRequest.price());
        product.setOldPrice(productRequest.oldPrice());
        product.setImageUrl(productRequest.imageUrl().trim());
        product.setSizes(List.copyOf(productRequest.sizes()));
        product.setColors(List.copyOf(productRequest.colors()));
        product.setFeatured(productRequest.featured());
        product.setStock(productRequest.stock());
        return products.save(product);
    }

    @DeleteMapping("/products/{id}")
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(HttpServletRequest request, @PathVariable String id) {
        requireAdmin(request);
        if (!products.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm");
        }
        products.deleteById(id);
    }

    private void requireAdmin(HttpServletRequest request) {
        var principal = AuthController.requireUser(request);
        if (!"ADMIN".equals(principal.role())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ quản trị viên mới được phép thao tác");
        }
    }

    public record MonthlyRevenue(String month, double revenue) {}
    public record DashboardStats(double totalRevenue, long totalOrders, long totalProducts,
                                 long totalCustomers, List<MonthlyRevenue> monthlyRevenue,
                                 List<Order> recentOrders) {}
}
