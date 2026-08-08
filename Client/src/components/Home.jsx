/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { FaGoogle } from "react-icons/fa";

const Home = () => {
  const handleLogin = async () => {
    try {
      const response = await fetch("/api/auth/google", { method: "GET" });
      const data = await response.json();
      console.log(data);
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        console.error("Error obtaining auth URL");
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-100 bg-center bg-no-repeat bg-cover rounded-lg shadow-lg text-slate-600 bg-opacity-70">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1 className="mb-8 text-5xl font-bold">Welcome to Your Stress Detection Dashboard</h1>
        <p className="max-w-xl mb-12 text-xl text-center">
          In the fast-paced world of IT, managing stress is crucial for maintaining both physical and mental well-being. Our platform leverages advanced machine learning techniques to accurately detect stress levels in IT professionals. By analyzing data from daily activities, such as heart rate, sleep patterns, and digital footprints, we provide personalized insights and recommendations to help you manage stress effectively.
        </p>
        <ul className="mb-12 text-lg text-left list-disc list-inside">
          <li><strong>Accurate Stress Detection:</strong> Utilizing machine learning models to monitor and analyze physiological data and digital footprints.</li>
          <li><strong>Personalized Insights:</strong> Receive tailored feedback based on your unique stress patterns.</li>
          <li><strong>Actionable Recommendations:</strong> Practical tips and strategies to reduce stress and improve overall well-being.</li>
        </ul>
        <p className="max-w-xl mb-12 text-xl text-center">
          Join us to take control of your stress and enhance your productivity and quality of life.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <motion.button
          className="flex items-center px-4 py-2 text-lg text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLogin}
        >
          <FaGoogle className="mr-2" />
          Login with Google
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Home;
