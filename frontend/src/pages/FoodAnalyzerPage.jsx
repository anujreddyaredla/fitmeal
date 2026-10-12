export default function FoodAnalyzerPage({ view }) {
    const {
        analyzeFoodImage, foodAnalysis, foodAnalyzerError, foodAnalyzerLoading, foodAnalyzerMessage, foodImagePreview, handleFoodDrop, handleFoodImageInputChange, removeFoodImage, saveFoodAnalysisAsMeal
    } = view;
    return (
        <main className="main-content route-page">
<section className="food-analyzer-section" id="food-analyzer-section">
    <div className="food-analyzer-header">
        <div>
            <span>AI food vision</span>
            <h2>Food Image Analyzer</h2>
            <p>
                Upload a meal photo to estimate calories, protein, carbs,
                fat, serving size, and healthier alternatives.
            </p>
        </div>
    </div>

    <div className="food-analyzer-layout">
        <div
            className={`food-upload-card ${foodImagePreview ? "has-preview" : ""}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleFoodDrop}
        >
            {!foodImagePreview ? (
                <>
                    <div className="upload-icon">+</div>
                    <h3>Drag & drop a food image</h3>
                    <p>Supports JPG, JPEG, and PNG files.</p>
                    <label className="browse-image-button">
                        Browse Image
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={handleFoodImageInputChange}
                        />
                    </label>
                </>
            ) : (
                <div className="food-preview-wrap">
                    <img src={foodImagePreview} alt="Selected food preview" />
                    <div className="food-preview-actions">
                        <button type="button" onClick={analyzeFoodImage} disabled={foodAnalyzerLoading}>
                            {foodAnalyzerLoading ? "Analyzing..." : "Analyze Food"}
                        </button>
                        <button type="button" className="remove-image-button" onClick={removeFoodImage}>
                            Remove Image
                        </button>
                    </div>
                </div>
            )}
        </div>

        <div className="food-result-card">
            {foodAnalyzerLoading && (
                <div className="food-loading-state">
                    <div className="food-loading-ring"></div>
                    <h3>Analyzing your plate...</h3>
                    <p>Estimating nutrition from the image.</p>
                </div>
            )}

            {!foodAnalyzerLoading && !foodAnalysis && (
                <div className="food-empty-state">
                    <span>Nutrition estimate</span>
                    <h3>Your analysis will appear here</h3>
                    <p>
                        For best results, use a clear image with the whole
                        plate visible.
                    </p>
                </div>
            )}

            {!foodAnalyzerLoading && foodAnalysis && (
                <div className="food-analysis-content">
                    <div className="food-result-top">
                        <div>
                            <span>Detected food</span>
                            <h3>{foodAnalysis.foodName}</h3>
                            <p>{foodAnalysis.servingSize}</p>
                        </div>
                        <strong>{foodAnalysis.confidence} confidence</strong>
                    </div>

                    <div className="food-macro-grid">
                        <div>
                            <span>Calories</span>
                            <strong>{foodAnalysis.estimatedCalories}</strong>
                        </div>
                        <div>
                            <span>Protein</span>
                            <strong>{foodAnalysis.protein}g</strong>
                        </div>
                        <div>
                            <span>Carbs</span>
                            <strong>{foodAnalysis.carbs}g</strong>
                        </div>
                        <div>
                            <span>Fat</span>
                            <strong>{foodAnalysis.fat}g</strong>
                        </div>
                    </div>

                    <div className="food-advice-grid">
                        <div>
                            <span>Healthy Tips</span>
                            <ul>
                                {(foodAnalysis.healthyTips || []).map((tip) => (
                                    <li key={tip}>{tip}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <span>Suggested Alternatives</span>
                            <ul>
                                {(foodAnalysis.suggestedAlternatives || []).map((alternative) => (
                                    <li key={alternative}>{alternative}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="save-analysis-button"
                        onClick={saveFoodAnalysisAsMeal}
                    >
                        Save As Meal
                    </button>
                </div>
            )}

            {foodAnalyzerError && <p className="food-analyzer-error">{foodAnalyzerError}</p>}
            {foodAnalyzerMessage && <p className="food-analyzer-message">{foodAnalyzerMessage}</p>}
        </div>
    </div>
</section>
        </main>
    );
}
