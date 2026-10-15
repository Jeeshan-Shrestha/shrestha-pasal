package com.pasal.shop.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.pasal.shop.user.User;

/** Authenticated user placed in the SecurityContext. Inject with @AuthenticationPrincipal. */
public record UserPrincipal(Long id, String email, String passwordHash, String role, boolean enabled)
        implements UserDetails {

    public static UserPrincipal from(User user) {
        return new UserPrincipal(user.getId(), user.getEmail(), user.getPasswordHash(), user.getRole().name(),
                user.isEnabled());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
