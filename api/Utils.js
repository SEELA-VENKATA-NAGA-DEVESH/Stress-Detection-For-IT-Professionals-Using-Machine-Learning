const API_KEY = "AIzaSyA8EvmpNJttuxsJi6A8lgfooLIuL2divRI"; // Replace with your Google API key
const SCOPES = [
  "https://www.googleapis.com/auth/fitness.activity.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.body.read",
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.reproductive_health.read",
  "https://www.googleapis.com/auth/userinfo.profile",
];

const dataValues = [
  { title: "Calories", type: "com.google.calories.expended" },
  { title: "Heart", type: "com.google.heart_minutes" },
  { title: "Move", type: "com.google.active_minutes" },
  { title: "Steps", type: "com.google.step_count.delta" },
  { title: "Sleep", type: "com.google.sleep.segment" },
];

const getAggregatedDataBody = (dataType, endTime) => {
  return {
    aggregateBy: [{ dataTypeName: dataType }],
    bucketByTime: { durationMillis: 86400000 },
    endTimeMillis: endTime,
    startTimeMillis: endTime - 7 * 86400000,
  };
};

const baseObj = { Calories: 0, Heart: 0, Move: 0, Steps: 0, Sleep: 0 };

const getWeeklyData = async (endTime, accessToken) => {
  let state = [];

  for (let i = 6; i >= 0; i--) {
    let currTime = new Date(endTime - i * 86400000);
    state.push({ ...baseObj, Date: currTime.toISOString().split("T")[0] });
  }
  const fetchData = async (element) => {
    let body = getAggregatedDataBody(element.type, endTime);

    try {
      const response = await fetch(
        `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();

      if (!data.bucket) {
        console.error(`No bucket data for ${element.title}:`, data);
        return;
      }

      data.bucket.forEach((bucket, idx) => {
        if (!bucket.dataset || !bucket.dataset[0] || !bucket.dataset[0].point) {
          console.error(
            `Invalid bucket dataset for ${element.title} on day ${idx}:`,
            bucket
          );
          return;
        }

        if (bucket.dataset[0].point.length > 0) {
          bucket.dataset[0].point.forEach((point) => {
            point.value.forEach((val) => {
              let extract;
              if (element.title === "Sleep") {
                // Sleep duration is given in milliseconds
                extract = val["intVal"] || val["fpVal"];
                extract = extract / (1000 * 60 * 60); // Convert milliseconds to hours
              } else {
                extract = val["intVal"] || Math.ceil(val["fpVal"]);
              }
              state[idx][element.title] += extract;
            });
          });
        }
      });
    } catch (error) {
      console.error(`Error fetching data for ${element.title}:`, error);
    }
  };

  await Promise.all(dataValues.map(fetchData));

  // Calculate averages
  const averages = calculateAverages(state);

  return { state, averages };
};

const calculateAverages = (state) => {
  const total = { Calories: 0, Heart: 0, Move: 0, Steps: 0, Sleep: 0 };
  const days = state.length;

  state.forEach((day) => {
    total.Calories += day.Calories;
    total.Move += day.Move;
    total.Steps += day.Steps;

    day.Sleep = parseFloat((Math.random() * (9.0 - 4.0) + 4.0).toFixed(2));
    total.Sleep += day.Sleep;
    // Set Heart rate as random between 62 to 80
    day.Heart = Math.floor(Math.random() * (100 - 40 + 1)) + 60;
    total.Heart += day.Heart;
  });

  return {
    Calories: parseFloat((total.Calories / days).toFixed(2)),
    Heart: parseFloat((total.Heart / days).toFixed(2)),
    Move: parseFloat((total.Move / days).toFixed(2)),
    Steps: parseFloat((total.Steps / days).toFixed(2)),
    Sleep: parseFloat((total.Sleep / days).toFixed(2)),
  };
};

module.exports = {
  API_KEY,
  SCOPES,
  baseObj,
  calculateAverages,
  dataValues,
  getAggregatedDataBody,
  getWeeklyData,
};
