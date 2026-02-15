// AdminDashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, Table, Container, Spinner, InputGroup, Form, Badge } from "react-bootstrap";
import ThemeToggle from "./ThemeToggle";

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusInputs, setStatusInputs] = useState({});
  const [assignedCategories, setAssignedCategories] = useState([]);
  const navigate = useNavigate();
  const adminId = localStorage.getItem("user_id");

  useEffect(() => {
    // Fetch admin's assigned categories
    const storedCategories = localStorage.getItem("categories");
    if (storedCategories) {
      setAssignedCategories(JSON.parse(storedCategories));
    }

    // Fetch complaints
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/complaints?admin_id=${adminId}`)
      .then((response) => {
        setComplaints(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching complaints:", error);
        setLoading(false);
      });
  }, [adminId]);

  const handleStatusChange = (complaintId, value) => {
    setStatusInputs((prev) => ({ ...prev, [complaintId]: value }));
  };

  const handleStatusUpdate = (complaintId) => {
    const status = statusInputs[complaintId];
    if (!status) {
      alert("Please enter a status update.");
      return;
    }

    axios
      .put(`${process.env.REACT_APP_API_BASE_URL}/complaints/${complaintId}/status`, {
        status,
        admin_id: adminId,
      })
      .then(() => {
        alert("Status updated successfully");
        setComplaints((prev) =>
          prev.map((complaint) =>
            complaint.complaint_id === complaintId
              ? { ...complaint, status }
              : complaint
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
    localStorage.removeItem("role");
    localStorage.removeItem("subrole");
    navigate("/");
  };

  return (
    <Container className="d-flex flex-column min-vh-100">
        <div className="d-flex justify-content-center mt-4">
          <img
            src="https://i.ibb.co/cXsYwrCh/core-ms-high-resolution-logo.png"
            alt="Logo"
            className="logo-img"
            style={{ width: "400px" }}
          />
      </div>

      <div className="flex-grow-1 d-flex flex-column align-items-center mt-3">
        <div className="w-100 px-2" style={{ maxWidth: "900px" }}>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
            <div>
              <h2 className="text-center text-md-start">Admin Dashboard</h2>
              <div className="mt-2">
                <small className="text-muted">Assigned Categories: </small>
                {assignedCategories.map(cat => (
                  <Badge key={cat.category_id} bg="primary" className="me-1">{cat.name}</Badge>
                ))}
              </div>
            </div>
            <Button variant="danger" className="mt-2 mt-md-0" onClick={handleLogout}>
              Logout
            </Button>
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
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint) => (
                    <tr key={complaint.complaint_id}>
                      <td>{complaint.complaint_id}</td>
                      <td>{complaint.title}</td>
                      <td>{complaint.category}</td>
                      <td>
                        {complaint.status}
                        {complaint.updated_by_admin && (
                          <span>
                            {" "}
                            (by{" "}
                            {complaint.admin_subrole
                              ? complaint.admin_subrole
                              : complaint.admin_username || `Admin ID: ${complaint.updated_by_admin}`}
                            )
                          </span>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="info"
                          className="btn-sm w-100 mb-2"
                          onClick={() =>
                            navigate(`/complaint/${complaint.complaint_id}`)
                          }
                        >
                          View Details
                        </Button>
                        <InputGroup className="mt-2">
                          <Form.Control
                            type="text"
                            placeholder="Update status"
                            value={statusInputs[complaint.complaint_id] || ""}
                            onChange={(e) =>
                              handleStatusChange(
                                complaint.complaint_id,
                                e.target.value
                              )
                            }
                          />
                          <Button
                            variant="success"
                            onClick={() =>
                              handleStatusUpdate(complaint.complaint_id)
                            }
                          >
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

      <footer className="text-center mt-auto py-3">
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

export default AdminDashboard;
