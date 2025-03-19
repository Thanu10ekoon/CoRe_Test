import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/login", { username, password });
      if (response.data.type === "admin") {
        localStorage.setItem("user_id", response.data.user_id);  // Store user_id in localStorage
        navigate("/admin-dashboard");
      } else {
        localStorage.setItem("user_id", response.data.user_id);  // Store user_id in localStorage
        navigate("/user-dashboard");
      }
    } catch (error) {
      alert("Invalid credentials");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
