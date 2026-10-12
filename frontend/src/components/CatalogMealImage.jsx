import { useState } from "react";
import "./CatalogMealImage.css";

export default function CatalogMealImage({ meal, className = "", priority = false }) {
    const [failedImagePath, setFailedImagePath] = useState("");
    const imageFailed = failedImagePath === meal.imagePath;

    if (imageFailed || !meal.imagePath) {
        return (
            <div
                className={`catalog-image-fallback ${meal.category.toLowerCase()} ${className}`}
                role="img"
                aria-label={`${meal.name} image placeholder`}
            >
                <img src="/images/fitmeal-logo.png" alt="" />
                <span>{meal.category}</span>
            </div>
        );
    }

    return (
        <img
            className={`catalog-meal-image ${className}`}
            src={meal.imagePath}
            alt={meal.name}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            loading={priority ? "eager" : "lazy"}
            onError={() => setFailedImagePath(meal.imagePath)}
        />
    );
}
