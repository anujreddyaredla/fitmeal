export default function AiCoachPage({ view }) {
    const {
        clearCoachChat, coachError, coachInput, coachLoading, coachMessages, coachMessagesEndRef, coachQuickPrompts, dailyCalorieGoal, dailyProteinGoal, handleCoachKeyDown, profileForm, sendCoachMessage, setCoachInput
    } = view;
    return (
        <main className="main-content route-page">
<section className="ai-coach-section" id="ai-coach-section">
    <div className="ai-coach-header">
        <div>
            <span>Conversational nutrition coach</span>
            <h2>AI Coach</h2>
            <p>
                Ask FitMeal about meals, calories, protein, snacks,
                substitutions, groceries, hydration, and workout nutrition.
            </p>
        </div>

        <button type="button" onClick={clearCoachChat}>
            Clear Chat
        </button>
    </div>

    <div className="coach-profile-strip">
        <div>
            <span>Fitness Goal</span>
            <strong>{profileForm.fitnessGoal || "Maintenance"}</strong>
        </div>
        <div>
            <span>Calories</span>
            <strong>{dailyCalorieGoal || 0} cal</strong>
        </div>
        <div>
            <span>Protein</span>
            <strong>{dailyProteinGoal || 0}g</strong>
        </div>
        <div>
            <span>Body</span>
            <strong>{profileForm.weight || 0}kg / {profileForm.height || 0}cm</strong>
        </div>
    </div>

    <div className="coach-quick-prompts">
        {coachQuickPrompts.map((prompt) => (
            <button
                type="button"
                key={prompt}
                onClick={() => sendCoachMessage(prompt)}
                disabled={coachLoading}
            >
                {prompt}
            </button>
        ))}
    </div>

    <div className="coach-chat-window">
        {coachMessages.map((message, index) => (
            <div
                className={`coach-message-row ${
                    message.role === "user" ? "user-message-row" : "ai-message-row"
                }`}
                key={`${message.role}-${index}`}
            >
                <div className="coach-message-card">
                    <p>{message.content}</p>

                    {message.suggestions?.length > 0 && (
                        <div className="coach-rich-block">
                            <span>Suggestions</span>
                            <ul>
                                {message.suggestions.map((suggestion) => (
                                    <li key={suggestion}>{suggestion}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {message.tips?.length > 0 && (
                        <div className="coach-rich-block tips-block">
                            <span>Tips</span>
                            <ul>
                                {message.tips.map((tip) => (
                                    <li key={tip}>{tip}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        ))}

        {coachLoading && (
            <div className="coach-message-row ai-message-row">
                <div className="coach-message-card typing-card">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        )}

        <div ref={coachMessagesEndRef}></div>
    </div>

    {coachError && <p className="coach-error">{coachError}</p>}

    <div className="coach-input-row">
        <textarea
            value={coachInput}
            onChange={(event) => setCoachInput(event.target.value)}
            onKeyDown={handleCoachKeyDown}
            placeholder="Ask your AI Coach about meals, protein, snacks, groceries, or hydration..."
            rows="2"
        ></textarea>
        <button
            type="button"
            onClick={() => sendCoachMessage()}
            disabled={coachLoading || !coachInput.trim()}
        >
            {coachLoading ? "Thinking..." : "Send"}
        </button>
    </div>
</section>
        </main>
    );
}
