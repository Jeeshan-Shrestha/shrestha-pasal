package com.pasal.shop.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pasal.shop.common.Exceptions.BadRequestException;
import com.pasal.shop.common.Exceptions.ConflictException;
import com.pasal.shop.common.Exceptions.NotFoundException;
import com.pasal.shop.security.JwtService;
import com.pasal.shop.user.UserDtos.AuthResponse;
import com.pasal.shop.user.UserDtos.ChangePasswordRequest;
import com.pasal.shop.user.UserDtos.LoginRequest;
import com.pasal.shop.user.UserDtos.RegisterRequest;
import com.pasal.shop.user.UserDtos.UpdateProfileRequest;
import com.pasal.shop.user.UserDtos.UserResponse;

@Service
public class UserService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public UserService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = normalize(req.email());
        if (users.existsByEmail(email)) {
            throw new ConflictException("An account with this email already exists");
        }
        User u = new User();
        u.setFullName(req.fullName().trim());
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(req.password()));
        u.setPhone(blankToNull(req.phone()));
        u.setRole(Role.CUSTOMER); // role is never taken from the request
        users.save(u);
        return authResponse(u);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User u = users.findByEmail(normalize(req.email()))
                .filter(found -> encoder.matches(req.password(), found.getPasswordHash()))
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (!u.isEnabled()) {
            throw new BadCredentialsException("This account has been disabled");
        }
        return authResponse(u);
    }

    @Transactional(readOnly = true)
    public UserResponse get(Long id) {
        return UserResponse.from(find(id));
    }

    @Transactional
    public UserResponse updateProfile(Long id, UpdateProfileRequest req) {
        User u = find(id);
        u.setFullName(req.fullName().trim());
        u.setPhone(blankToNull(req.phone()));
        return UserResponse.from(u);
    }

    @Transactional
    public void changePassword(Long id, ChangePasswordRequest req) {
        User u = find(id);
        if (!encoder.matches(req.currentPassword(), u.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }
        u.setPasswordHash(encoder.encode(req.newPassword()));
    }

    @Transactional(readOnly = true)
    public Page<User> list(Pageable pageable) {
        return users.findAll(pageable);
    }

    @Transactional
    public UserResponse setEnabled(Long id, boolean enabled) {
        User u = find(id);
        u.setEnabled(enabled);
        return UserResponse.from(u);
    }

    private User find(Long id) {
        return users.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
    }

    private AuthResponse authResponse(User u) {
        return new AuthResponse(jwt.generateToken(u), "Bearer", jwt.expiresInSeconds(), UserResponse.from(u));
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase();
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
