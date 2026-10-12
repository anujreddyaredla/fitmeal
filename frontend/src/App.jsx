import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./App.css";

import AuthPage from "./pages/AuthPage";
import FitMealSectionLoader from "./components/FitMealSectionLoader";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const MealsPage = lazy(() => import("./pages/MealsPage"));
const PlannerPage = lazy(() => import("./pages/PlannerPage"));
const AiPicksPage = lazy(() => import("./pages/AiPicksPage"));
const AiPlannerPage = lazy(() => import("./pages/AiPlannerPage"));
const AiCoachPage = lazy(() => import("./pages/AiCoachPage"));
const FoodAnalyzerPage = lazy(() => import("./pages/FoodAnalyzerPage"));
const GroceryPage = lazy(() => import("./pages/GroceryPage"));
const MealLibraryPage = lazy(() => import("./pages/MealLibraryPage"));
const MealDetailPage = lazy(() => import("./pages/MealDetailPage"));

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
    const navigate = useNavigate();
    const location = useLocation();
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

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
    }, [location.pathname]);

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
        navigate("/login", { replace: true });
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
                    navigate("/dashboard", { replace: true });
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
        const routeBySection = {
            top: "/dashboard",
            "dashboard-section": "/dashboard",
            "progress-section": "/dashboard",
            "profile-section": "/profile",
            "meal-form-section": "/meals",
            "planner-section": "/planner",
            "ai-section": "/ai-picks",
            "ai-weekly-section": "/ai-planner",
            "ai-coach-section": "/ai-coach",
            "food-analyzer-section": "/food-analyzer",
            "grocery-section": "/grocery",
        };

        navigate(routeBySection[sectionId] || "/dashboard");

        const scrollWhenReady = (attempt = 0) => {
            const section = document.getElementById(sectionId);

            if (section) {
                section.scrollIntoView({ behavior: "smooth" });
            } else if (attempt < 10) {
                window.setTimeout(() => scrollWhenReady(attempt + 1), 50);
            }
        };

        scrollWhenReady();
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

    const pageView = {
        analyzeFoodImage,
        authData,
        authError,
        authLoading,
        authMode,
        authSuccess,
        bmi,
        caloriesProgress,
        caloriesRemaining,
        cancelWeightEdit,
        clearCoachChat,
        clearGroceryForm,
        clearMealPlanForm,
        coachError,
        coachInput,
        coachLoading,
        coachMessages,
        coachMessagesEndRef,
        coachQuickPrompts,
        currentWeight,
        dailyCalorieGoal,
        dailyProteinGoal,
        deleteGroceryItem,
        deleteMeal,
        deleteMealPlan,
        deleteWeightEntry,
        editGroceryItem,
        editingGroceryId,
        editingMealId,
        editingMealPlanId,
        editingWeightEntryId,
        editMeal,
        editMealPlan,
        editWeightEntry,
        filteredMeals,
        foodAnalysis,
        foodAnalyzerError,
        foodAnalyzerLoading,
        foodAnalyzerMessage,
        foodImagePreview,
        formData,
        generatedWeeklyPlan,
        generateRecommendations,
        generateWeeklyPlan,
        getAuthButtonText,
        getGroceryItemsByCategory,
        getPlanMealText,
        goalCompletion,
        groceryCategories,
        groceryForm,
        groceryProgress,
        handleAuthChange,
        handleAuthSubmit,
        handleChange,
        handleCoachKeyDown,
        handleFoodDrop,
        handleFoodImageInputChange,
        handleGenderSelect,
        handleGroceryChange,
        handleGrocerySubmit,
        handleMealPlanChange,
        handleMealPlanSubmit,
        handleMealTypeChange,
        handleProfileChange,
        handleProfileSubmit,
        handleRecommendationChange,
        handleSearchChange,
        handleSubmit,
        handleWeeklyPlannerChange,
        handleWeightChange,
        handleWeightSubmit,
        hasNutritionTrendData,
        logoPath,
        mealPlanForm,
        passwordInputType,
        passwordVisible,
        plannedMealsCount,
        profileForm,
        profileMessage,
        proteinProgress,
        proteinRemaining,
        purchasedGroceryCount,
        recentWeightEntries,
        recommendationError,
        recommendationForm,
        recommendationLoading,
        recommendations,
        removeFoodImage,
        saveFoodAnalysisAsMeal,
        saveGeneratedWeeklyPlan,
        scrollToSection,
        searchTerm,
        selectedMealType,
        sendCoachMessage,
        setCoachInput,
        sevenDayAverageCalories,
        sevenDayAverageCompletion,
        sevenDayAverageProtein,
        sevenDayNutritionData,
        sortedMealPlans,
        startingWeight,
        switchAuthMode,
        toggleGroceryPurchased,
        togglePasswordVisibility,
        totalCalories,
        totalGroceryCount,
        totalMeals,
        totalProtein,
        totalWeightChange,
        waterGoal,
        waterProgress,
        weekDays,
        weeklyAverageCalories,
        weeklyAverageProtein,
        weeklyPlannerError,
        weeklyPlannerForm,
        weeklyPlannerLoading,
        weeklyPlannerMessage,
        weeklyPlannerSaving,
        weightError,
        weightForm,
        weightMessage,
        weightTrendData,
    };

    if (!loggedIn) {
        return (
            <div className="app">
                <AuthPage view={pageView} />
            </div>
        );
    }

    return (
        <div className="app">
            <nav className="navbar">
                <NavLink className="brand-button brand-section" to="/dashboard">
                    <img className="logo" src={logoPath} alt="FitMeal logo" />
                    <span>FitMeal</span>
                </NavLink>

                <div className="nav-links">
                    <NavLink to="/dashboard">Dashboard</NavLink>
                    <NavLink to="/profile">Profile</NavLink>
                    <NavLink to="/meal-library">Meal Library</NavLink>
                    <NavLink to="/meals">My Meals</NavLink>
                    <NavLink to="/planner">Planner</NavLink>
                    <NavLink to="/ai-picks">AI Picks</NavLink>
                    <NavLink to="/ai-planner">AI Planner</NavLink>
                    <NavLink to="/ai-coach">AI Coach</NavLink>
                    <NavLink to="/food-analyzer">Food Analyzer</NavLink>
                    <NavLink to="/grocery">Grocery List</NavLink>
                </div>

                <div className="auth-actions">
                    <span className="profile-name">
                        Hi, {currentUser?.firstName || "there"}
                    </span>
                    <button className="logout-button" onClick={() => logout()}>
                        Logout
                    </button>
                </div>
            </nav>

            <Suspense fallback={<FitMealSectionLoader label="Loading page..." />}>
                <Routes>
                    <Route path="/dashboard" element={<DashboardPage view={pageView} />} />
                    <Route path="/profile" element={<ProfilePage view={pageView} />} />
                    <Route
                        path="/meal-library"
                        element={<MealLibraryPage onSessionExpired={logout} />}
                    />
                    <Route
                        path="/meal-library/:slug"
                        element={
                            <MealDetailPage
                                onMealPlanUpdated={fetchMealPlans}
                                onSessionExpired={logout}
                            />
                        }
                    />
                    <Route path="/meals" element={<MealsPage view={pageView} />} />
                    <Route
                        path="/planner"
                        element={
                            <PlannerPage
                                onMealPlanUpdated={fetchMealPlans}
                                onSessionExpired={logout}
                                view={pageView}
                            />
                        }
                    />
                    <Route path="/ai-picks" element={<AiPicksPage view={pageView} />} />
                    <Route path="/ai-planner" element={<AiPlannerPage view={pageView} />} />
                    <Route path="/ai-coach" element={<AiCoachPage view={pageView} />} />
                    <Route path="/food-analyzer" element={<FoodAnalyzerPage view={pageView} />} />
                    <Route path="/grocery" element={<GroceryPage view={pageView} />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/login" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Suspense>
        </div>
    );
}

export default App;

