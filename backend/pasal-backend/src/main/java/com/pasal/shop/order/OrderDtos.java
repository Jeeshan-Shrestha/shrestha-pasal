package com.pasal.shop.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.pasal.shop.common.ShippingInfo;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class OrderDtos {

    private OrderDtos() {
    }

    public record PlaceOrderRequest(@NotNull Long addressId, @Size(max = 500) String notes) {
    }

    public record UpdateStatusRequest(@NotNull OrderStatus status) {
    }

    public record OrderItemResponse(Long productId, String productName, String imageUrl, BigDecimal unitPrice,
            int quantity, BigDecimal lineTotal) {
    }

    public record CustomerInfo(Long id, String fullName, String email, String phone) {
    }

    public record OrderResponse(Long id, String orderNumber, OrderStatus status, PaymentMethod paymentMethod,
            PaymentStatus paymentStatus, ShippingInfo shipping, String notes, BigDecimal subtotal,
            BigDecimal deliveryFee, BigDecimal total, boolean cancellable, List<OrderItemResponse> items,
            CustomerInfo customer, Instant createdAt, Instant updatedAt) {

        /** {@code withCustomer} is true only for admin views. */
        static OrderResponse from(Order o, boolean withCustomer) {
            List<OrderItemResponse> items = o.getItems().stream()
                    .map(i -> new OrderItemResponse(i.getProduct().getId(), i.getProductName(), i.getImageUrl(),
                            i.getUnitPrice(), i.getQuantity(), i.getLineTotal()))
                    .toList();
            CustomerInfo customer = withCustomer
                    ? new CustomerInfo(o.getUser().getId(), o.getUser().getFullName(), o.getUser().getEmail(),
                            o.getUser().getPhone())
                    : null;
            return new OrderResponse(o.getId(), o.getOrderNumber(), o.getStatus(), o.getPaymentMethod(),
                    o.getPaymentStatus(), o.getShipping(), o.getNotes(), o.getSubtotal(), o.getDeliveryFee(),
                    o.getTotal(), o.getStatus().customerCancellable(), items, customer, o.getCreatedAt(),
                    o.getUpdatedAt());
        }
    }
}
