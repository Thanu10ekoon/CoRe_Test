import React, { useState } from "react";
import { Form, Button, Container, Card } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/login`,
        { username, password }
      );

      // Expect response to include user_id, username, role, and subrole.
      if (response.data.user_id && response.data.role) {
        localStorage.setItem("user_id", response.data.user_id);
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("role", response.data.role.toLowerCase());
        localStorage.setItem("subrole", response.data.subrole);

        // Navigate based on role
        if (response.data.role.toLowerCase() === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      } else {
        throw new Error("Invalid response data");
      }
    } catch (error) {
      alert("Invalid credentials");
    }
  };

  return (
    <Container
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <img
        src="https://i.ibb.co/cXsYwrCh/core-ms-high-resolution-logo.png"
        alt="Logo"
        style={{ width: "400px", marginTop: "-50px", marginBottom: "-10px" }}
      />

      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Login</h2>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              <Form.Group controlId="username">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group controlId="password" className="mt-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Button className="w-100 mt-4" type="submit">
                Login
              </Button>
            </Form>

            <div className="text-center mt-3">
              <p>
                Don't have an account?{" "}
                <Link to="/signup">Sign Up</Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>

      <footer className="text-center mt-4">
        <p>
          Developed by{" "}
          <a
            href="https://scorpion-xweb.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Scorpion X
          </a>
        </p>
      </footer>
    </Container>
  );
};

export default Login;
