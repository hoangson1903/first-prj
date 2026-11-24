package vn.macmoc.store.controller;

import java.util.ArrayList;
import java.util.UUID;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.Valid;
import vn.macmoc.store.dto.CreateOrderRequest;
import vn.macmoc.store.model.Order;
import vn.macmoc.store.model.OrderItem;
import vn.macmoc.store.repository.OrderRepository;
import vn.macmoc.store.repository.ProductRepository;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final ProductRepository products;
    private final OrderRepository orders;
    private final MongoTemplate mongoTemplate;

    public OrderController(ProductRepository products, OrderRepository orders, MongoTemplate mongoTemplate) {
        this.products = products;
        this.orders = orders;
        this.mongoTemplate = mongoTemplate;
    }

    @PostMapping
    public Order create(@Valid @RequestBody CreateOrderRequest request) {
        var items = new ArrayList<OrderItem>();
        var reservations = new ArrayList<Reservation>();
        double subtotal = 0;
        try {
            for (var requested : request.items()) {
                var product = products.findById(requested.productId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Sản phẩm không tồn tại: " + requested.productId()));
                if (product.getSizes() == null || !product.getSizes().contains(requested.size())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Kích cỡ không hợp lệ cho sản phẩm \"" + product.getName() + "\"");
                }
                var reservedProduct = mongoTemplate.findAndModify(
                        Query.query(Criteria.where("_id").is(requested.productId())
                                .and("stock").gte(requested.quantity())),
                        new Update().inc("stock", -requested.quantity()),
                        FindAndModifyOptions.options().returnNew(true), vn.macmoc.store.model.Product.class);
                if (reservedProduct == null) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "Sản phẩm \"" + product.getName() + "\" không đủ tồn kho");
                }
                reservations.add(new Reservation(requested.productId(), requested.quantity()));
                items.add(new OrderItem(product.getId(), product.getName(), requested.size(),
                        requested.quantity(), product.getPrice()));
                subtotal += product.getPrice() * requested.quantity();
            }
            double shipping = subtotal >= 1_000_000 ? 0 : 30_000;
            String code = "MM" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
            return orders.save(new Order(code, request.customerName().trim(), request.email().trim(),
                    request.phone().trim(), request.address().trim(), request.paymentMethod(),
                    items, subtotal, shipping, subtotal + shipping));
        } catch (RuntimeException error) {
            for (var reservation : reservations) {
                try {
                    mongoTemplate.updateFirst(
                            Query.query(Criteria.where("_id").is(reservation.productId())),
                            new Update().inc("stock", reservation.quantity()),
                            vn.macmoc.store.model.Product.class);
                } catch (RuntimeException rollbackError) {
                    error.addSuppressed(rollbackError);
                }
            }
            throw error;
        }
    }

    private record Reservation(String productId, int quantity) {}
}
