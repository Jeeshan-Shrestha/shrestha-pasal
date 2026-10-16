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

    /**
     * Order emails. Two transports: Brevo's HTTPS API (needed on hosts that block SMTP ports, e.g. Render free)
     * when {@code brevoApiKey} is set, otherwise Gmail SMTP when username and app password are set.
     */
    public record Alerts(String mailUsername, String mailPassword, String ownerEmail, String brevoApiKey,
            String fromEmail) {
        public boolean useBrevo() {
            return notBlank(brevoApiKey) && notBlank(fromAddress());
        }

        public boolean enabled() {
            return useBrevo() || (notBlank(mailUsername) && notBlank(mailPassword));
        }

        /** Sender address: MAIL_FROM (must be a verified Brevo sender) or the Gmail account. */
        public String fromAddress() {
            return notBlank(fromEmail) ? fromEmail : mailUsername;
        }

        /** An empty OWNER_EMAIL falls back to the sending address. */
        public String recipient() {
            return notBlank(ownerEmail) ? ownerEmail : fromAddress();
        }

        private static boolean notBlank(String v) {
            return v != null && !v.isBlank();
        }
    }

    public record Cors(List<String> allowedOrigins) {
    }
}
