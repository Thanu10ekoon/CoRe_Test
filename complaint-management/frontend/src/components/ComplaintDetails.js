import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Container, Card, ListGroup, Spinner, Alert } from "react-bootstrap";

const ComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const complaintResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/complaints/${id}`
        );
        setComplaint(complaintResponse.data);

        const updatesResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/statusupdates/${id}`
        );
        setUpdates(updatesResponse.data);
      } catch (error) {
        console.error("Error fetching complaint details or status updates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <Container className="d-flex flex-column min-vh-100">
      <div className="d-flex justify-content-center mt-4">
        <img
          src="https://i.ibb.co/cXsYwrCh/core-ms-high-resolution-logo.png"
          alt="Logo"
          style={{ width: "300px", margin: "-50px" }}
        />
      </div>

      <div className="flex-grow-1 d-flex flex-column align-items-center mt-3">
        <div className="w-100 px-2" style={{ maxWidth: "800px" }}>
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" />
              <p>Loading complaint details...</p>
            </div>
          ) : complaint ? (
            <Card className="shadow">
              <Card.Body>
                {complaint.photo_url && (
                  <div className="text-center mb-3">
                    <img src={complaint.photo_url} alt="Complaint" style={{ maxWidth: '100%', maxHeight: 400 }} />
                  </div>
                )}
                <Card.Title className="text-primary">{complaint.title}</Card.Title>
                <Card.Text>{complaint.description}</Card.Text>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <strong>Status:</strong> {complaint.status}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Updated By:</strong>{" "}
                    {complaint.admin_username ? complaint.admin_username : "N/A"}
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          ) : (
            <Alert variant="danger">Complaint not found.</Alert>
          )}

          <h4 className="mt-4">Status Update History</h4>
          {updates.length > 0 ? (
            <ListGroup>
              {updates.map((update) => (
                <ListGroup.Item key={update.update_id}>
                  <strong>{update.update_text}</strong> - Updated by{" "}
                  {update.admin_username ? update.admin_username : update.admin_id}{" "}
                  on {new Date(update.update_date).toLocaleString()}
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <Alert variant="warning" className="mt-3">
              No status updates found.
            </Alert>
          )}
        </div>
      </div>

      <footer className="text-center mt-auto py-3">
        <p>
          Developed by{" "}
          <a href="https://scorpion-xweb.vercel.app/" target="_blank" rel="noopener noreferrer">
            Scorpion X
          </a>
        </p>
      </footer>
    </Container>
  );
};

export default ComplaintDetails;