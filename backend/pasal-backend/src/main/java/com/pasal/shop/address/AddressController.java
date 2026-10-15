package com.pasal.shop.address;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.pasal.shop.address.AddressService.AddressRequest;
import com.pasal.shop.address.AddressService.AddressResponse;
import com.pasal.shop.security.UserPrincipal;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService service;

    public AddressController(AddressService service) {
        this.service = service;
    }

    @GetMapping
    public List<AddressResponse> list(@AuthenticationPrincipal UserPrincipal p) {
        return service.list(p.id());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AddressResponse create(@AuthenticationPrincipal UserPrincipal p, @Valid @RequestBody AddressRequest req) {
        return service.create(p.id(), req);
    }

    @PutMapping("/{id}")
    public AddressResponse update(@AuthenticationPrincipal UserPrincipal p, @PathVariable Long id,
            @Valid @RequestBody AddressRequest req) {
        return service.update(p.id(), id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal UserPrincipal p, @PathVariable Long id) {
        service.delete(p.id(), id);
    }
}
