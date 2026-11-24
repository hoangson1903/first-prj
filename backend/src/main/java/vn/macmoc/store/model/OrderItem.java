package vn.macmoc.store.model;

public class OrderItem {
    private String productId;
    private String productName;
    private String size;
    private int quantity;
    private double unitPrice;

    public OrderItem() {}

    public OrderItem(String productId, String productName, String size, int quantity, double unitPrice) {
        this.productId = productId;
        this.productName = productName;
        this.size = size;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    public String getProductId() { return productId; }
    public String getProductName() { return productName; }
    public String getSize() { return size; }
    public int getQuantity() { return quantity; }
    public double getUnitPrice() { return unitPrice; }
}
