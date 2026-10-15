package com.pasal.shop.common;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Delivery destination. Embedded in saved addresses and copied (as a snapshot) into orders. */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShippingInfo {

    @Column(nullable = false)
    private String recipientName;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String street;

    @Column(nullable = false)
    private String city;

    private String district;

    private String landmark;

    public ShippingInfo copy() {
        return new ShippingInfo(recipientName, phone, street, city, district, landmark);
    }
}
