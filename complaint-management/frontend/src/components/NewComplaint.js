import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NewComplaint = () => {
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Replace with dynamic user ID based on logged-in user
    const userId = 1; // Example: userId should be retrieved from the logged-in session or token

    // Prepare data to send in the POST request
    const complaintData = {
      user_id: userId,
      title: complaintTitle,
      description: complaintDescription,
    };

    try {
      // Send POST request to backend to submit complaint
      const response = await axios.post("http://localhost:5000/api/complaints", complaintData);

      if (response.status === 200) {
        alert("Complaint submitted successfully!");
        navigate("/user-dashboard"); // Navigate back to dashboard after successful submission
      }
    } catch (error) {
      // Display error message if request fails
      setErrorMessage(error.response ? error.response.data.error : "Error submitting complaint");
    }
  };

  return (
    <div>
      <h2>Submit a New Complaint</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Complaint Title:</label>
          <input
            type="text"
            value={complaintTitle}
            onChange={(e) => setComplaintTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Complaint Description:</label>
          <textarea
            value={complaintDescription}
            onChange={(e) => setComplaintDescription(e.target.value)}
            required
          />
        </div>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        <button type="submit">Submit Complaint</button>
      </form>
    </div>
  );
};

export default NewComplaint;
