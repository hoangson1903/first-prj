package vn.macmoc.store.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateProductRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(max = 60) String category,
        @NotBlank @Size(max = 1000) String description,
        @Positive double price,
        @Positive Double oldPrice,
        @NotBlank @Size(max = 500) String imageUrl,
        @NotEmpty List<@NotBlank @Size(max = 10) String> sizes,
        @NotNull List<@NotBlank @Size(max = 30) String> colors,
        boolean featured,
        @Min(0) @jakarta.validation.constraints.Max(100000) int stock) {}
