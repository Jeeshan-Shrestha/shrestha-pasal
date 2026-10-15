package com.pasal.shop.product;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class ProductDtos {

    private ProductDtos() {
    }

    public record ProductRequest(
            @NotBlank @Size(max = 200) String name,
            @Size(max = 4000) String description,
            @NotNull @DecimalMin(value = "0.01", message = "Price must be greater than 0")
            @DecimalMax("9999999.99") BigDecimal price,
            @NotNull @Min(value = 0, message = "Stock cannot be negative") Integer stockQuantity,
            @NotNull Long categoryId,
            @Size(max = 100) String material,
            @Size(max = 100) String brand,
            @Size(max = 1000) String imageUrl,
            Boolean active) {
    }

    public record ProductResponse(Long id, String name, String description, BigDecimal price, int stockQuantity,
            boolean inStock, Long categoryId, String categoryName, String material, String brand, String imageUrl,
            boolean active, double ratingAverage, int ratingCount, Instant createdAt) {

        public static ProductResponse from(Product p) {
            return new ProductResponse(p.getId(), p.getName(), p.getDescription(), p.getPrice(), p.getStockQuantity(),
                    p.getStockQuantity() > 0, p.getCategory().getId(), p.getCategory().getName(), p.getMaterial(),
                    p.getBrand(), p.getImageUrl(), p.isActive(), p.getRatingAverage(), p.getRatingCount(),
                    p.getCreatedAt());
        }
    }

    public record StockRequest(@NotNull @Min(0) Integer stockQuantity) {
    }
}
