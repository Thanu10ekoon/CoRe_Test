// SuperAdminDashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, Table, Container, Spinner, InputGroup, Form, Card, Modal, Badge, Tab, Tabs } from "react-bootstrap";
import ThemeToggle from "./ThemeToggle";

const SuperAdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusInputs, setStatusInputs] = useState({});
  const [activeTab, setActiveTab] = useState("complaints");
  
  // Category management
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  
  // User role management
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  const navigate = useNavigate();
  const adminId = localStorage.getItem("user_id");

  useEffect(() => {
    fetchData();
  }, [adminId]);

  const fetchData = () => {
    setLoading(true);
    
    // Fetch complaints
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/complaints?admin_id=${adminId}`)
      .then(res => setComplaints(res.data))
      .catch(err => console.error("Error fetching complaints:", err));

    // Fetch users
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/users?admin_id=${adminId}`)
      .then(res => setUsers(res.data))
      .catch(err => console.error("Error fetching users:", err));

    // Fetch categories
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/categories`)
      .then(res => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching categories:", err);
        setLoading(false);
      });
  };

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

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      alert("Please enter a category name");
      return;
    }

    axios.post(`${process.env.REACT_APP_API_BASE_URL}/categories`, {
      name: newCategoryName,
      description: newCategoryDescription,
      admin_id: adminId
    })
    .then(() => {
      alert("Category created successfully");
      setNewCategoryName("");
      setNewCategoryDescription("");
      fetchData();
    })
    .catch(err => {
      alert(err.response?.data?.error || "Failed to create category");
    });
  };

  const handleDeleteCategory = (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    axios.delete(`${process.env.REACT_APP_API_BASE_URL}/categories/${categoryId}`, {
      data: { admin_id: adminId }
    })
    .then(() => {
      alert("Category deleted successfully");
      fetchData();
    })
    .catch(err => {
      alert(err.response?.data?.error || "Failed to delete category");
    });
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    // Parse existing categories
    if (user.categories) {
      const catNames = user.categories.split(',');
      const catIds = categories.filter(c => catNames.includes(c.name)).map(c => c.category_id);
      setSelectedCategories(catIds);
    } else {
      setSelectedCategories([]);
    }
    setShowUserModal(true);
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleUpdateUserRole = () => {
    if (selectedRole === "admin" && selectedCategories.length === 0) {
      alert("Admin must have at least one category assigned");
      return;
    }

    axios.put(`${process.env.REACT_APP_API_BASE_URL}/users/${selectedUser.user_id}/role`, {
      role: selectedRole,
      categories: selectedCategories,
      admin_id: adminId
    })
    .then(() => {
      alert("User role updated successfully");
      setShowUserModal(false);
      fetchData();
    })
    .catch(err => {
      alert(err.response?.data?.error || "Failed to update user role");
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'superadmin': return 'danger';
      case 'admin': return 'primary';
      case 'observer': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <Container className="d-flex flex-column min-vh-100">
        <div className="d-flex justify-content-center mt-4">
          <img
            className="logo-img"
            src="https://i.ibb.co/cXsYwrCh/core-ms-high-resolution-logo.png"
            alt="Logo"
            style={{ width: "400px" }}
          />
      </div>

      <div className="flex-grow-1 d-flex flex-column align-items-center mt-3">
        <div className="w-100 px-2" style={{ maxWidth: "1100px" }}>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
            <div>
              <h2 className="text-center text-md-start">Super Admin Dashboard</h2>
              <Badge bg="danger">Full Access</Badge>
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
            <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3">
              {/* Complaints Tab */}
              <Tab eventKey="complaints" title={`Complaints (${complaints.length})`}>
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
                          <td><Badge bg="info">{complaint.category}</Badge></td>
                          <td>
                            {complaint.status}
                            {complaint.updated_by_admin && (
                              <span className="text-muted">
                                {" "}(by {complaint.admin_username || `Admin ID: ${complaint.updated_by_admin}`})
                              </span>
                            )}
                          </td>
                          <td>
                            <Button
                              variant="info"
                              className="btn-sm w-100 mb-2"
                              onClick={() => navigate(`/complaint/${complaint.complaint_id}`)}
                            >
                              View Details
                            </Button>
                            <InputGroup className="mt-2">
                              <Form.Control
                                type="text"
                                placeholder="Update status"
                                value={statusInputs[complaint.complaint_id] || ""}
                                onChange={(e) => handleStatusChange(complaint.complaint_id, e.target.value)}
                              />
                              <Button
                                variant="success"
                                onClick={() => handleStatusUpdate(complaint.complaint_id)}
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
              </Tab>

              {/* Categories Tab */}
              <Tab eventKey="categories" title={`Categories (${categories.length})`}>
                <Card className="mb-3">
                  <Card.Header>Create New Category</Card.Header>
                  <Card.Body>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Category name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                      <Form.Control
                        type="text"
                        placeholder="Description (optional)"
                        value={newCategoryDescription}
                        onChange={(e) => setNewCategoryDescription(e.target.value)}
                      />
                      <Button variant="primary" onClick={handleCreateCategory}>
                        Create
                      </Button>
                    </InputGroup>
                  </Card.Body>
                </Card>

                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.category_id}>
                        <td>{cat.category_id}</td>
                        <td>{cat.name}</td>
                        <td>{cat.description || "-"}</td>
                        <td>
                          <Button
                            variant="danger"
                            className="btn-sm"
                            onClick={() => handleDeleteCategory(cat.category_id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab>

              {/* Users Tab */}
              <Tab eventKey="users" title={`Users (${users.length})`}>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Categories</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.user_id}>
                        <td>{user.user_id}</td>
                        <td>{user.username}</td>
                        <td>
                          <Badge bg={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                        </td>
                        <td>
                          {user.categories ? user.categories.split(',').map((cat, idx) => (
                            <Badge key={idx} bg="secondary" className="me-1">{cat}</Badge>
                          )) : "-"}
                        </td>
                        <td>
                          <Button
                            variant="primary"
                            className="btn-sm"
                            onClick={() => openUserModal(user)}
                          >
                            Change Role
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab>
            </Tabs>
          )}
        </div>
      </div>

      {/* User Role Edit Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User: {selectedUser?.username}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Role</Form.Label>
            <Form.Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
              <option value="user">User</option>
              <option value="observer">Observer</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </Form.Select>
          </Form.Group>

          {selectedRole === "admin" && (
            <Form.Group className="mb-3">
              <Form.Label>Assign Categories</Form.Label>
              <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ced4da", borderRadius: "4px", padding: "10px" }}>
                {categories.map(cat => (
                  <Form.Check
                    key={cat.category_id}
                    type="checkbox"
                    id={`modal-cat-${cat.category_id}`}
                    label={cat.name}
                    checked={selectedCategories.includes(cat.category_id)}
                    onChange={() => handleCategoryToggle(cat.category_id)}
                  />
                ))}
              </div>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateUserRole}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

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

export default SuperAdminDashboard;
