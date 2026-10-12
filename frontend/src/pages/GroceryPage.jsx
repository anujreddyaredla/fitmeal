export default function GroceryPage({ view }) {
    const {
        clearGroceryForm, deleteGroceryItem, editGroceryItem, editingGroceryId, getGroceryItemsByCategory, groceryCategories, groceryForm, groceryProgress, handleGroceryChange, handleGrocerySubmit, purchasedGroceryCount, toggleGroceryPurchased, totalGroceryCount
    } = view;
    return (
        <main className="main-content route-page">
<section className="panel grocery-panel" id="grocery-section">
    <div className="grocery-top">
        <div className="section-heading">
            <span>Shopping workspace</span>
            <h2>Grocery List</h2>
        </div>

        <div className="grocery-progress">
            <div>
                <strong>
                    {purchasedGroceryCount}/{totalGroceryCount}
                </strong>
                <span>Purchased</span>
            </div>
            <div className="progress-track">
                <div
                    className="progress-fill"
                    style={{ width: `${groceryProgress}%` }}
                ></div>
            </div>
        </div>
    </div>

    <form className="grocery-form" onSubmit={handleGrocerySubmit}>
        <input
            type="text"
            name="name"
            placeholder="Item name"
            value={groceryForm.name}
            onChange={handleGroceryChange}
        />

        <select
            name="category"
            value={groceryForm.category}
            onChange={handleGroceryChange}
        >
            {groceryCategories.map((category) => (
                <option key={category} value={category}>
                    {category}
                </option>
            ))}
        </select>

        <input
            type="text"
            name="quantity"
            placeholder="Quantity"
            value={groceryForm.quantity}
            onChange={handleGroceryChange}
        />

        <input
            type="text"
            name="unit"
            placeholder="Unit"
            value={groceryForm.unit}
            onChange={handleGroceryChange}
        />

        <button type="submit">
            {editingGroceryId ? "Update Item" : "Add Item"}
        </button>

        {editingGroceryId && (
            <button
                className="cancel-grocery-btn"
                type="button"
                onClick={clearGroceryForm}
            >
                Cancel
            </button>
        )}
    </form>

    <div className="grocery-category-grid">
        {groceryCategories.map((category) => {
            const categoryItems = getGroceryItemsByCategory(category);

            return (
                <div className="grocery-category-card" key={category}>
                    <div className="grocery-category-header">
                        <h3>{category}</h3>
                        <span>{categoryItems.length}</span>
                    </div>

                    <div className="grocery-items-stack">
                        {categoryItems.length === 0 ? (
                            <p className="empty-grocery-text">No items yet</p>
                        ) : (
                            categoryItems.map((item) => (
                                <div
                                    className={
                                        item.purchased
                                            ? "grocery-item-row purchased"
                                            : "grocery-item-row"
                                    }
                                    key={item.id}
                                >
                                    <label className="grocery-check">
                                        <input
                                            type="checkbox"
                                            checked={item.purchased}
                                            onChange={() =>
                                                toggleGroceryPurchased(item.id)
                                            }
                                        />
                                        <span></span>
                                    </label>

                                    <div className="grocery-item-info">
                                        <strong>{item.name}</strong>
                                        <p>
                                            {item.quantity} {item.unit}
                                        </p>
                                    </div>

                                    <span className="category-badge">
                                        {item.category || "Other"}
                                    </span>

                                    <div className="grocery-actions">
                                        <button
                                            className="edit-btn"
                                            onClick={() =>
                                                editGroceryItem(item)
                                            }
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                deleteGroceryItem(item.id)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            );
        })}
    </div>
</section>
        </main>
    );
}
