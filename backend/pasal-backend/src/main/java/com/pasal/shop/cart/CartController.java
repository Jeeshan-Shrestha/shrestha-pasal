package com.pasal.shop.cart;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.pasal.shop.cart.CartService.AddItemRequest;
import com.pasal.shop.cart.CartService.CartResponse;
import com.pasal.shop.cart.CartService.UpdateItemRequest;
import com.pasal.shop.security.UserPrincipal;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService service;

    public CartController(CartService service) {
        this.service = service;
    }

    @GetMapping
    public CartResponse get(@AuthenticationPrincipal UserPrincipal p) {
        return service.get(p.id());
    }

    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public CartResponse add(@AuthenticationPrincipal UserPrincipal p, @Valid @RequestBody AddItemRequest req) {
        return service.add(p.id(), req);
    }

    @PutMapping("/items/{productId}")
    public CartResponse setQuantity(@AuthenticationPrincipal UserPrincipal p, @PathVariable Long productId,
            @Valid @RequestBody UpdateItemRequest req) {
        return service.setQuantity(p.id(), productId, req.quantity());
    }

    @DeleteMapping("/items/{productId}")
    public CartResponse remove(@AuthenticationPrincipal UserPrincipal p, @PathVariable Long productId) {
        return service.remove(p.id(), productId);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clear(@AuthenticationPrincipal UserPrincipal p) {
        service.clear(p.id());
    }
}
