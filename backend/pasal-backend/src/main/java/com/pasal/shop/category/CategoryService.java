package com.pasal.shop.category;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pasal.shop.common.Exceptions.ConflictException;
import com.pasal.shop.common.Exceptions.NotFoundException;
import com.pasal.shop.product.ProductRepository;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Service
public class CategoryService {

    public record CategoryRequest(@NotBlank @Size(max = 100) String name, @Size(max = 500) String description) {
    }

    public record CategoryResponse(Long id, String name, String description) {
        static CategoryResponse from(Category c) {
            return new CategoryResponse(c.getId(), c.getName(), c.getDescription());
        }
    }

    private final CategoryRepository categories;
    private final ProductRepository products;

    public CategoryService(CategoryRepository categories, ProductRepository products) {
        this.categories = categories;
        this.products = products;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> list() {
        return categories.findAll(Sort.by("name")).stream().map(CategoryResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse get(Long id) {
        return CategoryResponse.from(find(id));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest req) {
        if (categories.existsByNameIgnoreCase(req.name().trim())) {
            throw new ConflictException("A category with this name already exists");
        }
        Category c = new Category();
        apply(c, req);
        return CategoryResponse.from(categories.save(c));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest req) {
        Category c = find(id);
        if (categories.existsByNameIgnoreCaseAndIdNot(req.name().trim(), id)) {
            throw new ConflictException("A category with this name already exists");
        }
        apply(c, req);
        return CategoryResponse.from(c);
    }

    @Transactional
    public void delete(Long id) {
        Category c = find(id);
        if (products.existsByCategoryId(id)) {
            throw new ConflictException("Category still has products; move or remove them first");
        }
        categories.delete(c);
    }

    public Category find(Long id) {
        return categories.findById(id).orElseThrow(() -> new NotFoundException("Category not found"));
    }

    private void apply(Category c, CategoryRequest req) {
        c.setName(req.name().trim());
        c.setDescription(req.description());
    }
}
