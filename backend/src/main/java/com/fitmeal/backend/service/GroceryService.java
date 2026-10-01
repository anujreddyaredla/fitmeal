package com.fitmeal.backend.service;

import com.fitmeal.backend.model.AppUser;
import com.fitmeal.backend.model.GroceryItem;
import com.fitmeal.backend.repository.AppUserRepository;
import com.fitmeal.backend.repository.GroceryItemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class GroceryService {

    private final GroceryItemRepository groceryItemRepository;
    private final AppUserRepository appUserRepository;

    public GroceryService(GroceryItemRepository groceryItemRepository, AppUserRepository appUserRepository) {
        this.groceryItemRepository = groceryItemRepository;
        this.appUserRepository = appUserRepository;
    }

    public List<GroceryItem> getAllItems(String ownerEmail) {
        return groceryItemRepository.findByOwner_EmailOrderByIdAsc(ownerEmail);
    }

    public GroceryItem addItem(String ownerEmail, GroceryItem item) {
        item.setId(null);
        item.setOwner(getAuthenticatedUser(ownerEmail));
        return groceryItemRepository.save(item);
    }

    public GroceryItem updateItem(String ownerEmail, Long id, GroceryItem updatedItem) {
        GroceryItem item = getItemById(ownerEmail, id);

        item.setName(updatedItem.getName());
        item.setCategory(updatedItem.getCategory());
        item.setQuantity(updatedItem.getQuantity());
        item.setUnit(updatedItem.getUnit());
        item.setPurchased(updatedItem.isPurchased());

        return groceryItemRepository.save(item);
    }

    public void deleteItem(String ownerEmail, Long id) {
        GroceryItem item = getItemById(ownerEmail, id);
        groceryItemRepository.delete(item);
    }

    public GroceryItem togglePurchased(String ownerEmail, Long id) {
        GroceryItem item = getItemById(ownerEmail, id);
        item.setPurchased(!item.isPurchased());
        return groceryItemRepository.save(item);
    }

    private GroceryItem getItemById(String ownerEmail, Long id) {
        return groceryItemRepository.findByIdAndOwner_Email(id, ownerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Grocery item not found"));
    }

    private AppUser getAuthenticatedUser(String ownerEmail) {
        return appUserRepository.findByEmailIgnoreCase(ownerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found"));
    }
}
