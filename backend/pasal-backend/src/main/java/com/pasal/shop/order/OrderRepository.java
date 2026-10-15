package com.pasal.shop.order;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserId(Long userId, Pageable pageable);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    Optional<Order> findByIdAndUserId(Long id, Long userId);

    /** True when the user has a delivered order containing the product (used for "verified purchase" reviews). */
    @Query("select count(o) > 0 from Order o join o.items i "
            + "where o.user.id = :userId and i.product.id = :productId and o.status = com.pasal.shop.order.OrderStatus.DELIVERED")
    boolean hasDeliveredPurchase(Long userId, Long productId);
}
