import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Card, Table, Button } from "react-bootstrap";
import Chatbot from "../Chatbot";

const UserDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      axios
        .get(`${process.env.REACT_APP_API_BASE_URL}/complaints/user/${userId}`)
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
    <Container className="d-flex flex-column min-vh-100">
      <div className="d-flex justify-content-center mt-4">
        <img
          src="https://i.ibb.co/cXsYwrCh/core-ms-high-resolution-logo.png"
          alt="Logo"
          style={{ width: "400px" }}
        />
      </div>

      <div className="flex-grow-1 d-flex flex-column align-items-center mt-3">
        <Card className="w-100" style={{ maxWidth: "800px" }}>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <Card.Title>Your Complaints</Card.Title>
              <Button variant="danger" onClick={handleLogout}>Logout</Button>
            </div>
            <Button
              variant="primary"
              className="mb-3"
              onClick={() => navigate("/complaint/new")}
            >
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
                        onClick={() =>
                          navigate(`/complaint/${complaint.complaint_id}`)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <td>{complaint.complaint_id}</td>
                        <td>{complaint.title}</td>
                        <td>
                          {new Date(complaint.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center">
                        No complaints found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </div>

      <footer className="text-center mt-auto py-3">
        <p>
          Developed by{" "}
          <a
            href="https://github.com/Thanu10ekoon"
            target="_blank"
            rel="noopener noreferrer"
          >
            Scorpion X
          </a>
        </p>
      </footer>

      <Chatbot userType="user" />
    </Container>
  );
};

export default UserDashboard;