import { useState } from "react";

function SupportLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === "support@quiklee.com" && password === "support123") {
      localStorage.setItem("isSupportLoggedIn", "true");
      onLogin();
      setError("");
    } else {
      setError("Invalid support login credentials");
    }
  };

  return (
    <section className="page-card login-card">
      <h2>Support Login</h2>
      <p className="page-subtitle">
        Login to access complaint history, resolution management, and analytics.
      </p>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleLogin}>
        <label>Support Email</label>
        <input
          type="email"
          placeholder="support@quiklee.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="support123"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>

      <div className="login-hint">
        <strong>Demo Login:</strong>
        <p>Email: support@quiklee.com</p>
        <p>Password: support123</p>
      </div>
    </section>
  );
}

export default SupportLogin;