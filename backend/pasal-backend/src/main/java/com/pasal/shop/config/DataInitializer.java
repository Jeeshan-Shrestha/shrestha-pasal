package com.pasal.shop.config;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.pasal.shop.category.Category;
import com.pasal.shop.category.CategoryRepository;
import com.pasal.shop.user.Role;
import com.pasal.shop.user.User;
import com.pasal.shop.user.UserRepository;

/** Seeds the admin account and starter utensil categories on an empty database. */
@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final AppProperties props;
    private final UserRepository users;
    private final CategoryRepository categories;
    private final PasswordEncoder encoder;

    public DataInitializer(AppProperties props, UserRepository users, CategoryRepository categories,
            PasswordEncoder encoder) {
        this.props = props;
        this.users = users;
        this.categories = categories;
        this.encoder = encoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        seedAdmin();
        seedCategories();
    }

    private void seedAdmin() {
        String email = props.admin().email().trim().toLowerCase();
        String password = props.admin().password();
        if (password == null || password.isBlank()) {
            log.warn("ADMIN_PASSWORD not set: no admin account will be created");
            return;
        }
        if (users.existsByEmail(email)) {
            return;
        }
        User admin = new User();
        admin.setFullName(props.admin().fullName());
        admin.setEmail(email);
        admin.setPasswordHash(encoder.encode(password));
        admin.setRole(Role.ADMIN);
        users.save(admin);
        log.info("Created admin account {}", email);
    }

    private void seedCategories() {
        if (categories.count() > 0) {
            return;
        }
        List<String[]> defaults = List.of(
                new String[] { "Pots & Pans", "Cooking pots, kadai, frying pans and tawa" },
                new String[] { "Pressure Cookers", "Pressure cookers and rice cookers" },
                new String[] { "Plates & Bowls", "Thali, plates, bowls and serving dishes" },
                new String[] { "Cutlery", "Spoons, forks, ladles and knives" },
                new String[] { "Copper & Brass", "Traditional copper, brass and kansa ware" },
                new String[] { "Storage & Containers", "Tiffins, jars, bottles and storage boxes" },
                new String[] { "Kettles & Teaware", "Kettles, tea pots, cups and mugs" },
                new String[] { "Kitchen Tools", "Graters, peelers, strainers and other tools" });
        for (String[] d : defaults) {
            Category c = new Category();
            c.setName(d[0]);
            c.setDescription(d[1]);
            categories.save(c);
        }
        log.info("Seeded {} starter categories", defaults.size());
    }
}
