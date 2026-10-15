package com.pasal.shop;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.jayway.jsonpath.JsonPath;

/** Walks the whole customer + admin journey against a real PostgreSQL. */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class ShopFlowIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    MockMvc mvc;

    @Test
    void fullShoppingJourney() throws Exception {
        // --- auth ---
        String adminToken = token(login("admin@pasal.local", "admin12345"));
        String email = "ram" + System.nanoTime() + "@example.com";
        String customerToken = token(json(post("/api/auth/register"), """
                {"fullName":"Ram Shrestha","email":"%s","password":"secret123","phone":"9800000000"}""".formatted(email))
                .andExpect(status().isCreated()));
        json(post("/api/auth/register"), """
                {"fullName":"Dup","email":"%s","password":"secret123"}""".formatted(email))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"%s\",\"password\":\"wrongpass\"}".formatted(email)))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users/me").header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.role").value("CUSTOMER"));
        mvc.perform(get("/api/users/me")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users/me").header("Authorization", "Bearer garbage")).andExpect(status().isUnauthorized());

        // --- product CRUD is admin-only; browsing is public ---
        long categoryId = ((Number) JsonPath.read(body(mvc.perform(get("/api/categories"))), "$[0].id")).longValue();
        String productJson = """
                {"name":"Steel Pressure Cooker 5L","description":"Heavy base","price":1000.00,"stockQuantity":5,
                 "categoryId":%d,"material":"Stainless Steel","brand":"Prestige"}""".formatted(categoryId);
        json(post("/api/products"), productJson, customerToken).andExpect(status().isForbidden());
        json(post("/api/products"), productJson).andExpect(status().isUnauthorized());
        long productId = id(json(post("/api/products"), productJson, adminToken).andExpect(status().isCreated()));

        mvc.perform(get("/api/products").param("q", "pressure").param("material", "stainless steel"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(1));
        mvc.perform(get("/api/products").param("q", "pressure").param("maxPrice", "500"))
                .andExpect(jsonPath("$.totalElements").value(0));
        mvc.perform(get("/api/products").param("sort", "nonsense,asc")).andExpect(status().isBadRequest());
        json(post("/api/products"), productJson.replace("1000.00", "-5"), adminToken).andExpect(status().isBadRequest());
        json(put("/api/products/" + productId), productJson.replace("5L", "5 Litre"), adminToken)
                .andExpect(status().isOk()).andExpect(jsonPath("$.name").value("Steel Pressure Cooker 5 Litre"));

        // --- cart ---
        json(post("/api/cart/items"), "{\"productId\":%d,\"quantity\":2}".formatted(productId), customerToken)
                .andExpect(status().isCreated()).andExpect(jsonPath("$.subtotal").value(2000.00))
                .andExpect(jsonPath("$.deliveryFee").value(100.00)).andExpect(jsonPath("$.total").value(2100.00));
        json(post("/api/cart/items"), "{\"productId\":%d,\"quantity\":10}".formatted(productId), customerToken)
                .andExpect(status().isBadRequest()); // more than stock

        // --- checkout needs an address, and only the owner's address works ---
        json(post("/api/orders"), "{\"addressId\":999999}", customerToken).andExpect(status().isNotFound());
        long addressId = id(json(post("/api/addresses"), """
                {"label":"Home","recipientName":"Ram","phone":"9800000000","street":"Thamel","city":"Kathmandu"}""",
                customerToken).andExpect(status().isCreated()).andExpect(jsonPath("$.defaultAddress").value(true)));

        long orderId = id(json(post("/api/orders"), "{\"addressId\":%d,\"notes\":\"Call first\"}".formatted(addressId),
                customerToken).andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PLACED"))
                .andExpect(jsonPath("$.paymentMethod").value("CASH_ON_DELIVERY"))
                .andExpect(jsonPath("$.total").value(2100.00))
                .andExpect(jsonPath("$.items[0].quantity").value(2)));
        mvc.perform(get("/api/cart").header("Authorization", "Bearer " + customerToken))
                .andExpect(jsonPath("$.items").isEmpty());
        mvc.perform(get("/api/products/" + productId)).andExpect(jsonPath("$.stockQuantity").value(3));
        json(post("/api/orders"), "{\"addressId\":%d}".formatted(addressId), customerToken)
                .andExpect(status().isBadRequest()); // empty cart

        // --- price snapshot survives catalogue edits ---
        json(put("/api/products/" + productId), productJson.replace("1000.00", "1500.00").replace("\"stockQuantity\":5", "\"stockQuantity\":3"), adminToken)
                .andExpect(status().isOk());
        mvc.perform(get("/api/orders/" + orderId).header("Authorization", "Bearer " + customerToken))
                .andExpect(jsonPath("$.items[0].unitPrice").value(1000.00));

        // --- another customer cannot see the order ---
        String otherToken = token(json(post("/api/auth/register"), """
                {"fullName":"Sita","email":"sita%d@example.com","password":"secret123"}""".formatted(System.nanoTime())));
        mvc.perform(get("/api/orders/" + orderId).header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/admin/orders").header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());

        // --- customer cancel restores stock ---
        mvc.perform(post("/api/orders/" + orderId + "/cancel").header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.paymentStatus").value("CANCELLED"));
        mvc.perform(get("/api/products/" + productId)).andExpect(jsonPath("$.stockQuantity").value(5));
        mvc.perform(post("/api/orders/" + orderId + "/cancel").header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isBadRequest());

        // --- second order goes through the admin workflow ---
        json(post("/api/cart/items"), "{\"productId\":%d,\"quantity\":1}".formatted(productId), customerToken);
        long order2 = id(json(post("/api/orders"), "{\"addressId\":%d}".formatted(addressId), customerToken)
                .andExpect(status().isCreated()).andExpect(jsonPath("$.total").value(1600.00))); // 1500 + 100 fee

        json(post("/api/products/" + productId + "/reviews"), "{\"rating\":5}", customerToken)
                .andExpect(status().isBadRequest()); // not delivered yet

        setStatus(adminToken, order2, "DELIVERED").andExpect(status().isBadRequest()); // can't skip steps
        setStatus(adminToken, order2, "CONFIRMED").andExpect(status().isOk());
        setStatus(adminToken, order2, "SHIPPED").andExpect(status().isOk());
        mvc.perform(post("/api/orders/" + order2 + "/cancel").header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isBadRequest()); // too late for the customer
        setStatus(adminToken, order2, "DELIVERED").andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentStatus").value("PAID"))
                .andExpect(jsonPath("$.customer.email").value(email));

        // --- reviews ---
        long reviewId = id(json(post("/api/products/" + productId + "/reviews"),
                "{\"rating\":4,\"comment\":\"Good cooker\"}", customerToken).andExpect(status().isCreated()));
        json(post("/api/products/" + productId + "/reviews"), "{\"rating\":5}", customerToken)
                .andExpect(status().isConflict());
        json(post("/api/products/" + productId + "/reviews"), "{\"rating\":9}", customerToken)
                .andExpect(status().isBadRequest());
        json(put("/api/reviews/" + reviewId), "{\"rating\":5,\"comment\":\"Great\"}", otherToken)
                .andExpect(status().isNotFound()); // not the owner
        mvc.perform(get("/api/products/" + productId)).andExpect(jsonPath("$.ratingAverage").value(4.0))
                .andExpect(jsonPath("$.ratingCount").value(1));
        mvc.perform(get("/api/products/" + productId + "/reviews")).andExpect(jsonPath("$.content[0].reviewer")
                .value("Ram Shrestha"));

        // --- wishlist ---
        mvc.perform(put("/api/wishlist/" + productId).header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isNoContent());
        mvc.perform(put("/api/wishlist/" + productId).header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isNoContent()); // idempotent
        mvc.perform(get("/api/wishlist").header("Authorization", "Bearer " + customerToken))
                .andExpect(jsonPath("$.length()").value(1));

        // --- product delete is a soft delete: hidden from shop, kept for history ---
        mvc.perform(delete("/api/products/" + productId).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/products/" + productId)).andExpect(status().isNotFound());
        mvc.perform(get("/api/admin/products/" + productId).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.active").value(false));
        mvc.perform(get("/api/orders/" + order2).header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk());
    }

    // ---- helpers ----

    private ResultActions login(String email, String password) throws Exception {
        return json(post("/api/auth/login"), "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password))
                .andExpect(status().isOk());
    }

    private ResultActions setStatus(String adminToken, long orderId, String status) throws Exception {
        return json(patch("/api/admin/orders/" + orderId + "/status"), "{\"status\":\"" + status + "\"}", adminToken);
    }

    private ResultActions json(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder req,
            String body) throws Exception {
        return json(req, body, null);
    }

    private ResultActions json(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder req,
            String body, String token) throws Exception {
        req.contentType(MediaType.APPLICATION_JSON).content(body);
        if (token != null) {
            req.header("Authorization", "Bearer " + token);
        }
        return mvc.perform(req);
    }

    private static String body(ResultActions r) throws Exception {
        return r.andReturn().getResponse().getContentAsString();
    }

    private static String token(ResultActions r) throws Exception {
        return JsonPath.read(body(r), "$.token");
    }

    private static long id(ResultActions r) throws Exception {
        return ((Number) JsonPath.read(body(r), "$.id")).longValue();
    }
}
