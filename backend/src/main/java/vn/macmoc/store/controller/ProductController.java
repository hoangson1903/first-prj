package vn.macmoc.store.controller;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import vn.macmoc.store.model.Product;
import vn.macmoc.store.repository.ProductRepository;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository products;

    public ProductController(ProductRepository products) {
        this.products = products;
    }

    @GetMapping
    public List<Product> list(@RequestParam(required = false) String category,
                              @RequestParam(required = false) String q,
                              @RequestParam(defaultValue = "featured") String sort) {
        var result = products.findAll().stream()
                .filter(p -> category == null || category.isBlank() || category.equalsIgnoreCase(p.getCategory()))
                .filter(p -> q == null || q.isBlank()
                        || (p.getName() + " " + p.getDescription()).toLowerCase(Locale.ROOT)
                        .contains(q.trim().toLowerCase(Locale.ROOT)));
        if ("price-asc".equals(sort)) result = result.sorted(Comparator.comparingDouble(Product::getPrice));
        else if ("price-desc".equals(sort)) result = result.sorted(Comparator.comparingDouble(Product::getPrice).reversed());
        else result = result.sorted(Comparator.comparing(Product::isFeatured).reversed());
        return result.toList();
    }

    @GetMapping("/{id}")
    public Product get(@PathVariable String id) {
        return products.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));
    }
}
