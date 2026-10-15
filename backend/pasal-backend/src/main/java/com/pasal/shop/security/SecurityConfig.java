package com.pasal.shop.security;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pasal.shop.config.AppProperties;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter, ObjectMapper mapper)
            throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // stateless bearer-token API, no cookies
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html")
                        .permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // catalogue management is admin-only; browsing is public
                        .requestMatchers(HttpMethod.POST, "/api/products", "/api/categories").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/{id}", "/api/categories/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/{id}", "/api/categories/{id}")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/categories/**").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(entryPoint(mapper))
                        .accessDeniedHandler(accessDenied(mapper)))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(AppProperties props) {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(props.cors().allowedOrigins());
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        cfg.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", cfg);
        return source;
    }

    private AuthenticationEntryPoint entryPoint(ObjectMapper mapper) {
        return (req, res, ex) -> write(mapper, res, 401, "Unauthorized", "Authentication required or token invalid");
    }

    private AccessDeniedHandler accessDenied(ObjectMapper mapper) {
        return (req, res, ex) -> write(mapper, res, 403, "Forbidden", "You do not have permission to do that");
    }

    private void write(ObjectMapper mapper, jakarta.servlet.http.HttpServletResponse res, int status, String error,
            String message) throws java.io.IOException {
        res.setStatus(status);
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        mapper.writeValue(res.getOutputStream(), Map.of("timestamp", Instant.now().toString(), "status", status,
                "error", error, "message", message));
    }
}
