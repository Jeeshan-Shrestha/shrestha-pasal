package com.pasal.shop.cart;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    @Query("select c from CartItem c join fetch c.product p join fetch p.category where c.user.id = :userId order by c.id")
    List<CartItem> findByUserIdWithProduct(Long userId);

    /** Cart rows with lazy product proxies only; checkout loads products itself under a row lock. */
    List<CartItem> findByUserIdOrderById(Long userId);

    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);

    @Modifying
    @Query("delete from CartItem c where c.user.id = :userId")
    void deleteAllByUserId(Long userId);

    @Modifying
    @Query("delete from CartItem c where c.user.id = :userId and c.product.id = :productId")
    int deleteByUserIdAndProductId(Long userId, Long productId);
}
