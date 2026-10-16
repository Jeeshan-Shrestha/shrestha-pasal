package com.pasal.shop.order;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/** Sends a plain-text email through Brevo's HTTPS API (port 443), for hosts that block SMTP ports. */
@Component
class BrevoMailClient {

    private static final String ENDPOINT = "https://api.brevo.com/v3/smtp/email";

    private final RestClient http;

    BrevoMailClient(RestClient.Builder builder) {
        this.http = builder.build();
    }

    void send(String apiKey, String senderName, String senderEmail, String to, String subject, String text) {
        http.post().uri(ENDPOINT)
                .header("api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "sender", Map.of("name", senderName, "email", senderEmail),
                        "to", List.of(Map.of("email", to)),
                        "subject", subject,
                        "textContent", text))
                .retrieve()
                .toBodilessEntity();
    }
}
