import React, { useState, useEffect } from "react";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "../components/ThemeToggle";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "user",
    selectedCategories: [],
    adminPassword: "",
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch categories on mount
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/categories`)
      .then(res => setCategories(res.data))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleCategoryChange = (categoryId) => {
    const catId = parseInt(categoryId);
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(catId)
        ? prev.selectedCategories.filter(id => id !== catId)
        : [...prev.selectedCategories, catId]
    }));
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

    // Admin/SuperAdmin/Observer password verification
    if (["admin", "superadmin", "observer"].includes(formData.role)) {
      if (formData.role === "superadmin" && formData.adminPassword !== "SuperRuhPass#2024") {
        setError("Invalid super admin password");
        return;
      }
      if (formData.role === "admin" && formData.adminPassword !== "RuhPass#1999") {
        setError("Invalid admin password");
        return;
      }
      if (formData.role === "observer" && formData.adminPassword !== "ObserverPass#2024") {
        setError("Invalid observer password");
        return;
      }
    }

    // Admin must select at least one category
    if (formData.role === "admin" && formData.selectedCategories.length === 0) {
      setError("Please select at least one category for admin");
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
          categories: formData.role === "admin" ? formData.selectedCategories : [],
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
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
        <img
          src="https://i.ibb.co/cXsYwrCh/core-ms-high-resolution-logo.png"
          alt="Logo"
          className="logo-img"
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
                  <option value="observer">Observer</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </Form.Select>
              </Form.Group>

              {["admin", "superadmin", "observer"].includes(formData.role) && (
                <Form.Group controlId="adminPassword" className="mt-3">
                  <Form.Label>
                    {formData.role === "superadmin" ? "Super Admin" : 
                     formData.role === "observer" ? "Observer" : "Admin"} Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="adminPassword"
                    placeholder={`Enter ${formData.role} password`}
                    value={formData.adminPassword}
                    onChange={handleChange}
                    required
                  />
                  <Form.Text className="text-muted">
                    Contact administrator for the password
                  </Form.Text>
                </Form.Group>
              )}

              {formData.role === "admin" && (
                <Form.Group controlId="categories" className="mt-3">
                  <Form.Label>Assigned Categories (Select one or more)</Form.Label>
                  <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ced4da", borderRadius: "4px", padding: "10px" }}>
                    {categories.map(cat => (
                      <Form.Check
                        key={cat.category_id}
                        type="checkbox"
                        id={`cat-${cat.category_id}`}
                        label={cat.name}
                        checked={formData.selectedCategories.includes(cat.category_id)}
                        onChange={() => handleCategoryChange(cat.category_id)}
                      />
                    ))}
                  </div>
                  <Form.Text className="text-muted">
                    You will only see complaints from selected categories
                  </Form.Text>
                </Form.Group>
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
