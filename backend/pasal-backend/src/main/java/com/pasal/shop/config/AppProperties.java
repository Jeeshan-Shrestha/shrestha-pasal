package com.pasal.shop.config;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(Jwt jwt, Shop shop, Admin admin, Cors cors, Alerts alerts) {

    public record Jwt(String secret, long expirationMinutes) {
    }

    public record Shop(String name, BigDecimal deliveryFee, BigDecimal freeDeliveryThreshold) {
    }

    public record Admin(String email, String password, String fullName) {
    }

    /** Emails the shop owner on each new order. Disabled unless the Gmail username, app password and recipient are set. */
    public record Alerts(String mailUsername, String mailPassword, String ownerEmail) {
        public boolean enabled() {
            return notBlank(mailUsername) && notBlank(mailPassword);
        }

        /** An empty OWNER_EMAIL falls back to the sending Gmail account. */
        public String recipient() {
            return notBlank(ownerEmail) ? ownerEmail : mailUsername;
        }

        private static boolean notBlank(String v) {
            return v != null && !v.isBlank();
        }
    }

    public record Cors(List<String> allowedOrigins) {
    }
}
