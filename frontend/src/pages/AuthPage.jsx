export default function AuthPage({ view }) {
    const {
        authData, authError, authLoading, authMode, authSuccess, getAuthButtonText,
        handleAuthChange, handleAuthSubmit, logoPath, passwordInputType,
        passwordVisible, switchAuthMode, togglePasswordVisibility
    } = view;

    return (
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
    );
}
