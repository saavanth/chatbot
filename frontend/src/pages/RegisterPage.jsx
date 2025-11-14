// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import apiFetch from "../services/api";

function RegisterPage({ onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email }),
      });

      alert("Registration successful ✅. Please login.");
      onSwitchToLogin();
    } catch (err) {
      console.error("Register failed:", err);
      alert("Register failed: " + err.message);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account?{" "}
        <button onClick={onSwitchToLogin}>Login</button>
      </p>
    </div>
  );
}

export default RegisterPage;