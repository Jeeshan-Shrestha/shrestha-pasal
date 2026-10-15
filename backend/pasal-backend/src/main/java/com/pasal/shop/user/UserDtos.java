package com.pasal.shop.user;

import java.time.Instant;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class UserDtos {

    private UserDtos() {
    }

    public record RegisterRequest(
            @NotBlank @Size(max = 100) String fullName,
            @NotBlank @Email @Size(max = 150) String email,
            @NotBlank @Size(min = 8, max = 72, message = "Password must be 8-72 characters") String password,
            @Pattern(regexp = "^$|^\\+?[0-9]{7,15}$", message = "Invalid phone number") String phone) {
    }

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {
    }

    public record UpdateProfileRequest(
            @NotBlank @Size(max = 100) String fullName,
            @Pattern(regexp = "^$|^\\+?[0-9]{7,15}$", message = "Invalid phone number") String phone) {
    }

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 8, max = 72, message = "Password must be 8-72 characters") String newPassword) {
    }

    public record UserResponse(Long id, String fullName, String email, String phone, Role role, boolean enabled,
            Instant createdAt) {
        public static UserResponse from(User u) {
            return new UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getPhone(), u.getRole(),
                    u.isEnabled(), u.getCreatedAt());
        }
    }

    public record AuthResponse(String token, String tokenType, long expiresInSeconds, UserResponse user) {
    }
}
