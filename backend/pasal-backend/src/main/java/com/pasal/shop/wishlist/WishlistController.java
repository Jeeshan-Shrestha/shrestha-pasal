package com.pasal.shop.wishlist;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.pasal.shop.common.Exceptions.NotFoundException;
import com.pasal.shop.product.Product;
import com.pasal.shop.product.ProductDtos.ProductResponse;
import com.pasal.shop.product.ProductRepository;
import com.pasal.shop.security.UserPrincipal;
import com.pasal.shop.user.UserRepository;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistRepository wishlist;
    private final ProductRepository products;
    private final UserRepository users;

    public WishlistController(WishlistRepository wishlist, ProductRepository products, UserRepository users) {
        this.wishlist = wishlist;
        this.products = products;
        this.users = users;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<ProductResponse> list(@AuthenticationPrincipal UserPrincipal p) {
        return wishlist.findByUserIdWithProduct(p.id()).stream().map(w -> ProductResponse.from(w.getProduct()))
                .toList();
    }

    /** Idempotent: adding an item that is already saved is a no-op. */
    @PutMapping("/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void add(@AuthenticationPrincipal UserPrincipal p, @PathVariable Long productId) {
        Product product = products.findById(productId).filter(Product::isActive)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        if (wishlist.existsByUserIdAndProductId(p.id(), productId)) {
            return;
        }
        WishlistItem w = new WishlistItem();
        w.setUser(users.getReferenceById(p.id()));
        w.setProduct(product);
        wishlist.save(w);
    }

    @DeleteMapping("/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void remove(@AuthenticationPrincipal UserPrincipal p, @PathVariable Long productId) {
        wishlist.deleteByUserIdAndProductId(p.id(), productId);
    }
}
