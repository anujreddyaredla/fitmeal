import { lazy, Suspense, useEffect, useRef, useState } from "react";
import "./App.css";

const ProgressSection = lazy(() => import("./components/ProgressSection"));

function FitMealSectionLoader({ label }) {
    return (
        <section className="fitmeal-section-loader">
            <div className="fitmeal-loader-ring"></div>
            <p>{label || "Loading FitMeal section..."}</p>
        </section>
    );
}

function getSavedUser() {
    try {
        return JSON.parse(localStorage.getItem("fitMealUser") || "null");
    } catch {
        localStorage.removeItem("fitMealUser");
        return null;
    }
}

function getSavedToken() {
    return localStorage.getItem("fitMealToken");
}

function getSavedCoachMessages() {
    try {
        const savedMessages = JSON.parse(localStorage.getItem("fitMealCoachMessages") || "null");

        if (Array.isArray(savedMessages) && savedMessages.length > 0) {
            return savedMessages;
        }
    } catch {
        localStorage.removeItem("fitMealCoachMessages");
    }

    return [
        {
            role: "ai",
            content:
                "Hi, I am your FitMeal AI Coach. Ask me for meal ideas, protein tips, grocery suggestions, calories estimates, or workout nutrition help.",
            suggestions: ["Plan today's meals", "Suggest breakfast", "High protein snacks"],
            tips: ["Complete your profile goals for more personalized coaching."],
        },
    ];
}

