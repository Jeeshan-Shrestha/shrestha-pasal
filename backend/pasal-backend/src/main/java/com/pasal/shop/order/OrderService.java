package com.pasal.shop.order;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pasal.shop.address.Address;
import com.pasal.shop.address.AddressService;
import com.pasal.shop.cart.CartItem;
import com.pasal.shop.cart.CartItemRepository;
import com.pasal.shop.cart.CartService;
import com.pasal.shop.common.Exceptions.BadRequestException;
import com.pasal.shop.common.Exceptions.NotFoundException;
import com.pasal.shop.order.OrderDtos.OrderResponse;
import com.pasal.shop.order.OrderDtos.PlaceOrderRequest;
import com.pasal.shop.product.Product;
import com.pasal.shop.product.ProductRepository;
import com.pasal.shop.user.UserRepository;

@Service
public class OrderService {

    private static final String ORDER_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final OrderRepository orders;
    private final CartItemRepository cartItems;
    private final ProductRepository products;
    private final UserRepository users;
    private final AddressService addresses;
    private final CartService cart;
    private final ApplicationEventPublisher events;

    public OrderService(OrderRepository orders, CartItemRepository cartItems, ProductRepository products,
            UserRepository users, AddressService addresses, CartService cart, ApplicationEventPublisher events) {
        this.orders = orders;
        this.cartItems = cartItems;
        this.products = products;
        this.users = users;
        this.addresses = addresses;
        this.cart = cart;
        this.events = events;
    }

    /** Turns the user's cart into a cash-on-delivery order and reserves stock, all in one transaction. */
    @Transactional
    public OrderResponse place(Long userId, PlaceOrderRequest req) {
        Address address = addresses.find(userId, req.addressId());
        // Products must not be loaded before the row lock below, or their stock could be stale.
        List<CartItem> items = cartItems.findByUserIdOrderById(userId);
        if (items.isEmpty()) {
            throw new BadRequestException("Your cart is empty");
        }

        Map<Long, Product> locked = lock(items.stream().map(ci -> ci.getProduct().getId()).toList());

        Order order = new Order();
        order.setOrderNumber(newOrderNumber());
        order.setUser(users.getReferenceById(userId));
        order.setShipping(address.getShipping().copy());
        order.setNotes(req.notes() == null || req.notes().isBlank() ? null : req.notes().trim());

        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem ci : items) {
            Product p = locked.get(ci.getProduct().getId());
            if (!p.isActive()) {
                throw new BadRequestException("\"" + p.getName() + "\" is no longer available. Remove it from your cart.");
            }
            if (p.getStockQuantity() < ci.getQuantity()) {
                throw new BadRequestException("Only " + p.getStockQuantity() + " of \"" + p.getName()
                        + "\" left in stock. Update your cart.");
            }
            p.setStockQuantity(p.getStockQuantity() - ci.getQuantity());

            OrderItem oi = new OrderItem();
            oi.setProduct(p);
            oi.setProductName(p.getName());
            oi.setImageUrl(p.getImageUrl());
            oi.setUnitPrice(p.getPrice());
            oi.setQuantity(ci.getQuantity());
            oi.setLineTotal(p.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())));
            order.addItem(oi);
            subtotal = subtotal.add(oi.getLineTotal());
        }
        BigDecimal fee = cart.deliveryFeeFor(subtotal);
        order.setSubtotal(subtotal);
        order.setDeliveryFee(fee);
        order.setTotal(subtotal.add(fee));

        orders.save(order);
        cartItems.deleteAllByUserId(userId);
        events.publishEvent(new OrderPlacedEvent(OrderSnapshot.from(order)));
        return OrderResponse.from(order, false);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> myOrders(Long userId, Pageable pageable) {
        return orders.findByUserId(userId, pageable).map(o -> OrderResponse.from(o, false));
    }

    @Transactional(readOnly = true)
    public OrderResponse myOrder(Long userId, Long id) {
        return OrderResponse.from(orders.findByIdAndUserId(id, userId).orElseThrow(this::notFound), false);
    }

    @Transactional
    public OrderResponse cancelMine(Long userId, Long id) {
        Order o = orders.findByIdAndUserId(id, userId).orElseThrow(this::notFound);
        if (!o.getStatus().customerCancellable()) {
            throw new BadRequestException(
                    "This order is already " + o.getStatus().name().toLowerCase() + " and can no longer be cancelled");
        }
        cancel(o, true);
        return OrderResponse.from(o, false);
    }

    // ---- admin ----

    @Transactional(readOnly = true)
    public Page<OrderResponse> adminList(OrderStatus status, Pageable pageable) {
        Page<Order> page = status == null ? orders.findAll(pageable) : orders.findByStatus(status, pageable);
        return page.map(o -> OrderResponse.from(o, true));
    }

    @Transactional(readOnly = true)
    public OrderResponse adminGet(Long id) {
        return OrderResponse.from(orders.findById(id).orElseThrow(this::notFound), true);
    }

    @Transactional
    public OrderResponse adminUpdateStatus(Long id, OrderStatus next) {
        Order o = orders.findById(id).orElseThrow(this::notFound);
        if (!o.getStatus().next().contains(next)) {
            throw new BadRequestException("Cannot move an order from " + o.getStatus() + " to " + next);
        }
        if (next == OrderStatus.CANCELLED) {
            cancel(o, false);
        } else {
            o.setStatus(next);
            if (next == OrderStatus.DELIVERED) {
                o.setPaymentStatus(PaymentStatus.PAID); // cash collected by the delivery person
            }
        }
        return OrderResponse.from(o, true);
    }

    // ---- helpers ----

    private void cancel(Order o, boolean byCustomer) {
        Map<Long, Product> locked = lock(o.getItems().stream().map(i -> i.getProduct().getId()).toList());
        for (OrderItem i : o.getItems()) {
            Product p = locked.get(i.getProduct().getId());
            p.setStockQuantity(p.getStockQuantity() + i.getQuantity());
        }
        o.setStatus(OrderStatus.CANCELLED);
        o.setPaymentStatus(PaymentStatus.CANCELLED);
        events.publishEvent(new OrderCancelledEvent(OrderSnapshot.from(o), byCustomer));
    }

    private Map<Long, Product> lock(List<Long> productIds) {
        return products.findAllForUpdate(productIds).stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));
    }

    private String newOrderNumber() {
        StringBuilder sb = new StringBuilder("NSB-")
                .append(LocalDate.now(ZoneOffset.UTC).format(DateTimeFormatter.BASIC_ISO_DATE)).append('-');
        for (int i = 0; i < 5; i++) {
            sb.append(ORDER_CHARS.charAt(RANDOM.nextInt(ORDER_CHARS.length())));
        }
        return sb.toString();
    }

    private NotFoundException notFound() {
        return new NotFoundException("Order not found");
    }
}
