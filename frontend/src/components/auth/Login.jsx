import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/authApi";
import { validateEmail, validatePassword } from "../../utils/validators";
import "../../styles/variables.css";
import "../../styles/login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    form: "",
  });

  const handleBlur = (field) => {
    const err =
      field === "email"
        ? validateEmail(email)
        : validatePassword(password);

    setErrors((prev) => ({
      ...prev,
      [field]: err,
    }));
  };

  const handleChange = (field, value) => {
    if (field === "email") {
      setEmail(value);
    } else {
      setPassword(value);
    }

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    if (emailErr || passErr) {
      setErrors({
        email: emailErr,
        password: passErr,
        form: "",
      });

      return;
    }

    setErrors({
      email: "",
      password: "",
      form: "",
    });

    setLoading(true);

    try {
      const response = await login({
        email,
        password,
      });

      console.log("Login successful:", response.data);

      // Store token
      localStorage.setItem("token", response.data.token);

      console.log("Token stored successfully");

      // Redirect to dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error("Login failed:", err);

      setErrors((prev) => ({
        ...prev,
        form:
          err.response?.data?.message ||
          "Invalid email or password",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Log in to your account</h2>
          <p>Access your API workspace</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              className={errors.email ? "error" : ""}
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                handleChange("email", e.target.value)
              }
              onBlur={() => handleBlur("email")}
            />

            {errors.email && (
              <p className="field-error">{errors.email}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              className={errors.password ? "error" : ""}
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                handleChange("password", e.target.value)
              }
              onBlur={() => handleBlur("password")}
            />

            {errors.password && (
              <p className="field-error">
                {errors.password}
              </p>
            )}
          </div>

          <button
            className="auth-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          {errors.form && (
            <p className="error-msg">{errors.form}</p>
          )}
        </form>

        <p className="signup-redirect">
          Don't have an account?{" "}
          <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;