import React, { useState } from "react";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "user",
    subrole: "",
    adminPassword: "",
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

    // Admin password verification
    if (formData.role === "admin" && formData.adminPassword !== "RuhPass#1999") {
      setError("Invalid admin password");
      return;
    }

    // Admin must select subrole
    if (formData.role === "admin" && !formData.subrole) {
      setError("Please select a subrole for admin");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/signup`,
        {
          username: formData.username,
          password: formData.password,
          role: formData.role,
          subrole: formData.role === "admin" ? formData.subrole : "user",
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

              <Form.Group controlId="role" className="mt-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>

              {formData.role === "admin" && (
                <>
                  <Form.Group controlId="adminPassword" className="mt-3">
                    <Form.Label>Admin Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="adminPassword"
                      placeholder="Enter admin password"
                      value={formData.adminPassword}
                      onChange={handleChange}
                      required
                    />
                    <Form.Text className="text-muted">
                      Contact administrator for admin password
                    </Form.Text>
                  </Form.Group>

                  <Form.Group controlId="subrole" className="mt-3">
                    <Form.Label>Admin Position</Form.Label>
                    <Form.Select
                      name="subrole"
                      value={formData.subrole}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select position...</option>
                      <option value="Dean">Dean</option>
                      <option value="ComplaintsManager">Complaints Manager</option>
                      <option value="Warden">Warden (Hostel)</option>
                      <option value="AR">AR (Documentation)</option>
                      <option value="CanteenCordinator">Canteen Coordinator</option>
                      <option value="AcademicCordinator">Academic Coordinator</option>
                      <option value="SportCordinator">Sport Coordinator</option>
                      <option value="MaintainanceCordinator">Maintenance Coordinator</option>
                      <option value="Librarian">Librarian</option>
                      <option value="SecurityCordinator">Security Coordinator</option>
                      <option value="HOD_DEIE">HOD - DEIE</option>
                      <option value="HOD_DMME">HOD - DMME</option>
                      <option value="HOD_DIS">HOD - DIS</option>
                      <option value="HOD_DMENA">HOD - DMENA</option>
                      <option value="HOD_DCEE">HOD - DCEE</option>
                    </Form.Select>
                  </Form.Group>
                </>
              )}

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
