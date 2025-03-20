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
      admin_id: adminId,
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
    navigate("/");
  };

  return (
    <Container className="d-flex flex-column min-vh-100">
      {/* Logo */}
      <div className="d-flex justify-content-center mt-4">
        <img src="https://i.ibb.co/cXsYwrCh/core-ms-high-resolution-logo.png" alt="Logo" style={{ width: "400px" }} />
      </div>

      {/* Dashboard Content */}
      <div className="flex-grow-1 d-flex flex-column align-items-center mt-3">
        <div className="w-100 px-2" style={{ maxWidth: "900px" }}>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
            <h2 className="text-center text-md-start">Admin Dashboard</h2>
            <Button variant="danger" className="mt-2 mt-md-0" onClick={handleLogout}>Logout</Button>
          </div>

          {loading ? (
            <div className="d-flex justify-content-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <div className="table-responsive">
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
                        <Button 
                          variant="info" 
                          className="btn-sm w-100 mb-2" 
                          onClick={() => navigate(`/complaint/${complaint.complaint_id}`)}
                        >
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
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center mt-auto py-3">
        <p>
          Developed by{" "}
          <a href="https://github.com/Thanu10ekoon" target="_blank" rel="noopener noreferrer">
            Scorpion X
          </a>
        </p>
      </footer>
    </Container>
  );
};

export default AdminDashboard;
