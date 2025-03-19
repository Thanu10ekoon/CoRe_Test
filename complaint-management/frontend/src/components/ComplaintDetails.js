import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch complaint details by ID.
    axios.get(`http://localhost:5000/api/complaints/${id}`)
      .then((response) => {
        if (response.data) {
          setComplaint(response.data);
        } else {
          console.error("Complaint not found.");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching complaint:", error);
        setLoading(false);
      });
  }, [id]);

  return (
    <div>
      {loading ? (
        <p>Loading complaint details...</p>
      ) : complaint ? (
        <>
          <h2>{complaint.title}</h2>
          <p>{complaint.description}</p>
          <p>Status: {complaint.status}</p>
          <p>
            Updated By:{" "}
            {complaint.admin_username
              ? complaint.admin_username
              : "N/A"}
          </p>
        </>
      ) : (
        <p>Complaint not found.</p>
      )}
    </div>
  );
};

export default ComplaintDetails;
