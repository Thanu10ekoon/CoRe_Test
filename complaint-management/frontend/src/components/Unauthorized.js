import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <h2>Unauthorized Access</h2>
      <p>You do not have permission to view this page.</p>
      <button onClick={() => navigate("/login")}>Go to Login</button>
    </div>
  );
};

export default Unauthorized;
