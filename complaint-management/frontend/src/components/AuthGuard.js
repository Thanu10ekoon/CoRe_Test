import React from "react";
import { Navigate } from "react-router-dom";

const AuthGuard = ({ role, children }) => {
  const userId = localStorage.getItem("user_id");
  const userRole = localStorage.getItem("user_role");

  console.log("AuthGuard: userId =", userId, ", userRole =", userRole); // Debugging

  if (!userId) {
    console.log("Redirecting to login: No user ID found");
    return <Navigate to="/" replace />;
  }

  if (role && userRole !== role) {
    console.log("Redirecting to unauthorized: Role mismatch");
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default AuthGuard;
