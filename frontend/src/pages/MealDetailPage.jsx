import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { addCatalogMealToPlan } from "../api/mealPlanApi";
import CatalogMealImage from "../components/CatalogMealImage";
import useCatalogMeal from "../hooks/useCatalogMeal";
import "./MealDetailPage.css";

function NutritionItem({ value, label, unit = "g" }) {
    return (
        <div className="recipe-nutrition-item">
            <strong>
                {value}
                {unit}
            </strong>
            <span>{label}</span>
        </div>
    );
}

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const mealSlots = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"];

export default function MealDetailPage({ onMealPlanUpdated, onSessionExpired }) {
    const { slug } = useParams();
    const [plannerOpen, setPlannerOpen] = useState(false);
    const [plannerSaving, setPlannerSaving] = useState(false);
    const [plannerMessage, setPlannerMessage] = useState({ type: "", text: "" });
    const [plannerSelection, setPlannerSelection] = useState({
        day: "Monday",
        slot: "BREAKFAST",
    });
    const { meal, loading, error } = useCatalogMeal({
        slug,
        onUnauthorized: onSessionExpired,
    });

    useEffect(() => {
        if (!plannerOpen) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape" && !plannerSaving) {
                setPlannerOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [plannerOpen, plannerSaving]);

    if (loading) {
        return (
            <main className="main-content route-page recipe-status-page">
                <div className="fitmeal-loader-ring"></div>
                <p>Preparing recipe details...</p>
            </main>
        );
    }

    if (error || !meal) {
        return (
            <main className="main-content route-page recipe-status-page">
                <div className="recipe-error-card">
                    <span>Recipe unavailable</span>
                    <h1>We could not open this meal</h1>
                    <p>{error || "The requested catalog meal was not found."}</p>
                    <Link to="/meal-library">Return to Meal Library</Link>
                </div>
            </main>
        );
    }

    const totalMinutes = meal.prepMinutes + meal.cookMinutes;

    const openPlanner = () => {
        setPlannerSelection((current) => ({
            ...current,
            slot: mealSlots.includes(meal.category) ? meal.category : "BREAKFAST",
        }));
        setPlannerMessage({ type: "", text: "" });
        setPlannerOpen(true);
    };

    const closePlanner = () => {
        if (!plannerSaving) {
            setPlannerOpen(false);
        }
    };

    const handlePlannerChange = (event) => {
        const { name, value } = event.target;
        setPlannerSelection((current) => ({ ...current, [name]: value }));
        setPlannerMessage({ type: "", text: "" });
    };

    const handlePlannerSubmit = async (event) => {
        event.preventDefault();
        setPlannerSaving(true);
        setPlannerMessage({ type: "", text: "" });

        try {
            await addCatalogMealToPlan({
                catalogMealId: meal.id,
                day: plannerSelection.day,
                slot: plannerSelection.slot,
                onUnauthorized: onSessionExpired,
            });
            onMealPlanUpdated?.();
            setPlannerMessage({
                type: "success",
                text: `${meal.name} was added to ${plannerSelection.day} ${plannerSelection.slot.toLowerCase()}.`,
            });
        } catch (requestError) {
            if (requestError.message !== "Session expired") {
                setPlannerMessage({
                    type: "error",
                    text: requestError.message || "Could not add this meal to your planner.",
                });
            }
        } finally {
            setPlannerSaving(false);
        }
    };

    return (
        <main className="main-content route-page meal-detail-page">
            <Link className="recipe-back-link" to="/meal-library">
                <span aria-hidden="true">←</span> Back to Meal Library
            </Link>

            <section className="recipe-hero">
                <div className="recipe-hero-image">
                    <CatalogMealImage meal={meal} className="recipe-large-image" priority />
                </div>

                <div className="recipe-hero-content">
                    <div className="recipe-category-line">
                        <span>{meal.category}</span>
                        <strong>{totalMinutes} minutes total</strong>
                    </div>
                    <h1>{meal.name}</h1>
                    <p>{meal.description}</p>

                    <div className="recipe-tag-list">
                        {meal.dietaryTags.map((tag) => (
                            <span key={tag}>{tag}</span>
                        ))}
                    </div>

                    <div className="recipe-time-grid">
                        <div>
                            <span>Serving</span>
                            <strong>{meal.servingSize}</strong>
                        </div>
                        <div>
                            <span>Preparation</span>
                            <strong>{meal.prepMinutes} min</strong>
                        </div>
                        <div>
                            <span>Cooking</span>
                            <strong>{meal.cookMinutes} min</strong>
                        </div>
                    </div>

                    <button
                        className="recipe-add-plan-button"
                        type="button"
                        onClick={openPlanner}
                    >
                        Add to Meal Plan
                    </button>
                </div>
            </section>

            <section className="recipe-nutrition-section" aria-labelledby="nutrition-title">
                <div className="recipe-section-heading">
                    <span>Estimated per serving</span>
                    <h2 id="nutrition-title">Nutrition summary</h2>
                </div>
                <div className="recipe-nutrition-grid">
                    <NutritionItem value={meal.calories} label="Calories" unit=" kcal" />
                    <NutritionItem value={meal.protein} label="Protein" />
                    <NutritionItem value={meal.carbohydrates} label="Carbohydrates" />
                    <NutritionItem value={meal.fat} label="Fat" />
                    <NutritionItem value={meal.fiber} label="Fiber" />
                </div>
                <p className="recipe-estimate-note">
                    Nutrition values are estimates and can vary with brands, portions, and substitutions.
                </p>
            </section>

            <div className="recipe-content-grid">
                <section className="recipe-panel recipe-ingredients" aria-labelledby="ingredients-title">
                    <div className="recipe-section-heading">
                        <span>Prepare before cooking</span>
                        <h2 id="ingredients-title">Ingredients</h2>
                    </div>

                    <ul>
                        {meal.ingredients.map((ingredient) => (
                            <li key={`${ingredient.displayOrder}-${ingredient.name}`}>
                                <span className="ingredient-check" aria-hidden="true"></span>
                                <div>
                                    <strong>
                                        {[ingredient.quantity, ingredient.unit, ingredient.name]
                                            .filter(Boolean)
                                            .join(" ")}
                                    </strong>
                                    {ingredient.preparationNote && <p>{ingredient.preparationNote}</p>}
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                <aside className="recipe-panel recipe-equipment" aria-labelledby="equipment-title">
                    <div className="recipe-section-heading">
                        <span>Gather first</span>
                        <h2 id="equipment-title">Equipment</h2>
                    </div>
                    <div className="equipment-list">
                        {meal.equipment.map((item) => (
                            <span key={item}>{item}</span>
                        ))}
                    </div>

                    <div className="beginner-cooking-note">
                        <strong>Beginner tip</strong>
                        <p>
                            Read every step once and measure all ingredients before turning on the
                            stove. This keeps cooking calm and organized.
                        </p>
                    </div>
                </aside>
            </div>

            <section className="recipe-instructions-section" aria-labelledby="instructions-title">
                <div className="recipe-section-heading">
                    <span>Follow in order</span>
                    <h2 id="instructions-title">Step-by-step cooking instructions</h2>
                </div>

                <ol className="recipe-step-list">
                    {meal.instructions.map((step) => (
                        <li key={step.stepNumber}>
                            <div className="recipe-step-number">{step.stepNumber}</div>
                            <div className="recipe-step-content">
                                <div className="recipe-step-heading">
                                    <h3>{step.title}</h3>
                                    {step.estimatedMinutes != null && (
                                        <span>{step.estimatedMinutes} min</span>
                                    )}
                                </div>
                                <p>{step.instruction}</p>
                                {step.safetyNote && (
                                    <div className="recipe-safety-note">
                                        <strong>Safety</strong>
                                        <span>{step.safetyNote}</span>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="recipe-finish-panel">
                <div>
                    <span>Ready to cook?</span>
                    <h2>Save this meal to your weekly plan</h2>
                    <p>Choose a day and meal slot. Nutrition totals update automatically.</p>
                </div>
                <button type="button" onClick={openPlanner}>
                    Add to Meal Plan
                </button>
            </section>

            {plannerOpen && (
                <div className="recipe-planner-overlay" role="presentation" onMouseDown={closePlanner}>
                    <section
                        aria-labelledby="planner-dialog-title"
                        aria-modal="true"
                        className="recipe-planner-dialog"
                        role="dialog"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="recipe-planner-dialog-heading">
                            <div>
                                <span>Add catalog meal</span>
                                <h2 id="planner-dialog-title">Plan {meal.name}</h2>
                            </div>
                            <button type="button" onClick={closePlanner} aria-label="Close planner picker">
                                ×
                            </button>
                        </div>

                        <div className="recipe-planner-meal-summary">
                            <CatalogMealImage meal={meal} />
                            <div>
                                <strong>{meal.name}</strong>
                                <span>{meal.calories} kcal · {meal.protein}g protein</span>
                            </div>
                        </div>

                        <form className="recipe-planner-form" onSubmit={handlePlannerSubmit}>
                            <label>
                                Day
                                <select name="day" value={plannerSelection.day} onChange={handlePlannerChange}>
                                    {weekDays.map((day) => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Meal slot
                                <select name="slot" value={plannerSelection.slot} onChange={handlePlannerChange}>
                                    {mealSlots.map((slot) => (
                                        <option key={slot} value={slot}>
                                            {slot.charAt(0) + slot.slice(1).toLowerCase()}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <p className="recipe-planner-help">
                                If this slot already contains a catalog meal, it will be replaced and the
                                daily calorie and protein totals will be adjusted.
                            </p>

                            {plannerMessage.text && (
                                <p className={`recipe-planner-message ${plannerMessage.type}`}>
                                    {plannerMessage.text}
                                </p>
                            )}

                            <div className="recipe-planner-dialog-actions">
                                {plannerMessage.type === "success" && (
                                    <Link to="/planner">Open Planner</Link>
                                )}
                                <button type="submit" disabled={plannerSaving}>
                                    {plannerSaving ? "Adding..." : "Add to Planner"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}
