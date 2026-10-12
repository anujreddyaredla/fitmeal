import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CatalogMealImage from "../components/CatalogMealImage";
import useMealCatalog from "../hooks/useMealCatalog";
import "./MealLibraryPage.css";

const categories = [
    {
        value: "ALL",
        label: "All Meals",
        description: "Explore the complete healthy catalog",
        className: "all-meals",
    },
    {
        value: "BREAKFAST",
        label: "Breakfast",
        description: "Balanced starts for busy mornings",
        className: "breakfast",
    },
    {
        value: "LUNCH",
        label: "Lunch",
        description: "Energizing bowls, salads, and wraps",
        className: "lunch",
    },
    {
        value: "SNACK",
        label: "Snack",
        description: "Quick protein and fiber-rich choices",
        className: "snack",
    },
    {
        value: "DINNER",
        label: "Dinner",
        description: "Wholesome meals to finish the day",
        className: "dinner",
    },
];

function MealCatalogCard({ meal }) {
    return (
        <article className="catalog-meal-card">
            <div className="catalog-image-wrap">
                <CatalogMealImage meal={meal} />
                <span className="catalog-category-badge">{meal.category}</span>
            </div>

            <div className="catalog-card-body">
                <div className="catalog-card-heading">
                    <div>
                        <h3>{meal.name}</h3>
                        <p>{meal.description}</p>
                    </div>
                    <span className="catalog-time">
                        {meal.prepMinutes + meal.cookMinutes} min
                    </span>
                </div>

                <div className="catalog-nutrition-grid">
                    <div>
                        <strong>{meal.calories}</strong>
                        <span>kcal</span>
                    </div>
                    <div>
                        <strong>{meal.protein}g</strong>
                        <span>Protein</span>
                    </div>
                    <div>
                        <strong>{meal.carbohydrates}g</strong>
                        <span>Carbs</span>
                    </div>
                    <div>
                        <strong>{meal.fiber}g</strong>
                        <span>Fiber</span>
                    </div>
                </div>

                <div className="catalog-tag-row">
                    {meal.dietaryTags.slice(0, 3).map((tag) => (
                        <span key={tag}>{tag}</span>
                    ))}
                </div>

                <Link className="catalog-view-recipe" to={`/meal-library/${meal.slug}`}>
                    View recipe
                </Link>
            </div>
        </article>
    );
}

export default function MealLibraryPage({ onSessionExpired }) {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, 300);

        return () => window.clearTimeout(timer);
    }, [searchInput]);

    const { meals, loading, error } = useMealCatalog({
        category: selectedCategory,
        search: debouncedSearch,
        onUnauthorized: onSessionExpired,
    });

    const suggestions = useMemo(() => meals.slice(0, 6), [meals]);
    const selectedCategoryLabel = categories.find(
        (category) => category.value === selectedCategory
    )?.label;
    const showSuggestions = searchFocused && searchInput.trim() && !loading;

    const chooseSuggestion = (mealName) => {
        const selectedMeal = suggestions.find((meal) => meal.name === mealName);
        setSearchFocused(false);

        if (selectedMeal) {
            navigate(`/meal-library/${selectedMeal.slug}`);
        }
    };

    return (
        <main className="main-content route-page meal-library-page">
            <header className="meal-library-header">
                <div>
                    <span className="meal-library-eyebrow">FitMeal recipe catalog</span>
                    <h1>Discover your next healthy meal</h1>
                    <p>
                        Browse balanced recipes with estimated nutrition and practical cooking
                        times. Open any meal for beginner-friendly cooking steps and planner actions.
                    </p>
                </div>
                <div className="catalog-count-block">
                    <strong>{loading ? "--" : meals.length}</strong>
                    <span>{selectedCategoryLabel}</span>
                </div>
            </header>

            <section className="catalog-search-section" aria-label="Search meal catalog">
                <div className="catalog-search-wrap">
                    <label htmlFor="meal-catalog-search">Search healthy meals</label>
                    <div className="catalog-search-control">
                        <input
                            id="meal-catalog-search"
                            type="search"
                            placeholder="Try chicken, berries, tofu, or rice"
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
                            autoComplete="off"
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchInput("");
                                    setDebouncedSearch("");
                                }}
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {showSuggestions && (
                        <div className="catalog-suggestions" role="listbox">
                            {suggestions.length > 0 ? (
                                suggestions.map((meal) => (
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected="false"
                                        key={meal.id}
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => chooseSuggestion(meal.name)}
                                    >
                                        <span>{meal.name}</span>
                                        <small>
                                            {meal.category} · {meal.calories} kcal · {meal.protein}g
                                            protein
                                        </small>
                                    </button>
                                ))
                            ) : (
                                <p>No matching meals found</p>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <section className="catalog-category-section" aria-labelledby="catalog-categories-title">
                <div className="catalog-section-heading">
                    <div>
                        <span>Browse by meal type</span>
                        <h2 id="catalog-categories-title">Meal categories</h2>
                    </div>
                </div>

                <div className="catalog-category-grid">
                    {categories.map((category) => (
                        <button
                            type="button"
                            className={`catalog-category-card ${category.className} ${
                                selectedCategory === category.value ? "active" : ""
                            }`}
                            key={category.value}
                            onClick={() => setSelectedCategory(category.value)}
                            aria-pressed={selectedCategory === category.value}
                        >
                            <span>{category.label}</span>
                            <small>{category.description}</small>
                        </button>
                    ))}
                </div>
            </section>

            <section className="catalog-results-section" aria-live="polite">
                <div className="catalog-section-heading catalog-results-heading">
                    <div>
                        <span>{debouncedSearch ? `Results for “${debouncedSearch}”` : "Curated recipes"}</span>
                        <h2>{selectedCategoryLabel}</h2>
                    </div>
                    {!loading && !error && <strong>{meals.length} meals</strong>}
                </div>

                {loading && (
                    <div className="catalog-loading-state">
                        <div className="fitmeal-loader-ring"></div>
                        <p>Loading healthy meals...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="catalog-message-state error">
                        <h3>Meal catalog unavailable</h3>
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && meals.length === 0 && (
                    <div className="catalog-message-state">
                        <h3>No meals match your search</h3>
                        <p>Try a shorter search or choose another meal category.</p>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchInput("");
                                setDebouncedSearch("");
                                setSelectedCategory("ALL");
                            }}
                        >
                            View all meals
                        </button>
                    </div>
                )}

                {!loading && !error && meals.length > 0 && (
                    <div className="catalog-meal-grid">
                        {meals.map((meal) => (
                            <MealCatalogCard meal={meal} key={meal.id} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
