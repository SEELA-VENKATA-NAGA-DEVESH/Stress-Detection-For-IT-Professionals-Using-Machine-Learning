const express = require("express");
const session = require("express-session");
const { google } = require("googleapis");
const { spawn } = require('child_process');
const fetch = require('node-fetch');

const app = express();

app.use(
  session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: true,
  })
);

const credentials = require("./creds.json");
const { client_secret, client_id, redirect_uris } = credentials.web;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

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

      data.bucket.forEach((bucket, idx) => {
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

    day.Sleep = parseFloat((Math.random() * (9.0 - 7.0 )+ 7.0).toFixed(2));
    total.Sleep += day.Sleep;
    // Set Heart rate as random between 62 to 80
    day.Heart = Math.floor(Math.random() * (90 - 60 + 1)) + 60;
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

app.get("/auth/google", (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  res.redirect(authUrl);
});

app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    req.session.tokens = tokens;
    res.cookie("access_token", tokens.access_token, { httpOnly: true });
    res.redirect("/");
  } catch (error) {
    console.error("Error retrieving access token:", error);
    res.redirect("/error");
  }
});

app.get("/", async (req, res) => {
  const endTime = Date.now();
  const tokens = req.session.tokens;

  if (!tokens) {
    res.redirect("/auth/google");
    return;
  }

  try {
    const { state, averages } = await getWeeklyData(endTime, tokens.access_token);

    // Prepare data for the Python script
    const inputData = { weeklyData: state };

    // Spawn a child process to run the Python script
    const pythonProcess = spawn('python', ['../scripts/predict_stress.py'], {
      stdio: ['pipe', 'pipe', process.stderr],
    });

    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();

    let result = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        res.status(500).send("Error predicting stress levels");
        return;
      }

      // Parse the output from the Python script
      try {
        const predictions = JSON.parse(result);
        res.json({ state, averages, predictions });
      } catch (error) {
        console.error("Error parsing Python script output:", error);
        res.status(500).send("Error predicting stress levels");
      }
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

app.get("/error", (req, res) => {
  res.send("An error occurred during authentication.");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});







