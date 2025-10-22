import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ComplaintDetails from "./components/ComplaintDetails";
import NewComplaint from "./components/NewComplaint";
import Unauthorized from "./components/Unauthorized"; // Unauthorized page
import AuthGuard from "./components/AuthGuard"; // Import the AuthGuard
// import Chatbot from "./Chatbot"; // Chatbot commented out - not used in mobile

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/user-dashboard" 
          element={
            <AuthGuard allowedRoles={["user"]}>
              <UserDashboard />
            </AuthGuard>
          } 
        />
        <Route 
          path="/admin-dashboard" 
          element={
            <AuthGuard allowedRoles={["admin"]}>
              <AdminDashboard />
            </AuthGuard>
          } 
        />
        <Route path="/complaint/:id" element={<ComplaintDetails />} />
        <Route path="/complaint/new" element={<NewComplaint />} />
        <Route path="/unauthorized" element={<Unauthorized />} /> {/* Unauthorized page */}
      </Routes>
    </Router>
  );
}

export default App;
