package vn.macmoc.store.model;

import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("products")
public class Product {
    @Id
    private String id;
    private String name;
    private String category;
    private String description;
    private double price;
    private Double oldPrice;
    private String imageUrl;
    private List<String> sizes;
    private List<String> colors;
    private boolean featured;
    private int stock;

    public Product() {}

    public Product(String id, String name, String category, String description, double price,
                   Double oldPrice, String imageUrl, List<String> sizes, List<String> colors,
                   boolean featured, int stock) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.description = description;
        this.price = price;
        this.oldPrice = oldPrice;
        this.imageUrl = imageUrl;
        this.sizes = sizes;
        this.colors = colors;
        this.featured = featured;
        this.stock = stock;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public double getPrice() { return price; }
    public Double getOldPrice() { return oldPrice; }
    public String getImageUrl() { return imageUrl; }
    public List<String> getSizes() { return sizes; }
    public List<String> getColors() { return colors; }
    public boolean isFeatured() { return featured; }
    public int getStock() { return stock; }
    public void setName(String name) { this.name = name; }
    public void setCategory(String category) { this.category = category; }
    public void setDescription(String description) { this.description = description; }
    public void setPrice(double price) { this.price = price; }
    public void setOldPrice(Double oldPrice) { this.oldPrice = oldPrice; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setSizes(List<String> sizes) { this.sizes = sizes; }
    public void setColors(List<String> colors) { this.colors = colors; }
    public void setFeatured(boolean featured) { this.featured = featured; }
    public void setStock(int stock) { this.stock = stock; }
}
