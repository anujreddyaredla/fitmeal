export default function MealsPage({ view }) {
    const {
        deleteMeal, editingMealId, editMeal, filteredMeals, formData, handleChange, handleMealTypeChange, handleSearchChange, handleSubmit, searchTerm, selectedMealType
    } = view;
    return (
        <main className="main-content route-page">
            <section className="content-grid single-column-grid">
    <div className="panel form-panel" id="meal-form-section">
        <div className="section-heading">
            <span>
                {editingMealId ? "Update your meal" : "Create a meal"}
            </span>
            <h2>{editingMealId ? "Edit Meal" : "Add Meal"}</h2>
        </div>

        <form className="meal-form" onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                placeholder="Meal name"
                value={formData.name}
                onChange={handleChange}
            />

            <input
                type="text"
                name="mealType"
                placeholder="Meal type"
                value={formData.mealType}
                onChange={handleChange}
            />

            <input
                type="number"
                name="calories"
                placeholder="Calories"
                value={formData.calories}
                onChange={handleChange}
            />

            <input
                type="number"
                name="protein"
                placeholder="Protein"
                value={formData.protein}
                onChange={handleChange}
            />

            <button type="submit">
                {editingMealId ? "Update Meal" : "Add Meal"}
            </button>
        </form>
    </div>
            </section>
<section className="panel meals-section">
    <div className="section-top">
        <div className="section-heading">
            <span>Your saved meals</span>
            <h2>Meal Library</h2>
        </div>

        <div className="filter-controls">
            <input
                type="text"
                placeholder="Search meals by name"
                value={searchTerm}
                onChange={handleSearchChange}
            />

            <select
                value={selectedMealType}
                onChange={handleMealTypeChange}
            >
                <option value="ALL">ALL</option>
                <option value="BREAKFAST">BREAKFAST</option>
                <option value="LUNCH">LUNCH</option>
                <option value="DINNER">DINNER</option>
                <option value="SNACK">SNACK</option>
            </select>
        </div>
    </div>

    <div className="meal-grid">
        {filteredMeals.map((meal) => (
            <div className="meal-card" key={meal.id}>
                <div className="meal-card-header">
                    <h3>{meal.name}</h3>
                    <span>{meal.mealType}</span>
                </div>

                <div className="meal-metrics">
                    <div>
                        <strong>{meal.calories}</strong>
                        <span>Calories</span>
                    </div>
                    <div>
                        <strong>{meal.protein}g</strong>
                        <span>Protein</span>
                    </div>
                </div>

                <div className="card-actions">
                    <button
                        className="edit-btn"
                        onClick={() => editMeal(meal)}
                    >
                        Edit
                    </button>

                    <button
                        className="delete-btn"
                        onClick={() => deleteMeal(meal.id)}
                    >
                        Delete
                    </button>
                </div>
            </div>
        ))}
    </div>
</section>
        </main>
    );
}
