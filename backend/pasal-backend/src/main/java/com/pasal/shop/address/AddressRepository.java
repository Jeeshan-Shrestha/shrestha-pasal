package com.pasal.shop.address;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByUserIdOrderByDefaultAddressDescIdAsc(Long userId);

    Optional<Address> findByIdAndUserId(Long id, Long userId);

    List<Address> findByUserIdAndDefaultAddressTrue(Long userId);

    long countByUserId(Long userId);
}
