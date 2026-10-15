package com.pasal.shop.product;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pasal.shop.category.CategoryService;
import com.pasal.shop.common.Exceptions.NotFoundException;
import com.pasal.shop.product.ProductDtos.ProductRequest;
import com.pasal.shop.product.ProductDtos.ProductResponse;

import jakarta.persistence.criteria.Predicate;

@Service
public class ProductService {

    private final ProductRepository products;
    private final CategoryService categories;

    public ProductService(ProductRepository products, CategoryService categories) {
        this.products = products;
        this.categories = categories;
    }

    /** Search/filter. {@code includeInactive} is only ever true for admin endpoints. */
    @Transactional(readOnly = true)
    public Page<ProductResponse> search(String q, Long categoryId, String material, String brand, BigDecimal minPrice,
            BigDecimal maxPrice, boolean inStockOnly, boolean includeInactive, Pageable pageable) {
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> ps = new ArrayList<>();
            if (!includeInactive) {
                ps.add(cb.isTrue(root.get("active")));
            }
            if (q != null && !q.isBlank()) {
                String like = "%" + escapeLike(q.trim().toLowerCase()) + "%";
                ps.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like, '\\'),
                        cb.like(cb.lower(root.get("brand")), like, '\\'),
                        cb.like(cb.lower(root.get("description")), like, '\\')));
            }
            if (categoryId != null) {
                ps.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (material != null && !material.isBlank()) {
                ps.add(cb.equal(cb.lower(root.get("material")), material.trim().toLowerCase()));
            }
            if (brand != null && !brand.isBlank()) {
                ps.add(cb.equal(cb.lower(root.get("brand")), brand.trim().toLowerCase()));
            }
            if (minPrice != null) {
                ps.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                ps.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            if (inStockOnly) {
                ps.add(cb.greaterThan(root.get("stockQuantity"), 0));
            }
            return cb.and(ps.toArray(Predicate[]::new));
        };
        return products.findAll(spec, pageable).map(ProductResponse::from);
    }

    @Transactional(readOnly = true)
    public ProductResponse get(Long id, boolean includeInactive) {
        Product p = find(id);
        if (!p.isActive() && !includeInactive) {
            throw new NotFoundException("Product not found");
        }
        return ProductResponse.from(p);
    }

    @Transactional
    public ProductResponse create(ProductRequest req) {
        Product p = new Product();
        apply(p, req);
        return ProductResponse.from(products.save(p));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req) {
        Product p = find(id);
        apply(p, req);
        return ProductResponse.from(p);
    }

    @Transactional
    public ProductResponse updateStock(Long id, int stockQuantity) {
        Product p = find(id);
        p.setStockQuantity(stockQuantity);
        return ProductResponse.from(p);
    }

    /** Soft delete: past orders keep referencing the product, so it is deactivated rather than removed. */
    @Transactional
    public void deactivate(Long id) {
        find(id).setActive(false);
    }

    public Product find(Long id) {
        return products.findById(id).orElseThrow(() -> new NotFoundException("Product not found"));
    }

    private void apply(Product p, ProductRequest req) {
        p.setName(req.name().trim());
        p.setDescription(req.description());
        p.setPrice(req.price());
        p.setStockQuantity(req.stockQuantity());
        p.setCategory(categories.find(req.categoryId()));
        p.setMaterial(blankToNull(req.material()));
        p.setBrand(blankToNull(req.brand()));
        p.setImageUrl(blankToNull(req.imageUrl()));
        if (req.active() != null) {
            p.setActive(req.active());
        }
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private static String escapeLike(String s) {
        return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
