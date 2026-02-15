// ObserverDashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Card, Table, Button, Tab, Tabs, Badge, Spinner } from "react-bootstrap";

const ObserverDashboard = () => {
  const [myComplaints, setMyComplaints] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my-complaints");
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (userId) {
      // Fetch user's own complaints
      axios
        .get(`${process.env.REACT_APP_API_BASE_URL}/complaints/user/${userId}`)
        .then((response) => {
          setMyComplaints(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user complaints:", error);
        });

      // Fetch all complaints (observer can view all)
      axios
        .get(`${process.env.REACT_APP_API_BASE_URL}/complaints?admin_id=${userId}`)
        .then((response) => {
          setAllComplaints(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching all complaints:", error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
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
        <div className="w-100 px-2" style={{ maxWidth: "900px" }}>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
            <div>
              <h2 className="text-center text-md-start">Observer Dashboard</h2>
              <Badge bg="info">Read-Only Access to All Complaints</Badge>
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
              {/* My Complaints Tab */}
              <Tab eventKey="my-complaints" title={`My Complaints (${myComplaints.length})`}>
                <Card>
                  <Card.Body>
                    <Button
                      variant="primary"
                      className="mb-3"
                      onClick={() => navigate("/complaint/new")}
                    >
                      New Complaint
                    </Button>
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myComplaints.length > 0 ? (
                          myComplaints.map((complaint) => (
                            <tr
                              key={complaint.complaint_id}
                              onClick={() => navigate(`/complaint/${complaint.complaint_id}`)}
                              style={{ cursor: "pointer" }}
                            >
                              <td>{complaint.complaint_id}</td>
                              <td>{complaint.title}</td>
                              <td><Badge bg="secondary">{complaint.category}</Badge></td>
                              <td>{complaint.status}</td>
                              <td>{new Date(complaint.created_at).toLocaleString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center">
                              No complaints found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Tab>

              {/* All Complaints Tab (Read-Only) */}
              <Tab eventKey="all-complaints" title={`All Complaints (${allComplaints.length})`}>
                <Card>
                  <Card.Body>
                    <Card.Subtitle className="mb-3 text-muted">
                      View-only access to all complaints across all categories
                    </Card.Subtitle>
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th>Last Updated By</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allComplaints.length > 0 ? (
                          allComplaints.map((complaint) => (
                            <tr
                              key={complaint.complaint_id}
                              onClick={() => navigate(`/complaint/${complaint.complaint_id}`)}
                              style={{ cursor: "pointer" }}
                            >
                              <td>{complaint.complaint_id}</td>
                              <td>{complaint.title}</td>
                              <td><Badge bg="info">{complaint.category}</Badge></td>
                              <td>{complaint.status}</td>
                              <td>
                                {complaint.admin_username 
                                  ? complaint.admin_username 
                                  : complaint.updated_by_admin 
                                    ? `Admin ID: ${complaint.updated_by_admin}` 
                                    : "-"}
                              </td>
                              <td>{new Date(complaint.created_at).toLocaleString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center">
                              No complaints found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Tab>
            </Tabs>
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

export default ObserverDashboard;
