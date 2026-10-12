import { useEffect, useRef, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function useMealCatalog({ category, search, onUnauthorized }) {
    const requestKey = `${category}|${search.trim()}`;
    const [result, setResult] = useState({
        requestKey: "",
        meals: [],
        error: "",
    });
    const unauthorizedHandler = useRef(onUnauthorized);

    useEffect(() => {
        unauthorizedHandler.current = onUnauthorized;
    }, [onUnauthorized]);

    useEffect(() => {
        const controller = new AbortController();
        const query = new URLSearchParams({ size: "60", sort: "name,asc" });
        const token = localStorage.getItem("fitMealToken") || "";

        if (category && category !== "ALL") {
            query.set("category", category);
        }

        if (search.trim()) {
            query.set("search", search.trim());
        }

        fetch(`${API_BASE_URL}/api/catalog/meals?${query.toString()}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
        })
            .then(async (response) => {
                if (response.status === 401 || response.status === 403) {
                    unauthorizedHandler.current?.("Session expired. Please login again.");
                    throw new Error("Session expired");
                }

                if (!response.ok) {
                    const data = await response.json().catch(() => ({}));
                    throw new Error(data.message || "Could not load the meal catalog.");
                }

                return response.json();
            })
            .then((data) => {
                setResult({
                    requestKey,
                    meals: Array.isArray(data.content) ? data.content : [],
                    error: "",
                });
            })
            .catch((requestError) => {
                if (requestError.name !== "AbortError" && requestError.message !== "Session expired") {
                    setResult({
                        requestKey,
                        meals: [],
                        error: requestError.message || "Could not load the meal catalog.",
                    });
                }
            });

        return () => controller.abort();
    }, [category, requestKey, search]);

    const requestFinished = result.requestKey === requestKey;

    return {
        meals: requestFinished ? result.meals : [],
        loading: !requestFinished,
        error: requestFinished ? result.error : "",
    };
}
