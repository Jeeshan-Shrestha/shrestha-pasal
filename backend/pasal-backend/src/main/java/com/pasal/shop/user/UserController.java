package com.pasal.shop.user;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.pasal.shop.security.UserPrincipal;
import com.pasal.shop.user.UserDtos.ChangePasswordRequest;
import com.pasal.shop.user.UserDtos.UpdateProfileRequest;
import com.pasal.shop.user.UserDtos.UserResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users/me")
public class UserController {

    private final UserService users;

    public UserController(UserService users) {
        this.users = users;
    }

    @GetMapping
    public UserResponse me(@AuthenticationPrincipal UserPrincipal p) {
        return users.get(p.id());
    }

    @PutMapping
    public UserResponse update(@AuthenticationPrincipal UserPrincipal p, @Valid @RequestBody UpdateProfileRequest req) {
        return users.updateProfile(p.id(), req);
    }

    @PutMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@AuthenticationPrincipal UserPrincipal p,
            @Valid @RequestBody ChangePasswordRequest req) {
        users.changePassword(p.id(), req);
    }
}
