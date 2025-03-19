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
        // Fetch complaint details
        const complaintResponse = await axios.get(
          `http://localhost:5000/api/complaints/${id}`
        );
        setComplaint(complaintResponse.data);

        // Fetch full history of status updates for this complaint
        const updatesResponse = await axios.get(
          `http://localhost:5000/api/statusupdates/${id}`
        );
        setUpdates(updatesResponse.data);
      } catch (error) {
        console.error(
          "Error fetching complaint details or status updates:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <Container className="mt-4">
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Loading complaint details...</p>
        </div>
      ) : complaint ? (
        <Card>
          <Card.Body>
            <Card.Title>{complaint.title}</Card.Title>
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
    </Container>
  );
};

export default ComplaintDetails;
