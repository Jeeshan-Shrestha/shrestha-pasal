package com.pasal.shop.order;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.pasal.shop.common.PageResponse;
import com.pasal.shop.order.OrderDtos.OrderResponse;
import com.pasal.shop.order.OrderDtos.PlaceOrderRequest;
import com.pasal.shop.order.OrderDtos.UpdateStatusRequest;
import com.pasal.shop.security.UserPrincipal;

import jakarta.validation.Valid;

@RestController
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    /** Checkout: converts the cart into a cash-on-delivery order. */
    @PostMapping("/api/orders")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse place(@AuthenticationPrincipal UserPrincipal p, @Valid @RequestBody PlaceOrderRequest req) {
        return service.place(p.id(), req);
    }

    @GetMapping("/api/orders")
    public PageResponse<OrderResponse> mine(@AuthenticationPrincipal UserPrincipal p,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return PageResponse.of(service.myOrders(p.id(), pageable), r -> r);
    }

    @GetMapping("/api/orders/{id}")
    public OrderResponse getMine(@AuthenticationPrincipal UserPrincipal p, @PathVariable Long id) {
        return service.myOrder(p.id(), id);
    }

    @PostMapping("/api/orders/{id}/cancel")
    public OrderResponse cancel(@AuthenticationPrincipal UserPrincipal p, @PathVariable Long id) {
        return service.cancelMine(p.id(), id);
    }

    // ---- admin ----

    @GetMapping("/api/admin/orders")
    public PageResponse<OrderResponse> adminList(@RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return PageResponse.of(service.adminList(status, pageable), r -> r);
    }

    @GetMapping("/api/admin/orders/{id}")
    public OrderResponse adminGet(@PathVariable Long id) {
        return service.adminGet(id);
    }

    @PatchMapping("/api/admin/orders/{id}/status")
    public OrderResponse adminUpdateStatus(@PathVariable Long id, @Valid @RequestBody UpdateStatusRequest req) {
        return service.adminUpdateStatus(id, req.status());
    }
}
