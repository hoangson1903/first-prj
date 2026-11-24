package vn.macmoc.store.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateOrderRequest(
        @NotBlank @Size(max = 100) String customerName,
        @NotBlank @Email @Size(max = 150) String email,
        @NotBlank @Pattern(regexp = "^[0-9+() .-]{9,20}$") String phone,
        @NotBlank @Size(max = 300) String address,
        @NotBlank @Pattern(regexp = "^(COD|BANK_TRANSFER)$") String paymentMethod,
        @NotEmpty @Size(max = 50) List<@Valid Item> items) {

    public record Item(
            @NotBlank String productId,
            @NotBlank @Size(max = 20) String size,
            @jakarta.validation.constraints.Min(1) @jakarta.validation.constraints.Max(20) int quantity) {}
}
