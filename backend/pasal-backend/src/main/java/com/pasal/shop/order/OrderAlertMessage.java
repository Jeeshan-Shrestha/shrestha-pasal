package com.pasal.shop.order;

import com.pasal.shop.common.ShippingInfo;

final class OrderAlertMessage {

    private OrderAlertMessage() {
    }

    static String subject(Order o) {
        return "New order " + o.getOrderNumber() + " - Rs " + o.getTotal();
    }

    static String build(Order o) {
        ShippingInfo s = o.getShipping();
        StringBuilder sb = new StringBuilder("New order ").append(o.getOrderNumber()).append('\n');
        o.getItems().forEach(i -> sb.append(i.getQuantity()).append(" x ").append(i.getProductName()).append('\n'));
        sb.append("Total: Rs ").append(o.getTotal()).append(" (COD)\n")
                .append(s.getRecipientName()).append(", ").append(s.getPhone()).append('\n')
                .append(s.getStreet()).append(", ").append(s.getCity());
        return sb.toString();
    }
}
