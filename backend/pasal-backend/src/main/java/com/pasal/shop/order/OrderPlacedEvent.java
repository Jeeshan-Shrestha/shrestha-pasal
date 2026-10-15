package com.pasal.shop.order;

/** Published inside the order transaction; the text is prebuilt because the listener runs after commit. */
public record OrderPlacedEvent(String subject, String message) {
}
