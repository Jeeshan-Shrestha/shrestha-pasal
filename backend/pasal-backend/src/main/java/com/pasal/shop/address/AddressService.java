package com.pasal.shop.address;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pasal.shop.common.Exceptions.NotFoundException;
import com.pasal.shop.common.ShippingInfo;
import com.pasal.shop.user.UserRepository;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Service
public class AddressService {

    public record AddressRequest(
            @Size(max = 50) String label,
            @NotBlank @Size(max = 100) String recipientName,
            @NotBlank @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Invalid phone number") String phone,
            @NotBlank @Size(max = 200) String street,
            @NotBlank @Size(max = 100) String city,
            @Size(max = 100) String district,
            @Size(max = 200) String landmark,
            boolean defaultAddress) {
    }

    public record AddressResponse(Long id, String label, String recipientName, String phone, String street,
            String city, String district, String landmark, boolean defaultAddress) {
        static AddressResponse from(Address a) {
            ShippingInfo s = a.getShipping();
            return new AddressResponse(a.getId(), a.getLabel(), s.getRecipientName(), s.getPhone(), s.getStreet(),
                    s.getCity(), s.getDistrict(), s.getLandmark(), a.isDefaultAddress());
        }
    }

    private final AddressRepository addresses;
    private final UserRepository users;

    public AddressService(AddressRepository addresses, UserRepository users) {
        this.addresses = addresses;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> list(Long userId) {
        return addresses.findByUserIdOrderByDefaultAddressDescIdAsc(userId).stream().map(AddressResponse::from)
                .toList();
    }

    @Transactional
    public AddressResponse create(Long userId, AddressRequest req) {
        Address a = new Address();
        a.setUser(users.getReferenceById(userId));
        // first address becomes the default automatically
        boolean makeDefault = req.defaultAddress() || addresses.countByUserId(userId) == 0;
        apply(a, req, makeDefault);
        if (makeDefault) {
            clearDefaults(userId);
        }
        return AddressResponse.from(addresses.save(a));
    }

    @Transactional
    public AddressResponse update(Long userId, Long id, AddressRequest req) {
        Address a = find(userId, id);
        boolean makeDefault = req.defaultAddress() || a.isDefaultAddress();
        if (req.defaultAddress()) {
            clearDefaults(userId);
        }
        apply(a, req, makeDefault);
        return AddressResponse.from(a);
    }

    @Transactional
    public void delete(Long userId, Long id) {
        Address a = find(userId, id);
        boolean wasDefault = a.isDefaultAddress();
        addresses.delete(a);
        addresses.flush();
        if (wasDefault) {
            addresses.findByUserIdOrderByDefaultAddressDescIdAsc(userId).stream().findFirst()
                    .ifPresent(next -> next.setDefaultAddress(true));
        }
    }

    /** Ownership-checked lookup, also used by checkout. */
    @Transactional(readOnly = true)
    public Address find(Long userId, Long id) {
        return addresses.findByIdAndUserId(id, userId).orElseThrow(() -> new NotFoundException("Address not found"));
    }

    private void clearDefaults(Long userId) {
        addresses.findByUserIdAndDefaultAddressTrue(userId).forEach(x -> x.setDefaultAddress(false));
        addresses.flush();
    }

    private void apply(Address a, AddressRequest r, boolean isDefault) {
        a.setLabel(r.label());
        a.setShipping(new ShippingInfo(r.recipientName().trim(), r.phone().trim(), r.street().trim(),
                r.city().trim(), r.district(), r.landmark()));
        a.setDefaultAddress(isDefault);
    }
}
