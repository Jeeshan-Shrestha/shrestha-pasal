package com.pasal.shop.review;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query(value = "select r from Review r join fetch r.user where r.product.id = :productId",
            countQuery = "select count(r) from Review r where r.product.id = :productId")
    Page<Review> findByProductId(Long productId, Pageable pageable);

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    Optional<Review> findByIdAndUserId(Long id, Long userId);

    @Query("select coalesce(avg(r.rating), 0) from Review r where r.product.id = :productId")
    double averageRating(Long productId);

    int countByProductId(Long productId);
}
