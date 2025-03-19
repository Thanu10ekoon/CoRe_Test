import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusInputs, setStatusInputs] = useState({}); // Track individual status inputs
  const [adminId] = useState(1); // For now, hardcoded admin ID (update as needed)
  const navigate = useNavigate();

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
      .then((response) => {
        alert("Status updated successfully");
        // Update the complaint's status locally
        setComplaints((prev) =>
          prev.map((complaint) =>
            complaint.complaint_id === complaintId ? { ...complaint, status } : complaint
          )
        );
        // Clear the status input for that complaint
        setStatusInputs((prev) => ({ ...prev, [complaintId]: "" }));
      })
      .catch((error) => {
        console.error("Error updating status:", error);
        alert("Failed to update status. Check console for details.");
      });
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {loading ? (
        <p>Loading complaints...</p>
      ) : (
        <table border="1" cellPadding="5">
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
                  {complaint.admin_username && (
                    <span> (by {complaint.admin_username})</span>
                  )}
                </td>
                <td>
                  <button onClick={() => navigate(`/complaint/${complaint.complaint_id}`)}>
                    View Details
                  </button>
                  <input
                    type="text"
                    placeholder="Update status"
                    value={statusInputs[complaint.complaint_id] || ""}
                    onChange={(e) => handleStatusChange(complaint.complaint_id, e.target.value)}
                  />
                  <button onClick={() => handleStatusUpdate(complaint.complaint_id)}>
                    Update Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
