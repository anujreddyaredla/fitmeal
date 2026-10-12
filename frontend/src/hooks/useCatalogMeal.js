import { useEffect, useRef, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function useCatalogMeal({ slug, onUnauthorized }) {
    const [result, setResult] = useState({
        slug: "",
        meal: null,
        error: "",
    });
    const unauthorizedHandler = useRef(onUnauthorized);

    useEffect(() => {
        unauthorizedHandler.current = onUnauthorized;
    }, [onUnauthorized]);

    useEffect(() => {
        const controller = new AbortController();
        const token = localStorage.getItem("fitMealToken") || "";

        fetch(`${API_BASE_URL}/api/catalog/meals/${encodeURIComponent(slug)}`, {
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
                    throw new Error(data.message || "Could not load this recipe.");
                }

                return response.json();
            })
            .then((meal) => {
                setResult({ slug, meal, error: "" });
            })
            .catch((requestError) => {
                if (requestError.name !== "AbortError" && requestError.message !== "Session expired") {
                    setResult({
                        slug,
                        meal: null,
                        error: requestError.message || "Could not load this recipe.",
                    });
                }
            });

        return () => controller.abort();
    }, [slug]);

    const requestFinished = result.slug === slug;

    return {
        meal: requestFinished ? result.meal : null,
        loading: !requestFinished,
        error: requestFinished ? result.error : "",
    };
}
