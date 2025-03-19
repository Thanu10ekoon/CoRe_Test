import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Card, Table, Button } from "react-bootstrap";

const UserDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("user_id"); // Dynamic user ID (from session or auth token)
    if (userId) {
      axios
        .get(`http://localhost:5000/api/complaints/user/${userId}`)
        .then((response) => {
          setComplaints(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching complaints:", error);
          setLoading(false);
        });
    } else {
      console.log("User ID not found in localStorage");
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    navigate("/");
  };

  return (
    <Container className="mt-5">
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <Card.Title>Your Complaints</Card.Title>
            <Button variant="danger" onClick={handleLogout}>Logout</Button>
          </div>
          <Button variant="primary" className="mb-3" onClick={() => navigate("/complaint/new")}>
            New Complaint
          </Button>
          {loading ? (
            <p>Loading complaints...</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length > 0 ? (
                  complaints.map((complaint) => (
                    <tr
                      key={complaint.complaint_id}
                      onClick={() => navigate(`/complaint/${complaint.complaint_id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{complaint.complaint_id}</td>
                      <td>{complaint.title}</td>
                      <td>{new Date(complaint.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">No complaints found.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserDashboard;
