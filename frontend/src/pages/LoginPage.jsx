// src/pages/LoginPage.jsx
import React, { useState } from "react";
import apiFetch from "../services/api";

function LoginPage({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      // Save token
      localStorage.setItem("token", res.access_token);

      // notify parent
      onLoginSuccess(res.access_token);
    } catch (err) {
      console.error("Login failed:", err);
      alert("Login failed: " + err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don’t have an account?{" "}
        <button onClick={onSwitchToRegister}>Register</button>
      </p>
    </div>
  );
}

export default LoginPage;