function App() {
    const logoPath = "/images/fitmeal-logo.png";
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const savedUser = getSavedUser();
    const savedToken = getSavedToken();
    const [currentUser, setCurrentUser] = useState(savedUser);
    const [authToken, setAuthToken] = useState(savedToken);
    const [loggedIn, setLoggedIn] = useState(savedUser !== null && savedToken !== null);
    const [authMode, setAuthMode] = useState("login");
    const [authError, setAuthError] = useState("");
    const [authSuccess, setAuthSuccess] = useState("");
    const [authLoading, setAuthLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [authData, setAuthData] = useState({
        usernameOrPhone: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        verificationToken: "",
        resetToken: "",
        newPassword: "",
    });

    const [meals, setMeals] = useState([]);
    const [mealPlans, setMealPlans] = useState([]);
    const [editingMealPlanId, setEditingMealPlanId] = useState(null);
    const [mealPlanForm, setMealPlanForm] = useState({
        day: "Monday",
        breakfast: "",
        lunch: "",
        dinner: "",
        snack: "",
        totalCalories: "",
        totalProtein: "",
    });
    const [weightEntries, setWeightEntries] = useState([]);
    const [editingWeightEntryId, setEditingWeightEntryId] = useState(null);
    const [weightForm, setWeightForm] = useState({
        weight: "",
        recordedDate: new Date().toISOString().slice(0, 10),
    });
    const [weightMessage, setWeightMessage] = useState("");
    const [weightError, setWeightError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMealType, setSelectedMealType] = useState("ALL");
    const [editingMealId, setEditingMealId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        mealType: "",
        calories: "",
        protein: "",
    });
    const [recommendationForm, setRecommendationForm] = useState({
        goal: "Weight Loss",
        calories: "",
        proteinTarget: "",
    });
    const [recommendations, setRecommendations] = useState([]);
    const [recommendationLoading, setRecommendationLoading] = useState(false);
    const [recommendationError, setRecommendationError] = useState("");
    const [weeklyPlannerForm, setWeeklyPlannerForm] = useState({
        goal: "Weight Loss",
        calories: "",
        proteinTarget: "",
        dietaryPreference: "Balanced",
    });
    const [generatedWeeklyPlan, setGeneratedWeeklyPlan] = useState([]);
    const [weeklyPlannerLoading, setWeeklyPlannerLoading] = useState(false);
    const [weeklyPlannerSaving, setWeeklyPlannerSaving] = useState(false);
    const [weeklyPlannerError, setWeeklyPlannerError] = useState("");
    const [weeklyPlannerMessage, setWeeklyPlannerMessage] = useState("");
    const [groceryItems, setGroceryItems] = useState([]);
    const [editingGroceryId, setEditingGroceryId] = useState(null);
    const [groceryForm, setGroceryForm] = useState({
        name: "",
        category: "Other",
        quantity: "",
        unit: "",
        purchased: false,
    });
    const [profileMessage, setProfileMessage] = useState("");
    const [profileForm, setProfileForm] = useState({
        age: "",
        height: "",
        weight: "",
        gender: "",
        fitnessGoal: "Maintenance",
        dailyCalorieGoal: "",
        dailyProteinGoal: "",
        waterGoal: "",
        currentStreak: "",
    });
    const [coachMessages, setCoachMessages] = useState(getSavedCoachMessages);
    const [coachInput, setCoachInput] = useState("");
    const [coachLoading, setCoachLoading] = useState(false);
    const [coachError, setCoachError] = useState("");
    const [foodImage, setFoodImage] = useState(null);
    const [foodImagePreview, setFoodImagePreview] = useState("");
    const [foodAnalysis, setFoodAnalysis] = useState(null);
    const [foodAnalyzerLoading, setFoodAnalyzerLoading] = useState(false);
    const [foodAnalyzerError, setFoodAnalyzerError] = useState("");
    const [foodAnalyzerMessage, setFoodAnalyzerMessage] = useState("");
    const coachMessagesEndRef = useRef(null);

    const getAuthHeaders = () => {
        const token = authToken || localStorage.getItem("fitMealToken") || "";

        return {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        };
    };

    const logout = (message = "") => {
        localStorage.removeItem("fitMealUser");
        localStorage.removeItem("fitMealToken");
        localStorage.removeItem("fitMealLoggedIn");
        setCurrentUser(null);
        setAuthToken(null);
        setLoggedIn(false);
        setAuthMode("login");
        setMeals([]);
        setMealPlans([]);
        setWeightEntries([]);
        setGroceryItems([]);
        setRecommendations([]);
        setCoachError("");
        setFoodImage(null);
        setFoodImagePreview("");
        setFoodAnalysis(null);
        setFoodAnalyzerError("");
        setFoodAnalyzerMessage("");
        setProfileMessage("");
        setAuthSuccess("");
        setAuthError(message);
    };

    const handleProtectedResponse = (response) => {
        if (response.status === 401 || response.status === 403) {
            logout("Session expired. Please login again.");
            throw new Error("Session expired");
        }

        if (!response.ok) {
            throw new Error("Request failed with status " + response.status);
        }

        return response;
    };

    const fetchMeals = (mealType = selectedMealType) => {
        const url =
            mealType === "ALL"
                ? `${API_BASE_URL}/api/meals`
                : `${API_BASE_URL}/api/meals/type/${mealType}`;

        fetch(url, {
            headers: getAuthHeaders(),
        })
            .then(handleProtectedResponse)
            .then((response) => response.json())
            .then((data) => setMeals(data))
            .catch((error) => console.error("Error fetching meals:", error));
    };

    const fetchMealPlans = () => {
        fetch(`${API_BASE_URL}/api/meal-plans`, {
            headers: getAuthHeaders(),
        })
            .then(handleProtectedResponse)
            .then((response) => response.json())
            .then((data) => setMealPlans(data))
            .catch((error) => console.error("Error fetching meal plans:", error));
    };

    const fetchWeightEntries = () => {
        fetch(`${API_BASE_URL}/api/weight-entries`, {
            headers: getAuthHeaders(),
        })
            .then(handleProtectedResponse)
            .then((response) => response.json())
            .then((data) => setWeightEntries(data))
            .catch((error) => console.error("Error fetching weight entries:", error));
    };
    const fetchGroceryList = () => {
        fetch(`${API_BASE_URL}/api/grocery-list`, {
            headers: getAuthHeaders(),
        })
            .then(handleProtectedResponse)
            .then((response) => response.json())
            .then((data) => setGroceryItems(data))
            .catch((error) => console.error("Error fetching grocery list:", error));
    };

    const fetchProfile = () => {
        const email = currentUser?.email || getSavedUser()?.email;

        if (!email) {
            return;
        }

        fetch(`${API_BASE_URL}/api/profile/me`, {
            headers: getAuthHeaders(),
        })
            .then(handleProtectedResponse)
            .then((response) => response.json())
            .then((data) => {
                if (!data) {
                    return;
                }

                setProfileForm({
                    age: data.age || "",
                    height: data.height || "",
                    weight: data.weight || "",
                    gender: data.gender || "",
                    fitnessGoal: data.fitnessGoal || "Maintenance",
                    dailyCalorieGoal: data.dailyCalorieGoal || "",
                    dailyProteinGoal: data.dailyProteinGoal || "",
                    waterGoal: data.waterGoal || "",
                    currentStreak: data.currentStreak || "",
                });
            })
            .catch((error) => console.error("Error fetching profile:", error));
    };

    useEffect(() => {
        if (loggedIn) {
            fetchMeals();
            fetchMealPlans();
            fetchGroceryList();
            fetchWeightEntries();
            fetchProfile();
        }
    }, [loggedIn]);

    useEffect(() => {
        localStorage.setItem("fitMealCoachMessages", JSON.stringify(coachMessages));
    }, [coachMessages]);

    useEffect(() => {
        coachMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [coachMessages, coachLoading]);

    useEffect(() => {
        return () => {
            if (foodImagePreview) {
                URL.revokeObjectURL(foodImagePreview);
            }
        };
    }, [foodImagePreview]);

    const handleAuthChange = (event) => {
        setAuthData({
            ...authData,
            [event.target.name]: event.target.value,
        });
    };

    const validateAuthForm = () => {
        if (authMode === "login" && !authData.usernameOrPhone.trim()) {
            return "Username or phone is required.";
        }

        if (authMode === "login" && !authData.password.trim()) {
            return "Password is required.";
        }

        if (authMode === "register" && !authData.firstName.trim()) {
            return "First name is required.";
        }

        if (authMode === "register" && !authData.lastName.trim()) {
            return "Last name is required.";
        }

        if ((authMode === "register" || authMode === "forgot") && !authData.email.trim()) {
            return "Email is required.";
        }

        if ((authMode === "register" || authMode === "forgot") && !authData.email.includes("@")) {
            return "Enter a valid email address.";
        }

        if (authMode === "register" && !authData.password.trim()) {
            return "Password is required.";
        }

        if (authMode === "register" && authData.password.length < 6) {
            return "Password must be at least 6 characters.";
        }

        if (authMode === "register" && authData.password !== authData.confirmPassword) {
            return "Passwords do not match.";
        }

        if (authMode === "verify" && !authData.verificationToken.trim()) {
            return "Verification token is required.";
        }

        if (authMode === "reset" && !authData.resetToken.trim()) {
            return "Reset token is required.";
        }

        if (authMode === "reset" && !authData.newPassword.trim()) {
            return "New password is required.";
        }

        if (authMode === "reset" && authData.newPassword.length < 6) {
            return "Password must be at least 6 characters.";
        }

        if (authMode === "reset" && authData.newPassword !== authData.confirmPassword) {
            return "Passwords do not match.";
        }

        return "";
    };
    const handleAuthSubmit = (event) => {
        event.preventDefault();

        const validationMessage = validateAuthForm();

        if (validationMessage) {
            setAuthError(validationMessage);
            setAuthSuccess("");
            return;
        }

        setAuthError("");
        setAuthSuccess("");
        setAuthLoading(true);

        if (authMode === "verify") {
            fetch(
                `${API_BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(
                    authData.verificationToken.trim()
                )}`
            )
                .then((response) => response.json())
                .then((data) => {
                    if (data.message !== "Email verified successfully. You can now login.") {
                        setAuthError(data.message || "Email verification failed.");
                        return;
                    }

                    switchAuthMode("login", false);
                    setAuthSuccess("Email verified successfully. You can now login.");
                })
                .catch((error) => {
                    console.error("Email verification error:", error);
                    setAuthError("Something went wrong. Please try again.");
                })
                .finally(() => {
                    setAuthLoading(false);
                });
            return;
        }

        if (authMode === "forgot") {
            fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: authData.email,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    setAuthSuccess(
                        data.message || "If this email exists, reset instructions have been sent."
                    );
                })
                .catch((error) => {
                    console.error("Forgot password error:", error);
                    setAuthError("Something went wrong. Please try again.");
                })
                .finally(() => {
                    setAuthLoading(false);
                });
            return;
        }

        if (authMode === "reset") {
            fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: authData.resetToken,
                    newPassword: authData.newPassword,
                    confirmPassword: authData.confirmPassword,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.message !== "Password reset successful. You can now login.") {
                        setAuthError(data.message || "Password reset failed.");
                        return;
                    }

                    switchAuthMode("login", false);
                    setAuthSuccess("Password reset successful. You can now login.");
                })
                .catch((error) => {
                    console.error("Reset password error:", error);
                    setAuthError("Something went wrong. Please try again.");
                })
                .finally(() => {
                    setAuthLoading(false);
                });
            return;
        }

        const authUrl =
            authMode === "login"
                ? `${API_BASE_URL}/api/auth/login`
                : `${API_BASE_URL}/api/auth/register`;

        const requestBody =
            authMode === "login"
                ? {
                      usernameOrPhone: authData.usernameOrPhone,
                      password: authData.password,
                  }
                : {
                      firstName: authData.firstName,
                      lastName: authData.lastName,
                      email: authData.email,
                      password: authData.password,
                      confirmPassword: authData.confirmPassword,
                  };

        fetch(authUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        })
            .then((response) => response.json())
            .then((data) => {
                const isSuccess =
                    data.message === "Login successful" ||
                    data.message === "Registration successful. You can now login.";

                if (!isSuccess) {
                    setAuthError(data.message || "Authentication failed");
                    return;
                }

                if (authMode === "login") {
                    if (!data.token) {
                        setAuthError("Login failed. Please try again.");
                        return;
                    }

                    const user = {
                        email: data.email,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        role: data.role,
                    };

                    localStorage.setItem("fitMealUser", JSON.stringify(user));
                    localStorage.setItem("fitMealToken", data.token);
                    setCurrentUser(user);
                    setAuthToken(data.token);
                    setLoggedIn(true);
                    setAuthError("");
                    return;
                }

                switchAuthMode("login", false);
                setAuthSuccess("Registration successful. You can now login.");
            })
            .catch((error) => {
                console.error("Authentication error:", error);
                setAuthError("Something went wrong. Please try again.");
            })
            .finally(() => {
                setAuthLoading(false);
            });
    };
    const switchAuthMode = (mode, clearMessage = true) => {
        setAuthMode(mode);
        setAuthError("");
        if (clearMessage) {
            setAuthSuccess("");
        }
        setPasswordVisible(false);
        setAuthData({
            usernameOrPhone: "",
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            verificationToken: "",
            resetToken: "",
            newPassword: "",
        });
    };

    const getAuthButtonText = () => {
        if (authLoading && authMode === "login") {
            return "Logging in...";
        }

        if (authLoading && authMode === "register") {
            return "Creating account...";
        }

        if (authLoading && authMode === "verify") {
            return "Verifying...";
        }

        if (authLoading && authMode === "forgot") {
            return "Sending...";
        }

        if (authLoading && authMode === "reset") {
            return "Resetting...";
        }

        if (authMode === "register") {
            return "Register";
        }

        if (authMode === "verify") {
            return "Verify Email";
        }

        if (authMode === "forgot") {
            return "Send Reset Instructions";
        }

        if (authMode === "reset") {
            return "Reset Password";
        }

        return "Login";
    };
    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleMealTypeChange = (event) => {
        const mealType = event.target.value;
        setSelectedMealType(mealType);
        fetchMeals(mealType);
    };

    const handleRecommendationChange = (event) => {
        setRecommendationForm({
            ...recommendationForm,
            [event.target.name]: event.target.value,
        });
    };

    const handleWeeklyPlannerChange = (event) => {
        setWeeklyPlannerForm({
            ...weeklyPlannerForm,
            [event.target.name]: event.target.value,
        });
    };
    const handleWeightChange = (event) => {
        setWeightForm({
            ...weightForm,
            [event.target.name]: event.target.value,
        });
    };

    const handleWeightSubmit = (event) => {
        event.preventDefault();

        if (!weightForm.weight || Number(weightForm.weight) <= 0) {
            setWeightError("Please enter a valid weight.");
            return;
        }

        const url = editingWeightEntryId
            ? `${API_BASE_URL}/api/weight-entries/${editingWeightEntryId}`
            : `${API_BASE_URL}/api/weight-entries`;
        const method = editingWeightEntryId ? "PUT" : "POST";

        setWeightError("");
        setWeightMessage("");

        fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify({
                weight: Number(weightForm.weight),
                recordedDate: weightForm.recordedDate,
            }),
        })
            .then(handleProtectedResponse)
            .then((response) => response.json())
            .then(() => {
                fetchWeightEntries();
                setEditingWeightEntryId(null);
                setWeightForm({
                    weight: "",
                    recordedDate: new Date().toISOString().slice(0, 10),
                });
                setWeightMessage(editingWeightEntryId ? "Weight entry updated." : "Weight entry added.");
            })
            .catch((error) => {
                console.error("Error saving weight entry:", error);
                setWeightError("Failed to save weight entry.");
            });
    };

    const editWeightEntry = (entry) => {
        setEditingWeightEntryId(entry.id);
        setWeightForm({
            weight: entry.weight,
            recordedDate: entry.recordedDate || new Date().toISOString().slice(0, 10),
        });
        setWeightMessage("");
        setWeightError("");
        scrollToSection("progress-section");
    };

    const deleteWeightEntry = (id) => {
        fetch(`${API_BASE_URL}/api/weight-entries/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        })
            .then(handleProtectedResponse)
            .then(() => {
                fetchWeightEntries();
                setWeightMessage("Weight entry deleted.");
            })
            .catch((error) => {
                console.error("Error deleting weight entry:", error);
                setWeightError("Failed to delete weight entry.");
            });
    };

    const cancelWeightEdit = () => {
        setEditingWeightEntryId(null);
        setWeightForm({
            weight: "",
            recordedDate: new Date().toISOString().slice(0, 10),
        });
        setWeightError("");
        setWeightMessage("");
    };
    const handleGroceryChange = (event) => {
        const { name, value, type, checked } = event.target;

        setGroceryForm({
            ...groceryForm,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleMealPlanChange = (event) => {
        setMealPlanForm({
            ...mealPlanForm,
            [event.target.name]: event.target.value,
        });
    };

    const calculateProfileGoals = (profile) => {
        const age = Number(profile.age);
        const height = Number(profile.height);
        const weight = Number(profile.weight);
        const gender = profile.gender;
        const fitnessGoal = profile.fitnessGoal;

        if (!age || !height || !weight || !gender || !fitnessGoal) {
            return profile;
        }

        const bmr =
            gender === "Male"
                ? 10 * weight + 6.25 * height - 5 * age + 5
                : 10 * weight + 6.25 * height - 5 * age - 161;
        let calories = bmr * 1.375;

        if (fitnessGoal === "Weight Loss") {
            calories -= 400;
        }

        if (fitnessGoal === "Muscle Gain") {
            calories += 300;
        }

        const proteinMultipliers = {
            "Weight Loss": 1.8,
            "Muscle Gain": 2.2,
            Maintenance: 1.6,
            "High Protein": 2.3,
        };

        return {
            ...profile,
            dailyCalorieGoal: String(Math.round(calories)),
            dailyProteinGoal: String(
                Math.round(weight * (proteinMultipliers[fitnessGoal] || 1.6))
            ),
            waterGoal: String(Math.round(weight * 35)),
        };
    };

    const handleProfileChange = (event) => {
        const fieldsThatUpdateGoals = [
            "age",
            "height",
            "weight",
            "gender",
            "fitnessGoal",
        ];
        const updatedProfile = {
            ...profileForm,
            [event.target.name]: event.target.value,
        };

        if (fieldsThatUpdateGoals.includes(event.target.name)) {
            setProfileForm(calculateProfileGoals(updatedProfile));
            return;
        }

        setProfileForm(updatedProfile);
    };

    const handleGenderSelect = (gender) => {
        const updatedProfile = {
            ...profileForm,
            gender,
        };

        setProfileForm(calculateProfileGoals(updatedProfile));
    };

    const buildWeeklyPlanFromAiMeals = (aiMeals) => {
        if (!aiMeals.length) {
            return [];
        }

        return weekDays.map((day, dayIndex) => {
            const breakfast = aiMeals[dayIndex % aiMeals.length];
            const lunch = aiMeals[(dayIndex + 1) % aiMeals.length];
            const dinner = aiMeals[(dayIndex + 2) % aiMeals.length];
            const snack = aiMeals[(dayIndex + 3) % aiMeals.length];
            const mealSet = [breakfast, lunch, dinner, snack];

            return {
                day,
                breakfast: breakfast.name,
                lunch: lunch.name,
                dinner: dinner.name,
                snack: snack.name,
                totalCalories: mealSet.reduce(
                    (total, meal) => total + Number(meal.calories || 0),
                    0
                ),
                totalProtein: mealSet.reduce(
                    (total, meal) => total + Number(meal.protein || 0),
                    0
                ),
                tags: [weeklyPlannerForm.dietaryPreference, weeklyPlannerForm.goal],
            };
        });
    };

    const generateWeeklyPlan = () => {
        setWeeklyPlannerLoading(true);
        setWeeklyPlannerError("");
        setWeeklyPlannerMessage("");

        fetch(`${API_BASE_URL}/api/ai/recommendations`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                goal: `${weeklyPlannerForm.goal} - ${weeklyPlannerForm.dietaryPreference}`,
                calories: Number(weeklyPlannerForm.calories),
                proteinTarget: Number(weeklyPlannerForm.proteinTarget),
            }),
        })
            .then(handleProtectedResponse)
            .then((response) => response.json())
            .then((data) => {
                const weeklyPlan = buildWeeklyPlanFromAiMeals(data || []);

                if (!weeklyPlan.length) {
                    throw new Error("No meals returned from AI");
                }

                setGeneratedWeeklyPlan(weeklyPlan);
            })
            .catch((error) => {
                console.error("Error generating weekly plan:", error);
                setWeeklyPlannerError("Failed to generate weekly plan");
            })
            .finally(() => {
                setWeeklyPlannerLoading(false);
            });
    };

    const saveGeneratedWeeklyPlan = () => {
        if (!generatedWeeklyPlan.length) {
            setWeeklyPlannerError("Generate a weekly plan before saving.");
            return;
        }

        setWeeklyPlannerSaving(true);
        setWeeklyPlannerError("");
        setWeeklyPlannerMessage("");

        Promise.all(
            generatedWeeklyPlan.map((plan) =>
                fetch(`${API_BASE_URL}/api/meal-plans`, {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        day: plan.day,
                        breakfast: plan.breakfast,
                        lunch: plan.lunch,
                        dinner: plan.dinner,
                        snack: plan.snack,
                        totalCalories: Number(plan.totalCalories),
                        totalProtein: Number(plan.totalProtein),
                    }),
                }).then(handleProtectedResponse)
            )
        )
            .then(() => {
                fetchMealPlans();
                setWeeklyPlannerMessage("Weekly plan saved to planner.");
            })
            .catch((error) => {
                console.error("Error saving weekly plan:", error);
                setWeeklyPlannerError("Failed to save weekly plan");
            })
            .finally(() => {
                setWeeklyPlannerSaving(false);
            });
    };
    const generateRecommendations = () => {
        setRecommendationLoading(true);
        setRecommendationError("");

        fetch(`${API_BASE_URL}/api/ai/recommendations`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                goal: recommendationForm.goal,
                calories: Number(recommendationForm.calories),
                proteinTarget: Number(recommendationForm.proteinTarget),
            }),
        })
            .then(handleProtectedResponse)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Recommendation request failed");
                }

                return response.json();
            })
            .then((data) => {
                setRecommendations(data);
            })
            .catch((error) => {
                console.error("Error generating recommendations:", error);
                setRecommendationError("Failed to generate recommendations");
            })
            .finally(() => {
                setRecommendationLoading(false);
            });
    };

    const isSupportedFoodImage = (file) => {
        return file && ["image/jpeg", "image/jpg", "image/png"].includes(file.type);
    };

    const handleFoodImageSelect = (file) => {
        setFoodAnalyzerError("");
        setFoodAnalyzerMessage("");
        setFoodAnalysis(null);

        if (!isSupportedFoodImage(file)) {
            setFoodImage(null);
            setFoodImagePreview("");
            setFoodAnalyzerError("Please upload a JPG, JPEG, or PNG image.");
            return;
        }

        setFoodImage(file);
        setFoodImagePreview(URL.createObjectURL(file));
    };

    const handleFoodImageInputChange = (event) => {
        handleFoodImageSelect(event.target.files?.[0]);
    };

    const handleFoodDrop = (event) => {
        event.preventDefault();
        handleFoodImageSelect(event.dataTransfer.files?.[0]);
    };

    const removeFoodImage = () => {
        setFoodImage(null);
        setFoodImagePreview("");
        setFoodAnalysis(null);
        setFoodAnalyzerError("");
        setFoodAnalyzerMessage("");
    };

    const analyzeFoodImage = () => {
        if (!foodImage) {
            setFoodAnalyzerError("Please choose a food image first.");
            return;
        }

        const formDataPayload = new FormData();
        formDataPayload.append("image", foodImage);

        setFoodAnalyzerLoading(true);
        setFoodAnalyzerError("");
        setFoodAnalyzerMessage("");

        fetch(`${API_BASE_URL}/api/ai/analyze-food`, {
            method: "POST",
            headers: {
                Authorization: getAuthHeaders().Authorization,
            },
            body: formDataPayload,
        })
            .then(handleProtectedResponse)
            .then((response) => response.json())
            .then((data) => {
                setFoodAnalysis(data);
            })
            .catch((error) => {
                console.error("Error analyzing food image:", error);
                setFoodAnalyzerError("Failed to analyze food image. Please try again.");
            })
            .finally(() => {
                setFoodAnalyzerLoading(false);
            });
    };

    const saveFoodAnalysisAsMeal = () => {
        if (!foodAnalysis || !foodAnalysis.foodName) {
            setFoodAnalyzerError("Analyze an image before saving it as a meal.");
            return;
        }

        if (foodAnalysis.estimatedCalories <= 0) {
            setFoodAnalyzerError("This analysis does not have enough nutrition data to save.");
            return;
        }

        fetch(`${API_BASE_URL}/api/meals`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                name: foodAnalysis.foodName,
                mealType: "SNACK",
                calories: Number(foodAnalysis.estimatedCalories),
                protein: Number(foodAnalysis.protein),
            }),
        })
            .then(handleProtectedResponse)
            .then((response) => response.json())
            .then(() => {
                fetchMeals();
                setFoodAnalyzerMessage("Saved as today's meal.");
            })
            .catch((error) => {
                console.error("Error saving analyzed food as meal:", error);
                setFoodAnalyzerError("Failed to save as meal. Please try again.");
            });
    };
    const getCoachProfilePayload = () => {
        return {
            email: currentUser?.email || "",
            age: Number(profileForm.age) || 0,
            height: Number(profileForm.height) || 0,
            weight: Number(profileForm.weight) || 0,
            gender: profileForm.gender,
            fitnessGoal: profileForm.fitnessGoal,
            dailyCalorieGoal: Number(profileForm.dailyCalorieGoal) || 0,
            dailyProteinGoal: Number(profileForm.dailyProteinGoal) || 0,
            waterGoal: Number(profileForm.waterGoal) || 0,
            currentStreak: Number(profileForm.currentStreak) || 0,
        };
    };

    const sendCoachMessage = (messageText = coachInput) => {
        const text = messageText.trim();

        if (!text || coachLoading) {
            return;
        }

        const userMessage = {
            role: "user",
            content: text,
        };
        const nextMessages = [...coachMessages, userMessage];

        setCoachMessages(nextMessages);
        setCoachInput("");
        setCoachError("");
        setCoachLoading(true);

        fetch(`${API_BASE_URL}/api/ai/coach`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                message: text,
                profile: getCoachProfilePayload(),
                history: coachMessages.slice(-10).map((message) => ({
                    role: message.role === "ai" ? "assistant" : "user",
                    content: message.content,
                })),
            }),
        })
            .then(handleProtectedResponse)
            .then((response) => response.json())
            .then((data) => {
                setCoachMessages((messages) => [
                    ...messages,
                    {
                        role: "ai",
                        content: data.answer || "I could not create a coach response right now.",
                        suggestions: data.suggestions || [],
                        tips: data.tips || [],
                    },
                ]);
            })
            .catch((error) => {
                console.error("Error talking to AI Coach:", error);
                setCoachError("Failed to get AI Coach response. Please try again.");
            })
            .finally(() => {
                setCoachLoading(false);
            });
    };

    const handleCoachKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendCoachMessage();
        }
    };

    const clearCoachChat = () => {
        localStorage.removeItem("fitMealCoachMessages");
        setCoachMessages(getSavedCoachMessages());
        setCoachInput("");
        setCoachError("");
    };
    const handleSubmit = (event) => {
        event.preventDefault();

        const url = editingMealId
            ? `${API_BASE_URL}/api/meals/${editingMealId}`
            : `${API_BASE_URL}/api/meals`;

        const method = editingMealId ? "PUT" : "POST";

        fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify({
                name: formData.name,
                mealType: formData.mealType,
                calories: Number(formData.calories),
                protein: Number(formData.protein),
            }),
        })
            .then(handleProtectedResponse)
            .then((response) => response.json())
            .then(() => {
                fetchMeals();
                setFormData({
                    name: "",
                    mealType: "",
                    calories: "",
                    protein: "",
                });
                setEditingMealId(null);
            })
            .catch((error) => console.error("Error saving meal:", error));
    };

    const editMeal = (meal) => {
        setEditingMealId(meal.id);
        setFormData({
            name: meal.name,
            mealType: meal.mealType,
            calories: meal.calories,
            protein: meal.protein,
        });
        scrollToSection("meal-form-section");
    };

    const deleteMeal = (id) => {
        fetch(`${API_BASE_URL}/api/meals/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        })
            .then(handleProtectedResponse)
            .then(() => fetchMeals())
            .catch((error) => console.error("Error deleting meal:", error));
    };

    const handleGrocerySubmit = (event) => {
        event.preventDefault();

        const url = editingGroceryId
            ? `${API_BASE_URL}/api/grocery-list/${editingGroceryId}`
            : `${API_BASE_URL}/api/grocery-list`;

        const method = editingGroceryId ? "PUT" : "POST";

        fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(groceryForm),
        })
            .then(handleProtectedResponse)
            .then((response) => response.json())
            .then(() => {
                fetchGroceryList();
                clearGroceryForm();
            })
            .catch((error) => console.error("Error saving grocery item:", error));
    };

    const editGroceryItem = (item) => {
        setEditingGroceryId(item.id);
        setGroceryForm({
            name: item.name || "",
            category: item.category || "Other",
            quantity: item.quantity || "",
            unit: item.unit || "",
            purchased: item.purchased || false,
        });
        scrollToSection("grocery-section");
    };

    const deleteGroceryItem = (id) => {
        fetch(`${API_BASE_URL}/api/grocery-list/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        })
            .then(handleProtectedResponse)
            .then(() => fetchGroceryList())
            .catch((error) => console.error("Error deleting grocery item:", error));
    };

    const toggleGroceryPurchased = (id) => {
        fetch(`${API_BASE_URL}/api/grocery-list/${id}/toggle`, {
            method: "PATCH",
            headers: getAuthHeaders(),
        })
            .then(handleProtectedResponse)
            .then(() => fetchGroceryList())
            .catch((error) => console.error("Error toggling grocery item:", error));
    };

    const clearGroceryForm = () => {
        setEditingGroceryId(null);
        setGroceryForm({
            name: "",
            category: "Other",
            quantity: "",
            unit: "",
            purchased: false,
        });
    };

    const handleMealPlanSubmit = (event) => {
        event.preventDefault();

        const url = editingMealPlanId
            ? `${API_BASE_URL}/api/meal-plans/${editingMealPlanId}`
            : `${API_BASE_URL}/api/meal-plans`;

        const method = editingMealPlanId ? "PUT" : "POST";

        fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify({
                day: mealPlanForm.day,
                breakfast: mealPlanForm.breakfast,
                lunch: mealPlanForm.lunch,
                dinner: mealPlanForm.dinner,
                snack: mealPlanForm.snack,
                totalCalories: Number(mealPlanForm.totalCalories),
                totalProtein: Number(mealPlanForm.totalProtein),
            }),
        })
            .then(handleProtectedResponse)
            .then((response) => response.json())
            .then(() => {
                fetchMealPlans();
                clearMealPlanForm();
            })
            .catch((error) => console.error("Error saving meal plan:", error));
    };

    const editMealPlan = (plan) => {
        setEditingMealPlanId(plan.id);
        setMealPlanForm({
            day: plan.day || "Monday",
            breakfast: plan.breakfast || "",
            lunch: plan.lunch || "",
            dinner: plan.dinner || "",
            snack: plan.snack || "",
            totalCalories: plan.totalCalories || "",
            totalProtein: plan.totalProtein || "",
        });
        scrollToSection("planner-section");
    };

    const deleteMealPlan = (id) => {
        fetch(`${API_BASE_URL}/api/meal-plans/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        })
            .then(handleProtectedResponse)
            .then(() => fetchMealPlans())
            .catch((error) => console.error("Error deleting meal plan:", error));
    };

    const clearMealPlanForm = () => {
        setEditingMealPlanId(null);
        setMealPlanForm({
            day: "Monday",
            breakfast: "",
            lunch: "",
            dinner: "",
            snack: "",
            totalCalories: "",
            totalProtein: "",
        });
    };

    const handleProfileSubmit = (event) => {
        event.preventDefault();

        if (!currentUser?.email) {
            setProfileMessage("Login again to save your profile.");
            return;
        }

        fetch(`${API_BASE_URL}/api/profile/me`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                age: Number(profileForm.age),
                height: Number(profileForm.height),
                weight: Number(profileForm.weight),
                gender: profileForm.gender,
                fitnessGoal: profileForm.fitnessGoal,
                dailyCalorieGoal: Number(profileForm.dailyCalorieGoal),
                dailyProteinGoal: Number(profileForm.dailyProteinGoal),
                waterGoal: Number(profileForm.waterGoal),
                currentStreak: Number(profileForm.currentStreak),
            }),
        })
            .then(handleProtectedResponse)
            .then((response) => response.json())
            .then((data) => {
                setProfileForm({
                    age: data.age || "",
                    height: data.height || "",
                    weight: data.weight || "",
                    gender: data.gender || "",
                    fitnessGoal: data.fitnessGoal || "Maintenance",
                    dailyCalorieGoal: data.dailyCalorieGoal || "",
                    dailyProteinGoal: data.dailyProteinGoal || "",
                    waterGoal: data.waterGoal || "",
                    currentStreak: data.currentStreak || "",
                });
                setProfileMessage("Profile saved successfully.");
            })
            .catch((error) => {
                console.error("Error saving profile:", error);
                setProfileMessage("Could not save profile. Please try again.");
            });
    };

    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);

        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    const filteredMeals = meals.filter((meal) =>
        meal.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalMeals = filteredMeals.length;
    const totalCalories = filteredMeals.reduce(
        (total, meal) => total + meal.calories,
        0
    );
    const totalProtein = filteredMeals.reduce(
        (total, meal) => total + meal.protein,
        0
    );
    const dailyCalorieGoal = Number(profileForm.dailyCalorieGoal) || 0;
    const dailyProteinGoal = Number(profileForm.dailyProteinGoal) || 0;
    const waterGoal = Number(profileForm.waterGoal) || 0;
    const caloriesRemaining = Math.max(dailyCalorieGoal - totalCalories, 0);
    const proteinRemaining = Math.max(dailyProteinGoal - totalProtein, 0);
    const caloriesProgress =
        dailyCalorieGoal === 0
            ? 0
            : Math.min(Math.round((totalCalories / dailyCalorieGoal) * 100), 100);
    const proteinProgress =
        dailyProteinGoal === 0
            ? 0
            : Math.min(Math.round((totalProtein / dailyProteinGoal) * 100), 100);
    const waterProgress = 0;
    const goalCompletion =
        dailyCalorieGoal === 0 && dailyProteinGoal === 0
            ? 0
            : Math.round((caloriesProgress + proteinProgress) / 2);
    const plannedMealsCount = mealPlans.reduce((total, plan) => {
        const plannedSlots = [plan.breakfast, plan.lunch, plan.dinner, plan.snack].filter(
            (mealName) => mealName && mealName.trim()
        );

        return total + plannedSlots.length;
    }, 0);
    const weeklyAverageCalories =
        mealPlans.length === 0
            ? 0
            : Math.round(
                  mealPlans.reduce((total, plan) => total + Number(plan.totalCalories || 0), 0) /
                      mealPlans.length
              );
    const weeklyAverageProtein =
        mealPlans.length === 0
            ? 0
            : Math.round(
                  mealPlans.reduce((total, plan) => total + Number(plan.totalProtein || 0), 0) /
                      mealPlans.length
              );

    const weekDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];

    const sortedMealPlans = [...mealPlans].sort((firstPlan, secondPlan) => {
        return weekDays.indexOf(firstPlan.day) - weekDays.indexOf(secondPlan.day);
    });

    const getPlanMealText = (mealName) => {
        return mealName && mealName.trim() ? mealName : "Not planned";
    };

    const groceryCategories = [
        "Protein",
        "Vegetables",
        "Fruits",
        "Dairy",
        "Grains",
        "Snacks",
        "Other",
    ];

    const purchasedGroceryCount = groceryItems.filter((item) => item.purchased).length;
    const totalGroceryCount = groceryItems.length;
    const groceryProgress =
        totalGroceryCount === 0
            ? 0
            : Math.round((purchasedGroceryCount / totalGroceryCount) * 100);

    const heightInMeters = Number(profileForm.height) / 100;
    const bmi =
        heightInMeters > 0 && Number(profileForm.weight) > 0
            ? (Number(profileForm.weight) / (heightInMeters * heightInMeters)).toFixed(1)
            : "0";

    const coachQuickPrompts = [
        "Plan today's meals",
        "Suggest breakfast",
        "Suggest dinner",
        "High protein snacks",
        "Vegetarian meals",
        "Grocery list",
        "Healthy desserts",
        "Meal prep ideas",
    ];
    const sortedWeightEntries = [...weightEntries].sort((firstEntry, secondEntry) => {
        return new Date(firstEntry.recordedDate) - new Date(secondEntry.recordedDate);
    });
    const startingWeight = sortedWeightEntries.length > 0 ? Number(sortedWeightEntries[0].weight) : 0;
    const currentWeight = sortedWeightEntries.length > 0
        ? Number(sortedWeightEntries[sortedWeightEntries.length - 1].weight)
        : Number(profileForm.weight) || 0;
    const totalWeightChange = startingWeight && currentWeight
        ? Number((currentWeight - startingWeight).toFixed(1))
        : 0;
    const weightTrendData = sortedWeightEntries.map((entry) => ({
        date: entry.recordedDate,
        label: new Date(entry.recordedDate + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        }),
        weight: Number(entry.weight),
    }));
    const recentWeightEntries = [...sortedWeightEntries].reverse().slice(0, 8);
    const todayDateKey = new Date().toISOString().slice(0, 10);
    const sevenDayNutritionData = Array.from({ length: 7 }).map((_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));

        const dateKey = date.toISOString().slice(0, 10);
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
        const planForDay = mealPlans.find((plan) => plan.day === dayName);
        const caloriesForDay = dateKey === todayDateKey
            ? totalCalories
            : Number(planForDay?.totalCalories || 0);
        const proteinForDay = dateKey === todayDateKey
            ? totalProtein
            : Number(planForDay?.totalProtein || 0);
        const caloriesPercent = dailyCalorieGoal === 0
            ? 0
            : Math.min(Math.round((caloriesForDay / dailyCalorieGoal) * 100), 100);
        const proteinPercent = dailyProteinGoal === 0
            ? 0
            : Math.min(Math.round((proteinForDay / dailyProteinGoal) * 100), 100);

        return {
            date: dateKey,
            label: date.toLocaleDateString("en-US", { weekday: "short" }),
            calories: caloriesForDay,
            protein: proteinForDay,
            completion: dailyCalorieGoal === 0 && dailyProteinGoal === 0
                ? 0
                : Math.round((caloriesPercent + proteinPercent) / 2),
        };
    });
    const sevenDayAverageCalories = Math.round(
        sevenDayNutritionData.reduce((total, day) => total + day.calories, 0) / 7
    );
    const sevenDayAverageProtein = Math.round(
        sevenDayNutritionData.reduce((total, day) => total + day.protein, 0) / 7
    );
    const sevenDayAverageCompletion = Math.round(
        sevenDayNutritionData.reduce((total, day) => total + day.completion, 0) / 7
    );
    const hasNutritionTrendData = sevenDayNutritionData.some(
        (day) => day.calories > 0 || day.protein > 0
    );
    const getGroceryItemsByCategory = (category) => {
        return groceryItems.filter((item) => {
            const itemCategory = item.category || "Other";

            if (category === "Other") {
                return !groceryCategories.includes(itemCategory) || itemCategory === "Other";
            }

            return itemCategory === category;
        });
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible((visible) => !visible);
    };

    const passwordInputType = passwordVisible ? "text" : "password";

    return (
        <div className="app">
            {loggedIn && (
                <nav className="navbar">
                <button
                    className="brand-button brand-section"
                    onClick={() => scrollToSection("top")}
                >
                    <img className="logo" src={logoPath} alt="FitMeal logo" />
                    <span>FitMeal</span>
                </button>

                <div className="nav-links">
                    <button onClick={() => scrollToSection("dashboard-section")}>
                        Dashboard
                    </button>
                    <button onClick={() => scrollToSection("profile-section")}>
                        Profile
                    </button>
                    <button onClick={() => scrollToSection("planner-section")}>
                        Planner
                    </button>
                    <button onClick={() => scrollToSection("ai-section")}>
                        AI Picks
                    </button>
                    <button onClick={() => scrollToSection("ai-weekly-section")}>
                        AI Planner
                    </button>
                    <button onClick={() => scrollToSection("ai-coach-section")}>
                        AI Coach
                    </button>
                    <button onClick={() => scrollToSection("food-analyzer-section")}>
                        Food Analyzer
                    </button>
                    <button onClick={() => scrollToSection("grocery-section")}>
                        Grocery List
                    </button>
                </div>

                <div className="auth-actions">
                    {loggedIn && (
                        <>
                            <span className="profile-name">
                                Hi, {currentUser?.firstName || "there"}
                            </span>
                            <button className="logout-button" onClick={() => logout()}>
                                Logout
                            </button>
                        </>
                    )}
                </div>
                </nav>
            )}

            {!loggedIn ? (
                <main className="auth-page" id="top">
                    <section className="auth-shell">
                        <img className="auth-logo logo-large" src={logoPath} alt="FitMeal logo" />

                        <div className="auth-card">
                            <div className="auth-brand">
                                <h1>FitMeal</h1>
                                <p>Eat Healthy. Live Better.</p>
                            </div>

                            <div className="auth-tabs">
                                <button
                                    className={authMode === "login" ? "active" : ""}
                                    onClick={() => switchAuthMode("login")}
                                >
                                    Login
                                </button>
                                <button
                                    className={authMode === "register" ? "active" : ""}
                                    onClick={() => switchAuthMode("register")}
                                >
                                    Register
                                </button>
                            </div>

                            {(authMode === "verify" ||
                                authMode === "forgot" ||
                                authMode === "reset") && (
                                <div className="auth-mode-heading">
                                    <h2>
                                        {authMode === "verify"
                                            ? "Verify Email"
                                            : authMode === "forgot"
                                              ? "Forgot Password"
                                              : "Reset Password"}
                                    </h2>
                                    <p>
                                        {authMode === "verify"
                                            ? "Paste the verification token from your backend console."
                                            : authMode === "forgot"
                                              ? "Enter your account email to request reset instructions."
                                              : "Paste your reset token and choose a new password."}
                                    </p>
                                </div>
                            )}

                            <form className="auth-form" onSubmit={handleAuthSubmit}>
                                {authMode === "login" && (
                                    <label className="auth-field">
                                        <input
                                            type="text"
                                            name="usernameOrPhone"
                                            placeholder="Username or Phone"
                                            value={authData.usernameOrPhone}
                                            onChange={handleAuthChange}
                                        />
                                    </label>
                                )}

                                {authMode === "register" && (
                                    <>
                                        <label className="auth-field">
                                            <input
                                                type="text"
                                                name="firstName"
                                                placeholder="First Name"
                                                value={authData.firstName}
                                                onChange={handleAuthChange}
                                            />
                                        </label>

                                        <label className="auth-field">
                                            <input
                                                type="text"
                                                name="lastName"
                                                placeholder="Last Name"
                                                value={authData.lastName}
                                                onChange={handleAuthChange}
                                            />
                                        </label>

                                        <label className="auth-field">
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="Email"
                                                value={authData.email}
                                                onChange={handleAuthChange}
                                            />
                                        </label>
                                    </>
                                )}

                                {authMode === "verify" && (
                                    <label className="auth-field">
                                        <input
                                            type="text"
                                            name="verificationToken"
                                            placeholder="Verification token"
                                            value={authData.verificationToken}
                                            onChange={handleAuthChange}
                                        />
                                    </label>
                                )}

                                {authMode === "forgot" && (
                                    <label className="auth-field">
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Email"
                                            value={authData.email}
                                            onChange={handleAuthChange}
                                        />
                                    </label>
                                )}

                                {(authMode === "login" || authMode === "register") && (
                                    <label className="auth-field">
                                        <input
                                            type={passwordInputType}
                                            name="password"
                                            placeholder="Password"
                                            value={authData.password}
                                            onChange={handleAuthChange}
                                        />
                                        <button
                                            className="password-toggle"
                                            type="button"
                                            onMouseDown={(event) => event.preventDefault()}
                                            onClick={togglePasswordVisibility}
                                        >
                                            {passwordVisible ? "hide" : "show"}
                                        </button>
                                    </label>
                                )}

                                {authMode === "register" && (
                                    <label className="auth-field">
                                        <input
                                            type={passwordInputType}
                                            name="confirmPassword"
                                            placeholder="Confirm password"
                                            value={authData.confirmPassword}
                                            onChange={handleAuthChange}
                                        />
                                        <button
                                            className="password-toggle"
                                            type="button"
                                            onMouseDown={(event) => event.preventDefault()}
                                            onClick={togglePasswordVisibility}
                                        >
                                            {passwordVisible ? "hide" : "show"}
                                        </button>
                                    </label>
                                )}

                                {authMode === "reset" && (
                                    <>
                                        <label className="auth-field">
                                            <input
                                                type="text"
                                                name="resetToken"
                                                placeholder="Reset token"
                                                value={authData.resetToken}
                                                onChange={handleAuthChange}
                                            />
                                        </label>

                                        <label className="auth-field">
                                            <input
                                                type={passwordInputType}
                                                name="newPassword"
                                                placeholder="New password"
                                                value={authData.newPassword}
                                                onChange={handleAuthChange}
                                            />
                                            <button
                                                className="password-toggle"
                                                type="button"
                                                onMouseDown={(event) => event.preventDefault()}
                                                onClick={togglePasswordVisibility}
                                            >
                                                {passwordVisible ? "hide" : "show"}
                                            </button>
                                        </label>

                                        <label className="auth-field">
                                            <input
                                                type={passwordInputType}
                                                name="confirmPassword"
                                                placeholder="Confirm password"
                                                value={authData.confirmPassword}
                                                onChange={handleAuthChange}
                                            />
                                            <button
                                                className="password-toggle"
                                                type="button"
                                                onMouseDown={(event) => event.preventDefault()}
                                                onClick={togglePasswordVisibility}
                                            >
                                                {passwordVisible ? "hide" : "show"}
                                            </button>
                                        </label>
                                    </>
                                )}

                                {authMode === "login" && (
                                    <button
                                        className="forgot-link"
                                        type="button"
                                        onClick={() => switchAuthMode("forgot")}
                                    >
                                        Forgot Password?
                                    </button>
                                )}

                                {authMode === "forgot" && (
                                    <button
                                        className="forgot-link"
                                        type="button"
                                        onClick={() => switchAuthMode("reset")}
                                    >
                                        Already have a reset token?
                                    </button>
                                )}

                                {authError && <p className="validation-message">{authError}</p>}
                                {authSuccess && (
                                    <p className="success-message">{authSuccess}</p>
                                )}

                                <button
                                    className="auth-submit"
                                    type="submit"
                                    disabled={authLoading}
                                >
                                    {getAuthButtonText()}
                                </button>
                            </form>

                            <p className="auth-switch-text">
                                {authMode === "login" && "Don't have an account?"}
                                {authMode === "register" && "Already have an account?"}
                                {authMode === "verify" && "Already verified?"}
                                {authMode === "forgot" && "Remember your password?"}
                                {authMode === "reset" && "Back to sign in?"}
                                <button
                                    type="button"
                                    onClick={() =>
                                        switchAuthMode(authMode === "login" ? "register" : "login")
                                    }
                                >
                                    {authMode === "login" ? "Register" : "Login"}
                                </button>
                            </p>
                        </div>
                    </section>
                </main>
            ) : (
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

                    <main className="main-content">
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
                        <section className="content-grid">
                            <div className="panel form-panel" id="meal-form-section">
                                <div className="section-heading">
                                    <span>
                                        {editingMealId ? "Update your meal" : "Create a meal"}
                                    </span>
                                    <h2>{editingMealId ? "Edit Meal" : "Add Meal"}</h2>
                                </div>

                                <form className="meal-form" onSubmit={handleSubmit}>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Meal name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />

                                    <input
                                        type="text"
                                        name="mealType"
                                        placeholder="Meal type"
                                        value={formData.mealType}
                                        onChange={handleChange}
                                    />

                                    <input
                                        type="number"
                                        name="calories"
                                        placeholder="Calories"
                                        value={formData.calories}
                                        onChange={handleChange}
                                    />

                                    <input
                                        type="number"
                                        name="protein"
                                        placeholder="Protein"
                                        value={formData.protein}
                                        onChange={handleChange}
                                    />

                                    <button type="submit">
                                        {editingMealId ? "Update Meal" : "Add Meal"}
                                    </button>
                                </form>
                            </div>

                            <div className="panel planner-panel" id="planner-section">
                                <div className="section-heading">
                                    <span>Weekly workspace</span>
                                    <h2>Meal Planner</h2>
                                </div>

                                <form className="planner-form" onSubmit={handleMealPlanSubmit}>
                                    <select
                                        name="day"
                                        value={mealPlanForm.day}
                                        onChange={handleMealPlanChange}
                                    >
                                        {weekDays.map((day) => (
                                            <option key={day} value={day}>
                                                {day}
                                            </option>
                                        ))}
                                    </select>

                                    <input
                                        type="text"
                                        name="breakfast"
                                        placeholder="Breakfast"
                                        value={mealPlanForm.breakfast}
                                        onChange={handleMealPlanChange}
                                    />

                                    <input
                                        type="text"
                                        name="lunch"
                                        placeholder="Lunch"
                                        value={mealPlanForm.lunch}
                                        onChange={handleMealPlanChange}
                                    />

                                    <input
                                        type="text"
                                        name="dinner"
                                        placeholder="Dinner"
                                        value={mealPlanForm.dinner}
                                        onChange={handleMealPlanChange}
                                    />

                                    <input
                                        type="text"
                                        name="snack"
                                        placeholder="Snack"
                                        value={mealPlanForm.snack}
                                        onChange={handleMealPlanChange}
                                    />

                                    <input
                                        type="number"
                                        name="totalCalories"
                                        placeholder="Total Calories"
                                        value={mealPlanForm.totalCalories}
                                        onChange={handleMealPlanChange}
                                    />

                                    <input
                                        type="number"
                                        name="totalProtein"
                                        placeholder="Total Protein"
                                        value={mealPlanForm.totalProtein}
                                        onChange={handleMealPlanChange}
                                    />

                                    <button type="submit">
                                        {editingMealPlanId ? "Update Plan" : "Add Plan"}
                                    </button>

                                    {editingMealPlanId && (
                                        <button
                                            className="cancel-plan-btn"
                                            type="button"
                                            onClick={clearMealPlanForm}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </form>

                                <div className="planner-grid">
                                    {sortedMealPlans.map((mealPlan) => (
                                        <div className="planner-card" key={mealPlan.id}>
                                            <div className="planner-card-top">
                                                <span>{mealPlan.day}</span>
                                                <strong>{mealPlan.totalCalories || 0} cal</strong>
                                            </div>

                                            <div className="planner-meal-list">
                                                <p>
                                                    <span>Breakfast</span>
                                                    {getPlanMealText(mealPlan.breakfast)}
                                                </p>
                                                <p>
                                                    <span>Lunch</span>
                                                    {getPlanMealText(mealPlan.lunch)}
                                                </p>
                                                <p>
                                                    <span>Dinner</span>
                                                    {getPlanMealText(mealPlan.dinner)}
                                                </p>
                                                <p>
                                                    <span>Snack</span>
                                                    {getPlanMealText(mealPlan.snack)}
                                                </p>
                                            </div>

                                            <div className="planner-metrics">
                                                <span>{mealPlan.totalCalories || 0} Calories</span>
                                                <span>{mealPlan.totalProtein || 0}g Protein</span>
                                            </div>

                                            <div className="planner-actions">
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => editMealPlan(mealPlan)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => deleteMealPlan(mealPlan.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="panel meals-section">
                            <div className="section-top">
                                <div className="section-heading">
                                    <span>Your saved meals</span>
                                    <h2>Meal Library</h2>
                                </div>

                                <div className="filter-controls">
                                    <input
                                        type="text"
                                        placeholder="Search meals by name"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />

                                    <select
                                        value={selectedMealType}
                                        onChange={handleMealTypeChange}
                                    >
                                        <option value="ALL">ALL</option>
                                        <option value="BREAKFAST">BREAKFAST</option>
                                        <option value="LUNCH">LUNCH</option>
                                        <option value="DINNER">DINNER</option>
                                        <option value="SNACK">SNACK</option>
                                    </select>
                                </div>
                            </div>

                            <div className="meal-grid">
                                {filteredMeals.map((meal) => (
                                    <div className="meal-card" key={meal.id}>
                                        <div className="meal-card-header">
                                            <h3>{meal.name}</h3>
                                            <span>{meal.mealType}</span>
                                        </div>

                                        <div className="meal-metrics">
                                            <div>
                                                <strong>{meal.calories}</strong>
                                                <span>Calories</span>
                                            </div>
                                            <div>
                                                <strong>{meal.protein}g</strong>
                                                <span>Protein</span>
                                            </div>
                                        </div>

                                        <div className="card-actions">
                                            <button
                                                className="edit-btn"
                                                onClick={() => editMeal(meal)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="delete-btn"
                                                onClick={() => deleteMeal(meal.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="panel grocery-panel" id="grocery-section">
                            <div className="grocery-top">
                                <div className="section-heading">
                                    <span>Shopping workspace</span>
                                    <h2>Grocery List</h2>
                                </div>

                                <div className="grocery-progress">
                                    <div>
                                        <strong>
                                            {purchasedGroceryCount}/{totalGroceryCount}
                                        </strong>
                                        <span>Purchased</span>
                                    </div>
                                    <div className="progress-track">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${groceryProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <form className="grocery-form" onSubmit={handleGrocerySubmit}>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Item name"
                                    value={groceryForm.name}
                                    onChange={handleGroceryChange}
                                />

                                <select
                                    name="category"
                                    value={groceryForm.category}
                                    onChange={handleGroceryChange}
                                >
                                    {groceryCategories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="text"
                                    name="quantity"
                                    placeholder="Quantity"
                                    value={groceryForm.quantity}
                                    onChange={handleGroceryChange}
                                />

                                <input
                                    type="text"
                                    name="unit"
                                    placeholder="Unit"
                                    value={groceryForm.unit}
                                    onChange={handleGroceryChange}
                                />

                                <button type="submit">
                                    {editingGroceryId ? "Update Item" : "Add Item"}
                                </button>

                                {editingGroceryId && (
                                    <button
                                        className="cancel-grocery-btn"
                                        type="button"
                                        onClick={clearGroceryForm}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </form>

                            <div className="grocery-category-grid">
                                {groceryCategories.map((category) => {
                                    const categoryItems = getGroceryItemsByCategory(category);

                                    return (
                                        <div className="grocery-category-card" key={category}>
                                            <div className="grocery-category-header">
                                                <h3>{category}</h3>
                                                <span>{categoryItems.length}</span>
                                            </div>

                                            <div className="grocery-items-stack">
                                                {categoryItems.length === 0 ? (
                                                    <p className="empty-grocery-text">No items yet</p>
                                                ) : (
                                                    categoryItems.map((item) => (
                                                        <div
                                                            className={
                                                                item.purchased
                                                                    ? "grocery-item-row purchased"
                                                                    : "grocery-item-row"
                                                            }
                                                            key={item.id}
                                                        >
                                                            <label className="grocery-check">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={item.purchased}
                                                                    onChange={() =>
                                                                        toggleGroceryPurchased(item.id)
                                                                    }
                                                                />
                                                                <span></span>
                                                            </label>

                                                            <div className="grocery-item-info">
                                                                <strong>{item.name}</strong>
                                                                <p>
                                                                    {item.quantity} {item.unit}
                                                                </p>
                                                            </div>

                                                            <span className="category-badge">
                                                                {item.category || "Other"}
                                                            </span>

                                                            <div className="grocery-actions">
                                                                <button
                                                                    className="edit-btn"
                                                                    onClick={() =>
                                                                        editGroceryItem(item)
                                                                    }
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    className="delete-btn"
                                                                    onClick={() =>
                                                                        deleteGroceryItem(item.id)
                                                                    }
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </main>
                </>
            )}
        </div>
    );
}

export default App;





























