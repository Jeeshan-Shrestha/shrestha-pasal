package com.pasal.shop.cart;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pasal.shop.common.Exceptions.BadRequestException;
import com.pasal.shop.common.Exceptions.NotFoundException;
import com.pasal.shop.config.AppProperties;
import com.pasal.shop.product.Product;
import com.pasal.shop.product.ProductRepository;
import com.pasal.shop.user.UserRepository;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Service
public class CartService {

    public record AddItemRequest(@NotNull Long productId, @NotNull @Min(1) @Max(100) Integer quantity) {
    }

    public record UpdateItemRequest(@NotNull @Min(1) @Max(100) Integer quantity) {
    }

    public record CartItemResponse(Long productId, String name, String imageUrl, BigDecimal unitPrice, int quantity,
            BigDecimal lineTotal, int availableStock, boolean available) {
    }

    public record CartResponse(List<CartItemResponse> items, int itemCount, BigDecimal subtotal,
            BigDecimal deliveryFee, BigDecimal total) {
    }

    private final CartItemRepository cartItems;
    private final ProductRepository products;
    private final UserRepository users;
    private final AppProperties props;

    public CartService(CartItemRepository cartItems, ProductRepository products, UserRepository users,
            AppProperties props) {
        this.cartItems = cartItems;
        this.products = products;
        this.users = users;
        this.props = props;
    }

    @Transactional(readOnly = true)
    public CartResponse get(Long userId) {
        return toResponse(cartItems.findByUserIdWithProduct(userId));
    }

    @Transactional
    public CartResponse add(Long userId, AddItemRequest req) {
        Product p = activeProduct(req.productId());
        CartItem item = cartItems.findByUserIdAndProductId(userId, p.getId()).orElseGet(() -> {
            CartItem c = new CartItem();
            c.setUser(users.getReferenceById(userId));
            c.setProduct(p);
            return c;
        });
        item.setQuantity(checkStock(p, item.getQuantity() + req.quantity()));
        cartItems.save(item);
        return get(userId);
    }

    @Transactional
    public CartResponse setQuantity(Long userId, Long productId, int quantity) {
        CartItem item = cartItems.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new NotFoundException("Item is not in your cart"));
        item.setQuantity(checkStock(activeProduct(productId), quantity));
        return get(userId);
    }

    @Transactional
    public CartResponse remove(Long userId, Long productId) {
        if (cartItems.deleteByUserIdAndProductId(userId, productId) == 0) {
            throw new NotFoundException("Item is not in your cart");
        }
        return get(userId);
    }

    @Transactional
    public void clear(Long userId) {
        cartItems.deleteAllByUserId(userId);
    }

    /** Shared with checkout so the preview and the placed order use the same fee rules. */
    public BigDecimal deliveryFeeFor(BigDecimal subtotal) {
        if (subtotal.signum() == 0 || subtotal.compareTo(props.shop().freeDeliveryThreshold()) >= 0) {
            return BigDecimal.ZERO.setScale(2);
        }
        return props.shop().deliveryFee().setScale(2);
    }

    private CartResponse toResponse(List<CartItem> items) {
        List<CartItemResponse> rows = items.stream().map(ci -> {
            Product p = ci.getProduct();
            boolean ok = p.isActive() && p.getStockQuantity() >= ci.getQuantity();
            return new CartItemResponse(p.getId(), p.getName(), p.getImageUrl(), p.getPrice(), ci.getQuantity(),
                    p.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())), p.getStockQuantity(), ok);
        }).toList();
        BigDecimal subtotal = rows.stream().map(CartItemResponse::lineTotal).reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2);
        BigDecimal fee = deliveryFeeFor(subtotal);
        int count = rows.stream().mapToInt(CartItemResponse::quantity).sum();
        return new CartResponse(rows, count, subtotal, fee, subtotal.add(fee));
    }

    private Product activeProduct(Long id) {
        Product p = products.findById(id).orElseThrow(() -> new NotFoundException("Product not found"));
        if (!p.isActive()) {
            throw new NotFoundException("Product not found");
        }
        return p;
    }

    private int checkStock(Product p, int wanted) {
        if (wanted > p.getStockQuantity()) {
            throw new BadRequestException(
                    "Only " + p.getStockQuantity() + " of \"" + p.getName() + "\" available in stock");
        }
        return wanted;
    }
}
