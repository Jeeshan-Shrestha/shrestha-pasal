package com.pasal.shop.product;

import java.math.BigDecimal;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.pasal.shop.common.PageResponse;
import com.pasal.shop.product.ProductDtos.ProductRequest;
import com.pasal.shop.product.ProductDtos.ProductResponse;
import com.pasal.shop.product.ProductDtos.StockRequest;

import jakarta.validation.Valid;

/**
 * GET is public (active products only). POST/PUT/DELETE and /api/admin/products need ADMIN
 * (see SecurityConfig). Sorting: ?sort=price,asc | ratingAverage,desc | createdAt,desc | name,asc
 */
@RestController
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping("/api/products")
    public PageResponse<ProductResponse> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String material,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "false") boolean inStockOnly,
            @PageableDefault(size = 20, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {
        return toPage(service.search(q, categoryId, material, brand, minPrice, maxPrice, inStockOnly, false,
                limit(pageable)));
    }

    @GetMapping("/api/products/{id}")
    public ProductResponse get(@PathVariable Long id) {
        return service.get(id, false);
    }

    @PostMapping("/api/products")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody ProductRequest req) {
        return service.create(req);
    }

    @PutMapping("/api/products/{id}")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/api/products/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.deactivate(id);
    }

    // ---- admin views ----

    @GetMapping("/api/admin/products")
    public PageResponse<ProductResponse> adminSearch(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String material,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "false") boolean inStockOnly,
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return toPage(service.search(q, categoryId, material, brand, minPrice, maxPrice, inStockOnly, true,
                limit(pageable)));
    }

    @GetMapping("/api/admin/products/{id}")
    public ProductResponse adminGet(@PathVariable Long id) {
        return service.get(id, true);
    }

    @PatchMapping("/api/admin/products/{id}/stock")
    public ProductResponse updateStock(@PathVariable Long id, @Valid @RequestBody StockRequest req) {
        return service.updateStock(id, req.stockQuantity());
    }

    private static PageResponse<ProductResponse> toPage(org.springframework.data.domain.Page<ProductResponse> page) {
        return PageResponse.of(page, r -> r);
    }

    /** Cap page size so a client cannot request the whole table. */
    private static Pageable limit(Pageable p) {
        return p.getPageSize() <= 100 ? p
                : org.springframework.data.domain.PageRequest.of(p.getPageNumber(), 100, p.getSort());
    }
}
