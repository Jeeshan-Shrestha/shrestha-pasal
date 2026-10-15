package com.pasal.shop.security;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import com.pasal.shop.config.AppProperties;
import com.pasal.shop.user.User;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final SecretKey key;
    private final Duration expiration;

    public JwtService(AppProperties props) {
        byte[] secret = props.jwt().secret().getBytes(StandardCharsets.UTF_8);
        if (secret.length < 32) {
            throw new IllegalStateException("app.jwt.secret (JWT_SECRET) must be at least 32 characters");
        }
        this.key = Keys.hmacShaKeyFor(secret);
        this.expiration = Duration.ofMinutes(props.jwt().expirationMinutes());
    }

    public String generateToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expiration)))
                .signWith(key)
                .compact();
    }

    public long expiresInSeconds() {
        return expiration.toSeconds();
    }

    /** Returns the user id if the token is valid and unexpired, otherwise empty. */
    public Optional<Long> parseUserId(String token) {
        try {
            String sub = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
            return Optional.of(Long.parseLong(sub));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
