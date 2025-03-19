import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch complaint details
        const complaintResponse = await axios.get(`http://localhost:5000/api/complaints/${id}`);
        setComplaint(complaintResponse.data);

        // Fetch full history of status updates for this complaint
        const updatesResponse = await axios.get(`http://localhost:5000/api/statusupdates/${id}`);
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
    <div>
      {loading ? (
        <p>Loading complaint details...</p>
      ) : complaint ? (
        <div>
          <h2>{complaint.title}</h2>
          <p>{complaint.description}</p>
          <p>Status: {complaint.status}</p>
          <p>
            Updated By:{" "}
            {complaint.admin_username ? complaint.admin_username : "N/A"}
          </p>
          <h3>Status Update History</h3>
          {updates.length > 0 ? (
            <ul>
              {updates.map((update) => (
                <li key={update.update_id}>
                  {update.update_text} - Updated by{" "}
                  {update.admin_username ? update.admin_username : update.admin_id}{" "}
                  on {new Date(update.update_date).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>No status updates found.</p>
          )}
        </div>
      ) : (
        <p>Complaint not found.</p>
      )}
    </div>
  );
};

export default ComplaintDetails;
