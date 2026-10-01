import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

function ProgressSection({
    currentWeight,
    startingWeight,
    totalWeightChange,
    bmi,
    sevenDayAverageCalories,
    sevenDayAverageProtein,
    sevenDayAverageCompletion,
    editingWeightEntryId,
    weightForm,
    handleWeightSubmit,
    handleWeightChange,
    cancelWeightEdit,
    weightError,
    weightMessage,
    recentWeightEntries,
    editWeightEntry,
    deleteWeightEntry,
    weightTrendData,
    hasNutritionTrendData,
    sevenDayNutritionData,
}) {
    return (                        <section className="progress-section" id="progress-section">
                            <div className="progress-header">
                                <div>
                                    <span>Progress analytics</span>
                                    <h2>Progress Dashboard</h2>
                                    <p>
                                        Track weight changes, nutrition trends, and daily goal
                                        completion from your FitMeal profile and planner data.
                                    </p>
                                </div>
                            </div>

                            <div className="progress-summary-grid">
                                <div className="progress-summary-card">
                                    <span>Current Weight</span>
                                    <strong>{currentWeight || 0} kg</strong>
                                </div>
                                <div className="progress-summary-card">
                                    <span>Starting Weight</span>
                                    <strong>{startingWeight || 0} kg</strong>
                                </div>
                                <div className="progress-summary-card">
                                    <span>Total Weight Change</span>
                                    <strong>{totalWeightChange > 0 ? `+${totalWeightChange}` : totalWeightChange} kg</strong>
                                </div>
                                <div className="progress-summary-card">
                                    <span>Current BMI</span>
                                    <strong>{bmi}</strong>
                                </div>
                                <div className="progress-summary-card">
                                    <span>Avg Calories / 7 Days</span>
                                    <strong>{sevenDayAverageCalories}</strong>
                                </div>
                                <div className="progress-summary-card">
                                    <span>Avg Protein / 7 Days</span>
                                    <strong>{sevenDayAverageProtein}g</strong>
                                </div>
                                <div className="progress-summary-card completion-summary-card">
                                    <span>Goal Completion</span>
                                    <strong>{sevenDayAverageCompletion}%</strong>
                                </div>
                            </div>

                            <div className="progress-workspace">
                                <div className="weight-entry-panel">
                                    <div className="section-heading">
                                        <span>Weight tracking</span>
                                        <h2>{editingWeightEntryId ? "Edit Weight Entry" : "Add Weight Entry"}</h2>
                                    </div>

                                    <form className="weight-form" onSubmit={handleWeightSubmit}>
                                        <input
                                            type="number"
                                            step="0.1"
                                            name="weight"
                                            placeholder="Weight (kg)"
                                            value={weightForm.weight}
                                            onChange={handleWeightChange}
                                        />
                                        <input
                                            type="date"
                                            name="recordedDate"
                                            value={weightForm.recordedDate}
                                            onChange={handleWeightChange}
                                        />
                                        <button type="submit">
                                            {editingWeightEntryId ? "Update Entry" : "Add Entry"}
                                        </button>
                                        {editingWeightEntryId && (
                                            <button type="button" className="cancel-weight-button" onClick={cancelWeightEdit}>
                                                Cancel
                                            </button>
                                        )}
                                    </form>

                                    {weightError && <p className="weight-error">{weightError}</p>}
                                    {weightMessage && <p className="weight-message">{weightMessage}</p>}

                                    <div className="weight-history-table">
                                        <div className="weight-history-head">
                                            <span>Date</span>
                                            <span>Weight</span>
                                            <span>Actions</span>
                                        </div>

                                        {recentWeightEntries.length === 0 ? (
                                            <p className="progress-empty-state">No weight entries yet.</p>
                                        ) : (
                                            recentWeightEntries.map((entry) => (
                                                <div className="weight-history-row" key={entry.id}>
                                                    <span>{entry.recordedDate}</span>
                                                    <strong>{entry.weight} kg</strong>
                                                    <div>
                                                        <button type="button" onClick={() => editWeightEntry(entry)}>
                                                            Edit
                                                        </button>
                                                        <button type="button" onClick={() => deleteWeightEntry(entry.id)}>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="progress-chart-grid">
                                    <div className="progress-chart-card large-chart-card">
                                        <div className="chart-heading">
                                            <span>Weight Trend</span>
                                            <strong>Line Chart</strong>
                                        </div>
                                        {weightTrendData.length === 0 ? (
                                            <p className="progress-empty-state">Add weight entries to see your trend.</p>
                                        ) : (
                                            <ResponsiveContainer width="100%" height={280}>
                                                <LineChart data={weightTrendData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(32, 91, 55, 0.12)" />
                                                    <XAxis dataKey="label" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Line type="monotone" dataKey="weight" stroke="#198754" strokeWidth={3} dot={{ r: 5 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>

                                    <div className="progress-chart-card">
                                        <div className="chart-heading">
                                            <span>Daily Calories</span>
                                            <strong>Last 7 Days</strong>
                                        </div>
                                        {!hasNutritionTrendData ? (
                                            <p className="progress-empty-state">Add meals or planner totals to see calorie trends.</p>
                                        ) : (
                                            <ResponsiveContainer width="100%" height={240}>
                                                <BarChart data={sevenDayNutritionData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(32, 91, 55, 0.12)" />
                                                    <XAxis dataKey="label" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar dataKey="calories" fill="#22a35a" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>

                                    <div className="progress-chart-card">
                                        <div className="chart-heading">
                                            <span>Daily Protein</span>
                                            <strong>Last 7 Days</strong>
                                        </div>
                                        {!hasNutritionTrendData ? (
                                            <p className="progress-empty-state">Add meals or planner totals to see protein trends.</p>
                                        ) : (
                                            <ResponsiveContainer width="100%" height={240}>
                                                <BarChart data={sevenDayNutritionData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(32, 91, 55, 0.12)" />
                                                    <XAxis dataKey="label" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar dataKey="protein" fill="#7ac943" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>

                                    <div className="progress-chart-card large-chart-card">
                                        <div className="chart-heading">
                                            <span>Goal Completion</span>
                                            <strong>Calories + Protein</strong>
                                        </div>
                                        {!hasNutritionTrendData ? (
                                            <p className="progress-empty-state">Set goals and log meals to see completion.</p>
                                        ) : (
                                            <ResponsiveContainer width="100%" height={260}>
                                                <LineChart data={sevenDayNutritionData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(32, 91, 55, 0.12)" />
                                                    <XAxis dataKey="label" />
                                                    <YAxis domain={[0, 100]} />
                                                    <Tooltip />
                                                    <Line type="monotone" dataKey="completion" stroke="#0f6b3a" strokeWidth={3} dot={{ r: 5 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
    );
}

export default ProgressSection;
