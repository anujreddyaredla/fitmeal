export default function AiPlannerPage({ view }) {
    const {
        generatedWeeklyPlan, generateWeeklyPlan, handleWeeklyPlannerChange, saveGeneratedWeeklyPlan, weeklyPlannerError, weeklyPlannerForm, weeklyPlannerLoading, weeklyPlannerMessage, weeklyPlannerSaving
    } = view;
    return (
        <main className="main-content route-page">
<section className="ai-weekly-section" id="ai-weekly-section">
    <div className="ai-weekly-header">
        <div>
            <span>AI weekly planner</span>
            <h2>Generate a 7-Day Meal Plan</h2>
            <p>
                Use your nutrition targets and dietary preference to build a
                Monday to Sunday plan from the FitMeal AI recommendations API.
            </p>
        </div>

        <button
            type="button"
            onClick={saveGeneratedWeeklyPlan}
            disabled={weeklyPlannerSaving || !generatedWeeklyPlan.length}
        >
            {weeklyPlannerSaving ? "Saving..." : "Save to Planner"}
        </button>
    </div>

    <div className="ai-weekly-controls">
        <select
            name="goal"
            value={weeklyPlannerForm.goal}
            onChange={handleWeeklyPlannerChange}
        >
            <option value="Weight Loss">Weight Loss</option>
            <option value="Muscle Gain">Muscle Gain</option>
            <option value="Maintenance">Maintenance</option>
            <option value="High Protein">High Protein</option>
        </select>

        <input
            type="number"
            name="calories"
            placeholder="Daily calories"
            value={weeklyPlannerForm.calories}
            onChange={handleWeeklyPlannerChange}
        />

        <input
            type="number"
            name="proteinTarget"
            placeholder="Protein target"
            value={weeklyPlannerForm.proteinTarget}
            onChange={handleWeeklyPlannerChange}
        />

        <select
            name="dietaryPreference"
            value={weeklyPlannerForm.dietaryPreference}
            onChange={handleWeeklyPlannerChange}
        >
            <option value="Balanced">Balanced</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="High Protein">High Protein</option>
            <option value="Low Carb">Low Carb</option>
            <option value="Indian Style">Indian Style</option>
            <option value="Non-Veg">Non-Veg</option>
        </select>

        <button
            type="button"
            className={weeklyPlannerLoading ? "loading-button" : ""}
            onClick={generateWeeklyPlan}
            disabled={weeklyPlannerLoading}
        >
            {weeklyPlannerLoading
                ? "Generating..."
                : "Generate Weekly Plan"}
        </button>
    </div>

    {weeklyPlannerError && (
        <p className="recommendation-error">{weeklyPlannerError}</p>
    )}

    {weeklyPlannerMessage && (
        <p className="weekly-planner-message">{weeklyPlannerMessage}</p>
    )}

    <div className="ai-weekly-grid">
        {generatedWeeklyPlan.map((plan) => (
            <div className="ai-weekly-card" key={plan.day}>
                <div className="ai-weekly-card-top">
                    <span>{plan.day}</span>
                    <div className="macro-badges">
                        <strong>{plan.totalCalories} cal</strong>
                        <strong>{plan.totalProtein}g protein</strong>
                    </div>
                </div>

                <div className="ai-weekly-meals">
                    <p>
                        <span>Breakfast</span>
                        {plan.breakfast}
                    </p>
                    <p>
                        <span>Lunch</span>
                        {plan.lunch}
                    </p>
                    <p>
                        <span>Dinner</span>
                        {plan.dinner}
                    </p>
                    <p>
                        <span>Snack</span>
                        {plan.snack}
                    </p>
                </div>

                <div className="tag-row">
                    {(plan.tags || []).map((tag) => (
                        <span key={`${plan.day}-${tag}`}>{tag}</span>
                    ))}
                </div>
            </div>
        ))}
    </div>
</section>
        </main>
    );
}
