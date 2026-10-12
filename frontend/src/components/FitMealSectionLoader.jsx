export default function FitMealSectionLoader({ label }) {
    return (
        <section className="fitmeal-section-loader">
            <div className="fitmeal-loader-ring"></div>
            <p>{label || "Loading FitMeal section..."}</p>
        </section>
    );
}
