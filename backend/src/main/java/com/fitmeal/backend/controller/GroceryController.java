package com.fitmeal.backend.controller;

import com.fitmeal.backend.model.GroceryItem;
import com.fitmeal.backend.service.GroceryService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RestController
@RequestMapping("/api/grocery-list")
public class GroceryController {

    private final GroceryService groceryService;

    public GroceryController(GroceryService groceryService) {
        this.groceryService = groceryService;
    }

    @GetMapping
    public List<GroceryItem> getAllItems(Authentication authentication) {
        return groceryService.getAllItems(getUserEmail(authentication));
    }

    @PostMapping
    public GroceryItem addItem(Authentication authentication, @RequestBody GroceryItem item) {
        return groceryService.addItem(getUserEmail(authentication), item);
    }

    @PutMapping("/{id}")
    public GroceryItem updateItem(Authentication authentication, @PathVariable Long id, @RequestBody GroceryItem item) {
        return groceryService.updateItem(getUserEmail(authentication), id, item);
    }

    @DeleteMapping("/{id}")
    public String deleteItem(Authentication authentication, @PathVariable Long id) {
        groceryService.deleteItem(getUserEmail(authentication), id);
        return "Grocery item deleted successfully";
    }

    @PatchMapping("/{id}/toggle")
    public GroceryItem togglePurchased(Authentication authentication, @PathVariable Long id) {
        return groceryService.togglePurchased(getUserEmail(authentication), id);
    }

    private String getUserEmail(Authentication authentication) {
        return authentication.getName();
    }
}
