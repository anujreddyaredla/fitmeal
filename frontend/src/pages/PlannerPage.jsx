import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addCatalogMealToPlan } from "../api/mealPlanApi";
import CatalogMealImage from "../components/CatalogMealImage";
import useMealCatalog from "../hooks/useMealCatalog";
import "./PlannerPage.css";

const mealSlots = [
    { value: "BREAKFAST", key: "breakfast", label: "Breakfast" },
    { value: "LUNCH", key: "lunch", label: "Lunch" },
    { value: "SNACK", key: "snack", label: "Snack" },
    { value: "DINNER", key: "dinner", label: "Dinner" },
];

export default function PlannerPage({ onMealPlanUpdated, onSessionExpired, view }) {
    const {
        clearMealPlanForm,
        deleteMealPlan,
        editingMealPlanId,
        editMealPlan,
        getPlanMealText,
        handleMealPlanChange,
        handleMealPlanSubmit,
        mealPlanForm,
        sortedMealPlans,
        weekDays,
    } = view;
    const [plannerMode, setPlannerMode] = useState("catalog");
    const [catalogForm, setCatalogForm] = useState({ day: "Monday", slot: "BREAKFAST" });
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [catalogSaving, setCatalogSaving] = useState(false);
    const [catalogMessage, setCatalogMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSearch(searchInput), 300);
        return () => window.clearTimeout(timer);
    }, [searchInput]);

    const { meals, loading, error } = useMealCatalog({
        category: catalogForm.slot,
        search: debouncedSearch,
        onUnauthorized: onSessionExpired,
    });

    const suggestions = useMemo(() => meals.slice(0, 6), [meals]);
    const showSuggestions = searchFocused && searchInput.trim() && !selectedMeal;

    const chooseCatalogMeal = (meal) => {
        setSelectedMeal(meal);
        setSearchInput(meal.name);
        setSearchFocused(false);
        setCatalogMessage({ type: "", text: "" });
    };

    const clearCatalogMeal = () => {
        setSelectedMeal(null);
        setSearchInput("");
        setDebouncedSearch("");
        setCatalogMessage({ type: "", text: "" });
    };

    const handleCatalogFieldChange = (event) => {
        const { name, value } = event.target;
        setCatalogForm((current) => ({ ...current, [name]: value }));
        setSelectedMeal(null);
        setSearchInput("");
        setDebouncedSearch("");
        setCatalogMessage({ type: "", text: "" });
    };

    const openCatalogPicker = (day, slot) => {
        setPlannerMode("catalog");
        setCatalogForm({ day, slot });
        setSelectedMeal(null);
        setSearchInput("");
        setDebouncedSearch("");
        setCatalogMessage({ type: "", text: "" });
        window.setTimeout(() => {
            document.getElementById("planner-workflow")?.scrollIntoView({ behavior: "smooth" });
        }, 0);
    };

    const handleCatalogSubmit = async (event) => {
        event.preventDefault();

        if (!selectedMeal) {
            setCatalogMessage({ type: "error", text: "Choose a meal from the search results first." });
            return;
        }

        setCatalogSaving(true);
        setCatalogMessage({ type: "", text: "" });

        try {
            await addCatalogMealToPlan({
                catalogMealId: selectedMeal.id,
                day: catalogForm.day,
                slot: catalogForm.slot,
                onUnauthorized: onSessionExpired,
            });
            onMealPlanUpdated?.();
            setCatalogMessage({
                type: "success",
                text: `${selectedMeal.name} was added to ${catalogForm.day}.`,
            });
        } catch (requestError) {
            if (requestError.message !== "Session expired") {
                setCatalogMessage({
                    type: "error",
                    text: requestError.message || "Could not add this meal to your planner.",
                });
            }
        } finally {
            setCatalogSaving(false);
        }
    };

    const handleEditPlan = (plan) => {
        setPlannerMode("custom");
        editMealPlan(plan);
    };

    return (
        <main className="main-content route-page planner-page">
            <section className="panel planner-panel" id="planner-section">
                <div className="planner-page-heading">
                    <div className="section-heading">
                        <span>Weekly workspace</span>
                        <h2>Meal Planner</h2>
                        <p>Choose a FitMeal recipe in a few clicks or keep building custom days manually.</p>
                    </div>
                    <Link to="/meal-library">Browse Meal Library</Link>
                </div>

                <div className="planner-mode-switch" id="planner-workflow" role="tablist" aria-label="Meal planner method">
                    <button
                        className={plannerMode === "catalog" ? "active" : ""}
                        type="button"
                        role="tab"
                        aria-selected={plannerMode === "catalog"}
                        onClick={() => setPlannerMode("catalog")}
                    >
                        Add Existing Meal
                    </button>
                    <button
                        className={plannerMode === "custom" ? "active" : ""}
                        type="button"
                        role="tab"
                        aria-selected={plannerMode === "custom"}
                        onClick={() => setPlannerMode("custom")}
                    >
                        Create Custom Meal
                    </button>
                </div>

                {plannerMode === "catalog" ? (
                    <section className="planner-catalog-workflow" aria-labelledby="catalog-planner-title">
                        <div className="planner-workflow-heading">
                            <div>
                                <span>FitMeal catalog</span>
                                <h3 id="catalog-planner-title">Search and schedule a healthy meal</h3>
                            </div>
                            <p>Nutrition is copied automatically from the selected recipe.</p>
                        </div>

                        <form className="planner-catalog-form" onSubmit={handleCatalogSubmit}>
                            <label>
                                Day
                                <select name="day" value={catalogForm.day} onChange={handleCatalogFieldChange}>
                                    {weekDays.map((day) => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Meal slot
                                <select name="slot" value={catalogForm.slot} onChange={handleCatalogFieldChange}>
                                    {mealSlots.map((slot) => (
                                        <option key={slot.value} value={slot.value}>{slot.label}</option>
                                    ))}
                                </select>
                            </label>

                            <div className="planner-catalog-search">
                                <label htmlFor="planner-meal-search">Search {catalogForm.slot.toLowerCase()} meals</label>
                                <div className="planner-search-control">
                                    <input
                                        id="planner-meal-search"
                                        type="search"
                                        placeholder="Start typing chicken, oats, tofu, berries..."
                                        value={searchInput}
                                        autoComplete="off"
                                        onChange={(event) => {
                                            setSearchInput(event.target.value);
                                            setSelectedMeal(null);
                                            setCatalogMessage({ type: "", text: "" });
                                        }}
                                        onFocus={() => setSearchFocused(true)}
                                        onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
                                    />
                                    {searchInput && <button type="button" onClick={clearCatalogMeal}>Clear</button>}
                                </div>

                                {showSuggestions && (
                                    <div className="planner-search-suggestions" role="listbox">
                                        {loading ? (
                                            <p>Searching meals...</p>
                                        ) : suggestions.length > 0 ? (
                                            suggestions.map((meal) => (
                                                <button
                                                    key={meal.id}
                                                    type="button"
                                                    role="option"
                                                    aria-selected="false"
                                                    onMouseDown={(event) => event.preventDefault()}
                                                    onClick={() => chooseCatalogMeal(meal)}
                                                >
                                                    <span>{meal.name}</span>
                                                    <small>{meal.calories} kcal · {meal.protein}g protein</small>
                                                </button>
                                            ))
                                        ) : (
                                            <p>No matching {catalogForm.slot.toLowerCase()} meals found.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {selectedMeal && (
                                <article className="planner-selected-meal">
                                    <CatalogMealImage meal={selectedMeal} />
                                    <div>
                                        <span>{selectedMeal.category}</span>
                                        <h4>{selectedMeal.name}</h4>
                                        <p>{selectedMeal.calories} kcal · {selectedMeal.protein}g protein · {selectedMeal.fiber}g fiber</p>
                                        <Link to={`/meal-library/${selectedMeal.slug}`}>View recipe</Link>
                                    </div>
                                </article>
                            )}

                            {error && <p className="planner-catalog-message error">{error}</p>}
                            {catalogMessage.text && (
                                <p className={`planner-catalog-message ${catalogMessage.type}`}>
                                    {catalogMessage.text}
                                </p>
                            )}

                            <button className="planner-catalog-submit" type="submit" disabled={catalogSaving || !selectedMeal}>
                                {catalogSaving ? "Adding meal..." : "Add Meal to Planner"}
                            </button>
                        </form>
                    </section>
                ) : (
                    <section className="planner-custom-workflow" aria-labelledby="custom-planner-title">
                        <div className="planner-workflow-heading">
                            <div>
                                <span>Manual option</span>
                                <h3 id="custom-planner-title">{editingMealPlanId ? "Update custom day" : "Create a custom day"}</h3>
                            </div>
                            <p>Use this when your meal is not available in the FitMeal catalog.</p>
                        </div>

                        <form className="planner-form" onSubmit={handleMealPlanSubmit}>
                            <select name="day" aria-label="Day" value={mealPlanForm.day} onChange={handleMealPlanChange}>
                                {weekDays.map((day) => <option key={day} value={day}>{day}</option>)}
                            </select>
                            <input type="text" name="breakfast" aria-label="Breakfast" placeholder="Breakfast" value={mealPlanForm.breakfast} onChange={handleMealPlanChange} />
                            <input type="text" name="lunch" aria-label="Lunch" placeholder="Lunch" value={mealPlanForm.lunch} onChange={handleMealPlanChange} />
                            <input type="text" name="dinner" aria-label="Dinner" placeholder="Dinner" value={mealPlanForm.dinner} onChange={handleMealPlanChange} />
                            <input type="text" name="snack" aria-label="Snack" placeholder="Snack" value={mealPlanForm.snack} onChange={handleMealPlanChange} />
                            <input type="number" name="totalCalories" aria-label="Total calories" placeholder="Total Calories" value={mealPlanForm.totalCalories} onChange={handleMealPlanChange} />
                            <input type="number" name="totalProtein" aria-label="Total protein" placeholder="Total Protein" value={mealPlanForm.totalProtein} onChange={handleMealPlanChange} />
                            <button type="submit">{editingMealPlanId ? "Update Plan" : "Add Plan"}</button>
                            {editingMealPlanId && <button className="cancel-plan-btn" type="button" onClick={clearMealPlanForm}>Cancel</button>}
                        </form>
                    </section>
                )}

                <section className="planner-week-section" aria-labelledby="weekly-plan-title">
                    <div className="planner-week-heading">
                        <div>
                            <span>Your schedule</span>
                            <h3 id="weekly-plan-title">Monday to Sunday</h3>
                        </div>
                        <p>Use any Add Meal button to search the matching recipe category.</p>
                    </div>

                    <div className="planner-grid">
                        {weekDays.map((day) => {
                            const mealPlan = sortedMealPlans.find((plan) => plan.day === day);

                            return (
                                <article className="planner-card" key={day}>
                                    <div className="planner-card-top">
                                        <span>{day}</span>
                                        <strong>{mealPlan?.totalCalories || 0} cal</strong>
                                    </div>

                                    <div className="planner-meal-list">
                                        {mealSlots.map((slot) => (
                                            <div className="planner-slot" key={slot.value}>
                                                <div>
                                                    <span>{slot.label}</span>
                                                    <strong>{getPlanMealText(mealPlan?.[slot.key])}</strong>
                                                </div>
                                                <button type="button" onClick={() => openCatalogPicker(day, slot.value)}>
                                                    Add Meal
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="planner-metrics">
                                        <span>{mealPlan?.totalCalories || 0} Calories</span>
                                        <span>{mealPlan?.totalProtein || 0}g Protein</span>
                                    </div>

                                    {mealPlan && (
                                        <div className="planner-actions">
                                            <button className="edit-btn" onClick={() => handleEditPlan(mealPlan)}>Edit</button>
                                            <button className="delete-btn" onClick={() => deleteMealPlan(mealPlan.id)}>Delete</button>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                </section>
            </section>
        </main>
    );
}
