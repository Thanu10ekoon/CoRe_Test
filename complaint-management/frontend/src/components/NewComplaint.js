// NewComplaint.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button } from "react-bootstrap";

const NewComplaint = () => {
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [complaintCategory, setComplaintCategory] = useState(""); // New state for category
  const [errorMessage, setErrorMessage] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("user_id") || 1;

    let photo_url = null;
    try {
      if (photoFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('photo', photoFile);
        const uploadResp = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        photo_url = uploadResp.data.fileUrl;
      }
    } catch (err) {
      setUploading(false);
      setErrorMessage('Photo upload failed');
      return;
    } finally {
      setUploading(false);
    }

    const complaintData = {
      user_id: userId,
      title: complaintTitle,
      description: complaintDescription,
      category: complaintCategory,
      photo_url
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/complaints`,
        complaintData
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
                <option value="Hostel">Hostel</option>
                <option value="Canteen">Canteen</option>
                <option value="Academic">Academic</option>
                <option value="Sports">Sports</option>
                <option value="Maintainance">Maintainance</option>
                <option value="Library">Library</option>
                <option value="Security">Security</option>
                <option value="Documentation">Documentation</option>
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="complaintPhoto" className="mb-3">
              <Form.Label>Photo (optional)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files[0])}
              />
            </Form.Group>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <Button variant="primary" type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Submit Complaint'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NewComplaint;
