package com.pasal.shop.review;

import java.time.Instant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pasal.shop.common.Exceptions.BadRequestException;
import com.pasal.shop.common.Exceptions.ConflictException;
import com.pasal.shop.common.Exceptions.NotFoundException;
import com.pasal.shop.order.OrderRepository;
import com.pasal.shop.product.Product;
import com.pasal.shop.product.ProductRepository;
import com.pasal.shop.user.UserRepository;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Service
public class ReviewService {

    public record ReviewRequest(@NotNull @Min(1) @Max(5) Integer rating, @Size(max = 2000) String comment) {
    }

    public record ReviewResponse(Long id, Long productId, String reviewer, int rating, String comment,
            Instant createdAt) {
        static ReviewResponse from(Review r) {
            return new ReviewResponse(r.getId(), r.getProduct().getId(), r.getUser().getFullName(), r.getRating(),
                    r.getComment(), r.getCreatedAt());
        }
    }

    private final ReviewRepository reviews;
    private final ProductRepository products;
    private final OrderRepository orders;
    private final UserRepository users;

    public ReviewService(ReviewRepository reviews, ProductRepository products, OrderRepository orders,
            UserRepository users) {
        this.reviews = reviews;
        this.products = products;
        this.orders = orders;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> list(Long productId, Pageable pageable) {
        if (!products.existsById(productId)) {
            throw new NotFoundException("Product not found");
        }
        return reviews.findByProductId(productId, pageable).map(ReviewResponse::from);
    }

    /** Only customers whose order containing the product was delivered can review it. */
    @Transactional
    public ReviewResponse create(Long userId, Long productId, ReviewRequest req) {
        Product product = products.findById(productId).orElseThrow(() -> new NotFoundException("Product not found"));
        if (reviews.existsByUserIdAndProductId(userId, productId)) {
            throw new ConflictException("You have already reviewed this product");
        }
        if (!orders.hasDeliveredPurchase(userId, productId)) {
            throw new BadRequestException("You can review a product only after receiving it");
        }
        Review r = new Review();
        r.setUser(users.getReferenceById(userId));
        r.setProduct(product);
        r.setRating(req.rating());
        r.setComment(req.comment());
        reviews.saveAndFlush(r);
        refreshRating(product);
        return ReviewResponse.from(r);
    }

    @Transactional
    public ReviewResponse update(Long userId, Long reviewId, ReviewRequest req) {
        Review r = reviews.findByIdAndUserId(reviewId, userId).orElseThrow(() -> new NotFoundException("Review not found"));
        r.setRating(req.rating());
        r.setComment(req.comment());
        reviews.flush();
        refreshRating(r.getProduct());
        return ReviewResponse.from(r);
    }

    /** Owners can delete their own review; admins can delete any (moderation). */
    @Transactional
    public void delete(Long userId, boolean isAdmin, Long reviewId) {
        Review r = (isAdmin ? reviews.findById(reviewId) : reviews.findByIdAndUserId(reviewId, userId))
                .orElseThrow(() -> new NotFoundException("Review not found"));
        Product product = r.getProduct();
        reviews.delete(r);
        reviews.flush();
        refreshRating(product);
    }

    private void refreshRating(Product p) {
        double avg = reviews.averageRating(p.getId());
        p.setRatingAverage(Math.round(avg * 10.0) / 10.0);
        p.setRatingCount(reviews.countByProductId(p.getId()));
    }
}
