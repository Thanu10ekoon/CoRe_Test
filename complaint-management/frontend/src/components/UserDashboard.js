import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("user_id"); // Dynamic user ID (from session or auth token)

    if (userId) {
      // Fetch complaints for the specific user
      axios
        .get(`http://localhost:5000/api/complaints/user/${userId}`)
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

  return (
    <div>
      <h2>Your Complaints</h2>
      <button onClick={() => navigate("/complaint/new")}>New Complaint</button>

      {loading ? (
        <p>Loading complaints...</p>
      ) : (
        <table>
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
                >
                  <td>{complaint.complaint_id}</td>
                  <td>{complaint.title}</td>
                  <td>{new Date(complaint.created_at).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No complaints found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserDashboard;
