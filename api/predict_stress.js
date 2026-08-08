const tf = require("@tensorflow/tfjs");

// Define stress levels and corresponding actions
const stressLevels = {
  low: {
    action: "Continue maintaining a healthy routine.",
  },
  normal: {
    action: "Consider adding relaxation techniques like meditation or yoga.",
  },
  high: {
    action: "Focus on reducing stressors and improving sleep quality.",
  },
};

// Example training data (synthetic for demonstration)
const X = tf.tensor2d([
  // Features: [heart rate, calories, sleep time, steps]
  [65, 1600, 8, 10000], // low stress
  [68, 1700, 7.5, 12000], // low stress
  [62, 1550, 8.5, 8000], // low stress
  [75, 1500, 6.5, 15000], // normal stress
  [72, 1450, 6.2, 13000], // normal stress
  [78, 1550, 6.8, 14000], // normal stress
  [85, 1300, 5, 8000], // high stress
  [90, 1200, 4.5, 7000], // high stress
  [82, 1350, 5.5, 7500], // high stress
]);

const y = tf.tensor1d([0, 0, 0, 1, 1, 1, 2, 2, 2]); // Labels: 0 - low, 1 - normal, 2 - high

// Function to predict stress level
function predictStress(heartRate, calories, sleepTime, steps) {
  const features = tf.tensor2d([[heartRate, calories, sleepTime, steps]]);

  // Determine the predicted stress level based on conditions
  const predictedIndex = predict(features);

  // Map the predicted index to stress level
  const stressLevel = getStressLevel(predictedIndex);

  return {
    predictedStress: stressLevel,
    action: stressLevels[stressLevel].action,
  };
}

// Predict function (simulating decision tree conditions)
function predict(features) {
  const [heartRate, calories, sleepTime, steps] = features.dataSync();

  if (steps < 9000) {
    return 2; // High stress
  } else if (heartRate < 70) {
    return 0; // Low stress
  } else {
    return 1; // Normal stress
  }
}

// Helper function to get stress level from index
function getStressLevel(index) {
  switch (index) {
    case 0:
      return "low";
    case 1:
      return "normal";
    case 2:
      return "high";
    default:
      return "unknown";
  }
}

module.exports = { predictStress };
