import { lazy, Suspense } from "react";
import FitMealSectionLoader from "../components/FitMealSectionLoader";

const ProgressSection = lazy(() => import("../components/ProgressSection"));

export default function DashboardPage({ view }) {
    const {
        bmi, caloriesProgress, caloriesRemaining, cancelWeightEdit, currentWeight, dailyCalorieGoal, dailyProteinGoal, deleteWeightEntry, editingWeightEntryId, editWeightEntry, goalCompletion, handleWeightChange, handleWeightSubmit, hasNutritionTrendData, logoPath, plannedMealsCount, proteinProgress, proteinRemaining, recentWeightEntries, scrollToSection, sevenDayAverageCalories, sevenDayAverageCompletion, sevenDayAverageProtein, sevenDayNutritionData, startingWeight, totalCalories, totalMeals, totalProtein, totalWeightChange, waterGoal, waterProgress, weeklyAverageCalories, weeklyAverageProtein, weightError, weightForm, weightMessage, weightTrendData
    } = view;
    return (
        <>
                    <section className="hero" id="top">
<div className="hero-content">
    <span className="hero-label">Premium nutrition workspace</span>
    <div className="hero-title-row brand-section">
        <img className="logo" src={logoPath} alt="FitMeal logo" />
        <h1>Smart Nutrition & Meal Planning</h1>
    </div>
    <p>
        Track meals, protein, calories, and healthy habits in one place.
    </p>

    <div className="hero-actions">
        <button onClick={() => scrollToSection("meal-form-section")}>
            Add Meal
        </button>
        <button
            className="secondary-button"
            onClick={() => scrollToSection("ai-section")}
        >
            AI Recommendations
        </button>
    </div>
</div>

<div className="hero-panel">
    <div className="hero-meal-card">
        <span>Today</span>
        <h2>Balanced chicken bowl</h2>
        <p>650 calories</p>
    </div>
    <div className="hero-stat-row">
        <div>
            <strong>40g</strong>
            <span>Protein</span>
        </div>
        <div>
            <strong>3</strong>
            <span>Meals planned</span>
        </div>
    </div>
</div>
                    </section>
            <main className="main-content route-page">
<section className="dashboard analytics-dashboard" id="dashboard-section">
    <div className="dashboard-card analytics-hero-card">
        <span className="analytics-label">Today</span>
        <h3>Goal Completion</h3>
        <p>{goalCompletion}%</p>
        <div className="progress-track">
            <div
                className="progress-fill"
                style={{ width: `${goalCompletion}%` }}
            ></div>
        </div>
    </div>

    <div className="dashboard-card analytics-card">
        <h3>Calories Consumed</h3>
        <p>{totalCalories}</p>
        <span>{caloriesRemaining} remaining</span>
    </div>

    <div className="dashboard-card analytics-card">
        <h3>Protein Consumed</h3>
        <p>{totalProtein}g</p>
        <span>{proteinRemaining}g remaining</span>
    </div>

    <div className="dashboard-card analytics-card">
        <h3>Total Meals Today</h3>
        <p>{totalMeals}</p>
        <span>From current meal list</span>
    </div>

    <div className="dashboard-card progress-card">
        <div className="progress-card-top">
            <h3>Calories Progress</h3>
            <strong>{caloriesProgress}%</strong>
        </div>
        <div className="progress-track">
            <div
                className="progress-fill"
                style={{ width: `${caloriesProgress}%` }}
            ></div>
        </div>
        <span>{totalCalories} / {dailyCalorieGoal || 0} cal</span>
    </div>

    <div className="dashboard-card progress-card">
        <div className="progress-card-top">
            <h3>Protein Progress</h3>
            <strong>{proteinProgress}%</strong>
        </div>
        <div className="progress-track">
            <div
                className="progress-fill protein-fill"
                style={{ width: `${proteinProgress}%` }}
            ></div>
        </div>
        <span>{totalProtein} / {dailyProteinGoal || 0}g</span>
    </div>

    <div className="dashboard-card progress-card">
        <div className="progress-card-top">
            <h3>Water Progress</h3>
            <strong>{waterProgress}%</strong>
        </div>
        <div className="progress-track">
            <div
                className="progress-fill water-fill"
                style={{ width: `${waterProgress}%` }}
            ></div>
        </div>
        <span>Goal: {waterGoal || 0} ml</span>
    </div>

    <div className="dashboard-card weekly-summary-card">
        <h3>Weekly Summary</h3>
        <div className="weekly-summary-grid">
            <div>
                <strong>{weeklyAverageCalories}</strong>
                <span>Avg calories</span>
            </div>
            <div>
                <strong>{weeklyAverageProtein}g</strong>
                <span>Avg protein</span>
            </div>
            <div>
                <strong>{plannedMealsCount}</strong>
                <span>Planned meals</span>
            </div>
        </div>
    </div>
</section>

<Suspense fallback={<FitMealSectionLoader label="Loading Progress Analytics..." />}>
    <ProgressSection
        currentWeight={currentWeight}
        startingWeight={startingWeight}
        totalWeightChange={totalWeightChange}
        bmi={bmi}
        sevenDayAverageCalories={sevenDayAverageCalories}
        sevenDayAverageProtein={sevenDayAverageProtein}
        sevenDayAverageCompletion={sevenDayAverageCompletion}
        editingWeightEntryId={editingWeightEntryId}
        weightForm={weightForm}
        handleWeightSubmit={handleWeightSubmit}
        handleWeightChange={handleWeightChange}
        cancelWeightEdit={cancelWeightEdit}
        weightError={weightError}
        weightMessage={weightMessage}
        recentWeightEntries={recentWeightEntries}
        editWeightEntry={editWeightEntry}
        deleteWeightEntry={deleteWeightEntry}
        weightTrendData={weightTrendData}
        hasNutritionTrendData={hasNutritionTrendData}
        sevenDayNutritionData={sevenDayNutritionData}
    />
</Suspense>
            </main>
        </>
    );
}
