export default function ProfilePage({ view }) {
    const {
        bmi, handleGenderSelect, handleProfileChange, handleProfileSubmit, profileForm, profileMessage
    } = view;
    return (
        <main className="main-content route-page">
<section className="panel profile-section" id="profile-section">
    <div className="profile-top">
        <div className="section-heading">
            <span>Your goals</span>
            <h2>Profile Dashboard</h2>
        </div>

        {profileMessage && (
            <p className="profile-message">{profileMessage}</p>
        )}
    </div>

    <div className="profile-card-grid">
        <div className="profile-goal-card">
            <span>Daily Calories Goal</span>
            <strong>{profileForm.dailyCalorieGoal || 0}</strong>
        </div>
        <div className="profile-goal-card">
            <span>Daily Protein Goal</span>
            <strong>{profileForm.dailyProteinGoal || 0}g</strong>
        </div>
        <div className="profile-goal-card">
            <span>Water Goal</span>
            <strong>{profileForm.waterGoal || 0} ml</strong>
        </div>
        <div className="profile-goal-card">
            <span>Current Streak</span>
            <strong>{profileForm.currentStreak || 0} days</strong>
        </div>
        <div className="profile-goal-card bmi-card">
            <span>BMI</span>
            <strong>{bmi}</strong>
        </div>
    </div>

    <form className="profile-form" onSubmit={handleProfileSubmit}>
        <input
            type="number"
            name="age"
            placeholder="Age"
            value={profileForm.age}
            onChange={handleProfileChange}
        />

        <input
            type="number"
            name="height"
            placeholder="Height (cm)"
            value={profileForm.height}
            onChange={handleProfileChange}
        />

        <input
            type="number"
            name="weight"
            placeholder="Weight (kg)"
            value={profileForm.weight}
            onChange={handleProfileChange}
        />

        <div className="gender-control" aria-label="Gender">
            <button
                type="button"
                className={profileForm.gender === "Male" ? "active" : ""}
                onClick={() => handleGenderSelect("Male")}
            >
                Male
            </button>
            <button
                type="button"
                className={profileForm.gender === "Female" ? "active" : ""}
                onClick={() => handleGenderSelect("Female")}
            >
                Female
            </button>
        </div>

        <select
            name="fitnessGoal"
            value={profileForm.fitnessGoal}
            onChange={handleProfileChange}
        >
            <option value="Weight Loss">Weight Loss</option>
            <option value="Muscle Gain">Muscle Gain</option>
            <option value="Maintenance">Maintenance</option>
            <option value="High Protein">High Protein</option>
        </select>

        <p className="profile-helper">
            Goals are estimated from your profile and can be adjusted
            manually.
        </p>

        <input
            type="number"
            name="dailyCalorieGoal"
            placeholder="Daily Calorie Goal"
            value={profileForm.dailyCalorieGoal}
            onChange={handleProfileChange}
        />

        <input
            type="number"
            name="dailyProteinGoal"
            placeholder="Daily Protein Goal"
            value={profileForm.dailyProteinGoal}
            onChange={handleProfileChange}
        />

        <input
            type="number"
            name="waterGoal"
            placeholder="Water Goal (ml)"
            value={profileForm.waterGoal}
            onChange={handleProfileChange}
        />

        <input
            type="number"
            name="currentStreak"
            placeholder="Current Streak"
            value={profileForm.currentStreak}
            onChange={handleProfileChange}
        />

        <button type="submit">Save Profile</button>
    </form>
</section>
        </main>
    );
}
