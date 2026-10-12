const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export async function addCatalogMealToPlan({ catalogMealId, day, slot, onUnauthorized }) {
    const token = localStorage.getItem("fitMealToken") || "";
    const response = await fetch(`${API_BASE_URL}/api/meal-plans/catalog`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ catalogMealId, day, slot }),
    });

    if (response.status === 401 || response.status === 403) {
        onUnauthorized?.("Session expired. Please login again.");
        throw new Error("Session expired");
    }

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Could not add this meal to your planner.");
    }

    return response.json();
}
