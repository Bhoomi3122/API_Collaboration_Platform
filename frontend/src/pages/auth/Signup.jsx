import { useState } from "react";
import { signup } from "../../services/authApi";
import "../../styles/variables.css";
import "../../components/auth/Signup.css";

const passwordRules = [
  { label: "Uppercase", test: (v) => /[A-Z]/.test(v) },
  { label: "Lowercase", test: (v) => /[a-z]/.test(v) },
  { label: "Number", test: (v) => /[0-9]/.test(v) },
  { label: "Special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
  { label: "Min 8 chars", test: (v) => v.length >= 8 },
];

function validateForm(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Invalid email format";
  if (!form.password) errors.password = "Password is required";
  else if (!passwordRules.every((r) => r.test(form.password)))
    errors.password = "Password does not meet all requirements";
  if (form.password !== form.confirmPassword)
    errors.confirmPassword = "Passwords do not match";
  return errors;
}

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await signup({ name: form.name, email: form.email, password: form.password });
      setMessage({ type: "success", text: "Account created successfully!" });
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (err) {
      const text =
        err.response?.data?.message || err.response?.data?.error || "Signup failed. Please try again.";
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <form className="signup-card" onSubmit={handleSubmit} noValidate>
        <h1>Create your account</h1>
        <p className="subtitle">Start collaborating on APIs</p>

        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            className={errors.name ? "input-error" : ""}
            placeholder="Your full name"
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={errors.email ? "input-error" : ""}
            placeholder="you@example.com"
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className={errors.password ? "input-error" : ""}
            placeholder="Create a password"
          />
          <div className="password-rules">
            {passwordRules.map((rule) => (
              <span key={rule.label} className={rule.test(form.password) ? "met" : ""}>
                {rule.test(form.password) ? "✔" : "○"} {rule.label}
              </span>
            ))}
          </div>
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? "input-error" : ""}
            placeholder="Repeat your password"
          />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
        </div>

        <button className="signup-btn" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </button>

        {message && (
          <p className={`message ${message.type}`}>{message.text}</p>
        )}

        <p className="login-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
}

