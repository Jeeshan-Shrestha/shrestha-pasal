package com.pasal.shop.order;

import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class BrevoMailClientTest {

    @Test
    void postsEmailToBrevoApiWithKeyAndExpectedBody() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("api-key", "secret-key"))
                .andExpect(jsonPath("$.sender.name").value("New Shrestha Bhada Pasal"))
                .andExpect(jsonPath("$.sender.email").value("shop@example.com"))
                .andExpect(jsonPath("$.to[0].email").value("customer@example.com"))
                .andExpect(jsonPath("$.subject").value("Your order NSB-1 is confirmed"))
                .andExpect(jsonPath("$.textContent").value("Hello"))
                .andRespond(withSuccess("{\"messageId\":\"<1@brevo>\"}", MediaType.APPLICATION_JSON));

        new BrevoMailClient(builder).send("secret-key", "New Shrestha Bhada Pasal", "shop@example.com",
                "customer@example.com", "Your order NSB-1 is confirmed", "Hello");

        server.verify();
    }
}
