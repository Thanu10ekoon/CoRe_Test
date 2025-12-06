import React, { useState } from "react";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 4) {
      setError("Password must be at least 4 characters long");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/signup`,
        {
          username: formData.username,
          password: formData.password,
        }
      );

      if (response.data.message) {
        alert("Account created successfully! Please login.");
        navigate("/");
      }
    } catch (error) {
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
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
            <h2 className="text-center mb-4">Sign Up</h2>
            
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleSignup}>
              <Form.Group controlId="username">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength={3}
                />
              </Form.Group>

              <Form.Group controlId="password" className="mt-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={4}
                />
              </Form.Group>

              <Form.Group controlId="confirmPassword" className="mt-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={4}
                />
              </Form.Group>

              <Button 
                className="w-100 mt-4" 
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>
            </Form>

            <div className="text-center mt-3">
              <p>
                Already have an account?{" "}
                <Link to="/">Login</Link>
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

export default Signup;
