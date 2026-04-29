import LoginForm from "./LoginForm";
import "./login.css";

function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Log in</h2>
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;

