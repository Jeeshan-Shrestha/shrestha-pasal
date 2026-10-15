package com.pasal.shop.order;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.pasal.shop.config.AppProperties;

/** Emails the shop owner about a new order. Failures are logged and never affect the order. */
@Component
class OrderEmailListener {

    private static final Logger log = LoggerFactory.getLogger(OrderEmailListener.class);

    private final AppProperties.Alerts config;
    private final ObjectProvider<JavaMailSender> mailSender;

    OrderEmailListener(AppProperties props, ObjectProvider<JavaMailSender> mailSender) {
        this.config = props.alerts();
        this.mailSender = mailSender;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void onOrderPlaced(OrderPlacedEvent event) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (config == null || !config.enabled() || sender == null) {
            return;
        }
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(config.mailUsername());
            mail.setTo(config.recipient());
            mail.setSubject(event.subject());
            mail.setText(event.message());
            sender.send(mail);
        } catch (Exception e) {
            log.warn("Order alert email failed: {}", e.getMessage());
        }
    }
}
