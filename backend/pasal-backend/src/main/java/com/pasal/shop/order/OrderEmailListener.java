package com.pasal.shop.order;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.pasal.shop.config.AppProperties;

/**
 * Sends order emails after the order transaction commits: the shop owner and the customer are told when an
 * order is placed or cancelled. A failed email is logged and never affects the order.
 */
@Component
class OrderEmailListener {

    private static final Logger log = LoggerFactory.getLogger(OrderEmailListener.class);

    private final AppProperties.Alerts config;
    private final ObjectProvider<JavaMailSender> mailSender;
    private final BrevoMailClient brevo;
    private final String shopName;

    OrderEmailListener(AppProperties props, ObjectProvider<JavaMailSender> mailSender, BrevoMailClient brevo) {
        this.config = props.alerts();
        this.mailSender = mailSender;
        this.brevo = brevo;
        this.shopName = props.shop().name();
    }

    /** Makes the "why is no mail arriving" case visible: the feature is silently off without credentials. */
    @EventListener(ApplicationReadyEvent.class)
    void logStatus() {
        if (isEnabled()) {
            log.info("Order emails ON via {}: sending from {}, shop alerts to {}",
                    config.useBrevo() ? "Brevo API" : "Gmail SMTP", config.fromAddress(), config.recipient());
        } else {
            log.warn("Order emails OFF: set BREVO_API_KEY + MAIL_FROM, or MAIL_USERNAME + MAIL_PASSWORD (Gmail)");
        }
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void onOrderPlaced(OrderPlacedEvent event) {
        OrderSnapshot o = event.order();
        send(config.recipient(), "New order " + o.orderNumber() + " - Rs " + o.total(),
                "New order " + o.orderNumber() + " (cash on delivery)\n\nCustomer: " + o.customerName() + ", "
                        + o.customerEmail() + (o.customerPhone() == null ? "" : ", " + o.customerPhone())
                        + "\n\n" + details(o));
        send(o.customerEmail(), "Your order " + o.orderNumber() + " is confirmed - " + shopName,
                "Hi " + o.customerName() + ",\n\nThank you for your order! We have received it and will confirm it "
                        + "shortly. You pay in cash when it arrives.\n\n" + details(o) + "\n\n" + signature());
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void onOrderCancelled(OrderCancelledEvent event) {
        OrderSnapshot o = event.order();
        String by = event.byCustomer() ? "the customer" : "the shop";
        send(config.recipient(), "Order " + o.orderNumber() + " cancelled by " + by,
                "Order " + o.orderNumber() + " was cancelled by " + by + ". Stock has been returned.\n\nCustomer: "
                        + o.customerName() + ", " + o.customerEmail()
                        + (o.customerPhone() == null ? "" : ", " + o.customerPhone()) + "\n\n" + details(o));
        send(o.customerEmail(), "Your order " + o.orderNumber() + " was cancelled - " + shopName,
                "Hi " + o.customerName() + ",\n\n"
                        + (event.byCustomer() ? "As requested, your order has been cancelled."
                                : "Unfortunately we had to cancel your order. Please contact us if you have questions.")
                        + " You will not be charged.\n\n" + details(o) + "\n\n" + signature());
    }

    private String details(OrderSnapshot o) {
        StringBuilder sb = new StringBuilder("Order ").append(o.orderNumber()).append('\n');
        o.itemLines().forEach(line -> sb.append(line).append('\n'));
        sb.append("\nSubtotal: Rs ").append(o.subtotal()).append("\nDelivery: Rs ").append(o.deliveryFee())
                .append("\nTotal:    Rs ").append(o.total()).append(" (cash on delivery)\n\nDeliver to:\n")
                .append(o.address());
        if (o.notes() != null) {
            sb.append("\n\nNote: ").append(o.notes());
        }
        return sb.toString();
    }

    private String signature() {
        return "- " + shopName;
    }

    private boolean isEnabled() {
        return config != null && config.enabled() && (config.useBrevo() || mailSender.getIfAvailable() != null);
    }

    /** One recipient failing must not stop the other email, so each send is guarded on its own. */
    private void send(String to, String subject, String text) {
        if (!isEnabled() || to == null || to.isBlank()) {
            return;
        }
        try {
            if (config.useBrevo()) {
                brevo.send(config.brevoApiKey(), shopName, config.fromAddress(), to, subject, text);
            } else {
                SimpleMailMessage mail = new SimpleMailMessage();
                mail.setFrom(config.fromAddress());
                mail.setTo(to);
                mail.setSubject(subject);
                mail.setText(text);
                mailSender.getObject().send(mail);
            }
            log.info("Order email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.warn("Order email to {} failed ({}): {}", to, subject, e.getMessage());
        }
    }
}
