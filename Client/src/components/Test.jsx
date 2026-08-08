// src/components/TestConnection.js
import { useState } from "react";

const TestConnection = () => {
  const [message, setMessage] = useState("Loading...");
  const fetchData = async () => {
    try {
      const response = await fetch("/api/test", {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        setMessage(data.message); // Assuming your API response has a `message` field
      } else {
        setMessage("Failed to fetch data.");
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  fetchData();

  return (
    <div className="bg-black text-white">
      <h1>Connection Test: {message}</h1>
    </div>
  );
};

export default TestConnection;
