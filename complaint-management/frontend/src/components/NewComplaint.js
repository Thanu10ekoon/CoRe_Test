// NewComplaint.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button } from "react-bootstrap";

const NewComplaint = () => {
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [complaintCategory, setComplaintCategory] = useState(""); // New state for category
  const [categories, setCategories] = useState([]); // Categories from API
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Fetch categories on mount
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/categories`)
      .then(res => setCategories(res.data))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("File size should be less than 5MB");
        return;
      }
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
        setErrorMessage("Only image files (JPEG, PNG, GIF) are allowed");
        return;
      }
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("user_id") || 1;

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("title", complaintTitle);
    formData.append("description", complaintDescription);
    formData.append("category", complaintCategory);
    if (selectedPhoto) {
      formData.append("photo", selectedPhoto);
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/complaints`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      if (response.status === 200) {
        alert("Complaint submitted successfully!");
        navigate("/user-dashboard");
      }
    } catch (error) {
      setErrorMessage(
        error.response ? error.response.data.error : "Error submitting complaint"
      );
    }
  };

  return (
    <Container className="mt-5">
      <Card>
        <Card.Body>
          <Card.Title>Submit a New Complaint</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="complaintTitle" className="mb-3">
              <Form.Label>Complaint Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter complaint title"
                value={complaintTitle}
                onChange={(e) => setComplaintTitle(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="complaintDescription" className="mb-3">
              <Form.Label>Complaint Description</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Enter complaint description"
                rows={4}
                value={complaintDescription}
                onChange={(e) => setComplaintDescription(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="complaintCategory" className="mb-3">
              <Form.Label>Complaint Category</Form.Label>
              <Form.Select
                value={complaintCategory}
                onChange={(e) => setComplaintCategory(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.name}>{cat.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="complaintPhoto" className="mb-3">
              <Form.Label>Upload Photo (Optional)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              <Form.Text className="text-muted">
                Maximum file size: 5MB. Supported formats: JPEG, PNG, GIF
              </Form.Text>
              {photoPreview && (
                <div className="mt-3">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                  />
                </div>
              )}
            </Form.Group>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <Button variant="primary" type="submit">
              Submit Complaint
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NewComplaint;
