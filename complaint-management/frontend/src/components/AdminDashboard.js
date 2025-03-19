import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, Table, Container, Spinner, InputGroup, Form } from "react-bootstrap";

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusInputs, setStatusInputs] = useState({});
  const navigate = useNavigate();

  // Retrieve admin ID from localStorage
  const adminId = localStorage.getItem("user_id");

  useEffect(() => {
    axios.get("http://localhost:5000/api/complaints")
      .then((response) => {
        setComplaints(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching complaints:", error);
        setLoading(false);
      });
  }, []);

  const handleStatusChange = (complaintId, value) => {
    setStatusInputs((prev) => ({ ...prev, [complaintId]: value }));
  };

  const handleStatusUpdate = (complaintId) => {
    const status = statusInputs[complaintId];
    if (!status) {
      alert("Please enter a status update.");
      return;
    }

    axios.put(`http://localhost:5000/api/complaints/${complaintId}/status`, {
      status,
      admin_id: adminId, // Pass the correct admin ID
    })
      .then(() => {
        alert("Status updated successfully");
        setComplaints((prev) =>
          prev.map((complaint) =>
            complaint.complaint_id === complaintId ? { ...complaint, status } : complaint
          )
        );
        setStatusInputs((prev) => ({ ...prev, [complaintId]: "" }));
      })
      .catch((error) => {
        console.error("Error updating status:", error);
        alert("Failed to update status.");
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    navigate("/"); // Redirect to login page
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Admin Dashboard</h2>
        <Button variant="danger" onClick={handleLogout}>Logout</Button>
      </div>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint) => (
              <tr key={complaint.complaint_id}>
                <td>{complaint.complaint_id}</td>
                <td>{complaint.title}</td>
                <td>
                  {complaint.status}
                  {complaint.updated_by_admin && <span> (by Admin ID: {complaint.updated_by_admin})</span>}
                </td>
                <td>
                  <Button variant="info" onClick={() => navigate(`/complaint/${complaint.complaint_id}`)}>
                    View Details
                  </Button>{" "}
                  <InputGroup className="mt-2">
                    <Form.Control
                      type="text"
                      placeholder="Update status"
                      value={statusInputs[complaint.complaint_id] || ""}
                      onChange={(e) => handleStatusChange(complaint.complaint_id, e.target.value)}
                    />
                    <Button variant="success" onClick={() => handleStatusUpdate(complaint.complaint_id)}>
                      Update
                    </Button>
                  </InputGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default AdminDashboard;
