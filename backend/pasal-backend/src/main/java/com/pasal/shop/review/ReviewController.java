package com.pasal.shop.review;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.pasal.shop.common.PageResponse;
import com.pasal.shop.review.ReviewService.ReviewRequest;
import com.pasal.shop.review.ReviewService.ReviewResponse;
import com.pasal.shop.security.UserPrincipal;

import jakarta.validation.Valid;

@RestController
public class ReviewController {

    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    @GetMapping("/api/products/{productId}/reviews")
    public PageResponse<ReviewResponse> list(@PathVariable Long productId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return PageResponse.of(service.list(productId, pageable), r -> r);
    }

    @PostMapping("/api/products/{productId}/reviews")
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse create(@AuthenticationPrincipal UserPrincipal p, @PathVariable Long productId,
            @Valid @RequestBody ReviewRequest req) {
        return service.create(p.id(), productId, req);
    }

    @PutMapping("/api/reviews/{id}")
    public ReviewResponse update(@AuthenticationPrincipal UserPrincipal p, @PathVariable Long id,
            @Valid @RequestBody ReviewRequest req) {
        return service.update(p.id(), id, req);
    }

    @DeleteMapping("/api/reviews/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal UserPrincipal p, @PathVariable Long id) {
        service.delete(p.id(), "ADMIN".equals(p.role()), id);
    }
}
