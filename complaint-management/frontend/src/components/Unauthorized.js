import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#FFEBEB", // Light red background
        color: "#D8000C", // Dark red text color
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "60px",
          fontWeight: "bold",
          color: "#D8000C", // Red color for heading
        }}
      >
        🚨 UNAUTHORIZED ACCESS 🚨
      </h1>
      <p
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          color: "#D8000C",
          marginTop: "20px",
        }}
      >
        You do not have permission to view this page.
      </p>
      <p
        style={{
          fontSize: "18px",
          color: "#C03B2B",
          marginTop: "30px",
        }}
      >
        This is a restricted area. Only authorized users can access it.
      </p>
      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "40px",
          padding: "12px 25px",
          fontSize: "18px",
          backgroundColor: "#D8000C", // Red background
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold",
          transition: "background-color 0.3s",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#A60000")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#D8000C")}
      >
        Go to Login
      </button>
    </div>
  );
};

export default Unauthorized;
