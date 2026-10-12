export default function AiPicksPage({ view }) {
    const {
        generateRecommendations, handleRecommendationChange, recommendationError, recommendationForm, recommendationLoading, recommendations
    } = view;
    return (
        <main className="main-content route-page">
<section className="ai-section" id="ai-section">
    <div className="ai-copy">
        <span>AI-powered planning</span>
        <h2>AI Meal Recommendations</h2>
        <p>
            Choose your goal and nutrition targets to generate meal ideas
            from the FitMeal backend.
        </p>
    </div>

    <div className="ai-controls">
        <select
            name="goal"
            value={recommendationForm.goal}
            onChange={handleRecommendationChange}
        >
            <option value="Weight Loss">Weight Loss</option>
            <option value="Muscle Gain">Muscle Gain</option>
            <option value="Maintenance">Maintenance</option>
            <option value="High Protein">High Protein</option>
        </select>

        <input
            type="number"
            name="calories"
            placeholder="Calories target"
            value={recommendationForm.calories}
            onChange={handleRecommendationChange}
        />

        <input
            type="number"
            name="proteinTarget"
            placeholder="Protein target"
            value={recommendationForm.proteinTarget}
            onChange={handleRecommendationChange}
        />

        <button
            className={recommendationLoading ? "loading-button" : ""}
            onClick={generateRecommendations}
            disabled={recommendationLoading}
        >
            {recommendationLoading
                ? "Generating..."
                : "Generate Recommendations"}
        </button>
    </div>

    {recommendationError && (
        <p className="recommendation-error">{recommendationError}</p>
    )}

    <div className="recommendation-grid">
        {recommendations.map((meal) => (
            <div
                className="recommendation-card"
                key={meal.id || meal.name}
            >
                <div>
                    <span className="ai-badge">AI Pick</span>
                    <h3>{meal.name}</h3>
                </div>

                <div className="recommendation-metrics">
                    <p>
                        <strong>{meal.calories}</strong>
                        Calories
                    </p>
                    <p>
                        <strong>{meal.protein}g</strong>
                        Protein
                    </p>
                </div>

                <div className="tag-row">
                    {(meal.tags || []).map((tag) => (
                        <span key={tag}>{tag}</span>
                    ))}
                </div>
            </div>
        ))}
    </div>
</section>
        </main>
    );
}
