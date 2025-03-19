import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ComplaintDetails from "./components/ComplaintDetails";
import NewComplaint from "./components/NewComplaint";  // ✅ Import NewComplaint page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/complaint/:id" element={<ComplaintDetails />} />
        <Route path="/complaint/new" element={<NewComplaint />} />  {/* ✅ New Complaint Route */}
      </Routes>
    </Router>
  );
}

export default App;
