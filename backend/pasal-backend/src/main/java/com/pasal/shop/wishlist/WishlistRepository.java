package com.pasal.shop.wishlist;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {

    @Query("select w from WishlistItem w join fetch w.product p join fetch p.category where w.user.id = :userId order by w.addedAt desc")
    List<WishlistItem> findByUserIdWithProduct(Long userId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    @Modifying
    @Query("delete from WishlistItem w where w.user.id = :userId and w.product.id = :productId")
    int deleteByUserIdAndProductId(Long userId, Long productId);
}
