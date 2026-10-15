package com.pasal.shop.user;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pasal.shop.common.Exceptions.BadRequestException;
import com.pasal.shop.common.PageResponse;
import com.pasal.shop.security.UserPrincipal;
import com.pasal.shop.user.UserDtos.UserResponse;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserService users;

    public AdminUserController(UserService users) {
        this.users = users;
    }

    @GetMapping
    public PageResponse<UserResponse> list(@PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return PageResponse.of(users.list(pageable), UserResponse::from);
    }

    @PatchMapping("/{id}/enabled")
    public UserResponse setEnabled(@AuthenticationPrincipal UserPrincipal admin, @PathVariable Long id,
            @RequestParam boolean value) {
        if (admin.id().equals(id)) {
            throw new BadRequestException("You cannot change your own enabled status");
        }
        return users.setEnabled(id, value);
    }
}
