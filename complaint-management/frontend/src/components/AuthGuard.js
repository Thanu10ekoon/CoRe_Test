// AuthGuard.js
import React from "react";
import { Navigate } from "react-router-dom";

const AuthGuard = ({ children, allowedRoles }) => {
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("user_id");

  // If no user ID or role is in localStorage, treat it as unauthorized
  if (!userId || !role) {
    return <Navigate to="/unauthorized" />;
  }

  // Check if the user's role matches the allowed roles (if provided)
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" />;
  }

  // Otherwise, render the protected component
  return children;
};

export default AuthGuard;
