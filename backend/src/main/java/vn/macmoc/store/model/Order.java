package vn.macmoc.store.model;

import java.time.Instant;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("orders")
public class Order {
    @Id
    private String id;
    private String orderCode;
    private String customerName;
    private String email;
    private String phone;
    private String address;
    private String paymentMethod;
    private List<OrderItem> items;
    private double subtotal;
    private double shipping;
    private double total;
    private String status;
    private Instant createdAt;

    public Order() {}

    public Order(String orderCode, String customerName, String email, String phone, String address,
                 String paymentMethod, List<OrderItem> items, double subtotal,
                 double shipping, double total) {
        this.orderCode = orderCode;
        this.customerName = customerName;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.paymentMethod = paymentMethod;
        this.items = items;
        this.subtotal = subtotal;
        this.shipping = shipping;
        this.total = total;
        this.status = "PENDING";
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getOrderCode() { return orderCode; }
    public String getStatus() { return status; }
    public double getTotal() { return total; }
    public Instant getCreatedAt() { return createdAt; }
}
