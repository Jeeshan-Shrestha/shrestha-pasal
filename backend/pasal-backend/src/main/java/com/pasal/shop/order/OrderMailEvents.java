package com.pasal.shop.order;

import java.math.BigDecimal;
import java.util.List;

import com.pasal.shop.common.ShippingInfo;

/**
 * Plain-data snapshot of an order for emails. Events are published inside the order transaction but
 * handled after commit on another thread, so everything the mail needs is copied here up front.
 */
record OrderSnapshot(String orderNumber, String customerName, String customerEmail, String customerPhone,
        List<String> itemLines, BigDecimal subtotal, BigDecimal deliveryFee, BigDecimal total, String address,
        String notes) {

    static OrderSnapshot from(Order o) {
        ShippingInfo s = o.getShipping();
        String address = s.getRecipientName() + ", " + s.getPhone() + "\n" + s.getStreet() + ", " + s.getCity()
                + (s.getDistrict() == null ? "" : ", " + s.getDistrict())
                + (s.getLandmark() == null ? "" : " (near " + s.getLandmark() + ")");
        List<String> lines = o.getItems().stream()
                .map(i -> i.getQuantity() + " x " + i.getProductName() + "  -  Rs " + i.getLineTotal())
                .toList();
        return new OrderSnapshot(o.getOrderNumber(), o.getUser().getFullName(), o.getUser().getEmail(),
                o.getUser().getPhone(), lines, o.getSubtotal(), o.getDeliveryFee(), o.getTotal(), address,
                o.getNotes());
    }
}

record OrderPlacedEvent(OrderSnapshot order) {
}

/** {@code byCustomer} is false when the shop (admin) cancelled the order. */
record OrderCancelledEvent(OrderSnapshot order, boolean byCustomer) {
}
