package com.pasal.shop.order;

import java.util.Set;

public enum OrderStatus {
    PLACED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED;

    /** Allowed next states (admin workflow). */
    public Set<OrderStatus> next() {
        return switch (this) {
            case PLACED -> Set.of(CONFIRMED, CANCELLED);
            case CONFIRMED -> Set.of(SHIPPED, CANCELLED);
            case SHIPPED -> Set.of(DELIVERED, CANCELLED); // cancelled = customer refused / failed delivery
            case DELIVERED, CANCELLED -> Set.of();
        };
    }

    /** Customers may cancel only before the parcel leaves the shop. */
    public boolean customerCancellable() {
        return this == PLACED || this == CONFIRMED;
    }
}
