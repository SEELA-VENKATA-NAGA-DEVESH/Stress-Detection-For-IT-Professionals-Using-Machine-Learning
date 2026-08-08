const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { google } = require("googleapis");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: true,
  })
);

const credentials = require("./creds.json");
const { predictStress } = require("./predict_stress");
const { client_secret, client_id, redirect_uris } = credentials.web;
const {
  API_KEY,
  SCOPES,
  baseOb,
  calculateAverages,
  dataValues,
  getAggregatedDataBody,
  getWeeklyData,
} = require("./Utils");

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

// Middleware to check authentication
const checkAuth = (req, res, next) => {
  const accessToken =
    req.cookies.access_token || req.session.tokens?.access_token;
  console.log("Access Token:", accessToken);
  if (accessToken) {
    console.log("Redirecting to dashboard");
    res.redirect("/dashboard");
  } else {
    console.log("No access token, proceeding to next middleware");
    next();
  }
};

// Middleware to authenticate
const authenticate = (req, res, next) => {
  const accessToken =
    req.cookies.access_token || req.session.tokens?.access_token;
  const refreshToken =
    req.cookies.refresh_token || req.session.tokens?.refresh_token;

  if (!accessToken || !refreshToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  oAuth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  next();
};

// Route to start the OAuth flow
app.get("/api/auth/google", (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  res.json({ authUrl });
});

// Route to handle OAuth2 callback
app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    req.session.tokens = tokens;

    // Save tokens in a cookie
    res.cookie("access_token", tokens.access_token, {
      httpOnly: true,
      secure: false, // Set to false for local testing, true for production
    });
    res.cookie("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: false, // Set to false for local testing, true for production
    });

    res.redirect("http://localhost:5173/dashboard");
  } catch (error) {
    console.error("Error retrieving access token:", error);
    res.redirect("/error");
  }
});

// Route to serve home page
app.get("/", checkAuth, (req, res) => {
  const endTime = Date.now();
  const tokens = req.session.tokens;

  if (!tokens) {
    res.redirect("/auth/google");
    return;
  }
  try {
    // Spawn a child process to run the Python script
    const pythonProcess = spawn("python", ["./scripts/predict_stress.py"], {
      stdio: ["pipe", "pipe", process.stderr],
    });

    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();

    let result = "";

    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.on("close", (code) => {
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
  res.sendFile(path.join(__dirname, "public", "index.html")); // Adjust the path to your home page file
});

// Route to serve dashboard page
app.get("/dashboard", authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html")); // Adjust the path to your dashboard page file
});

app.get("/api/dashboard", authenticate, async (req, res) => {
  const endTime = Date.now();

  try {
    const { state, averages } = await getWeeklyData(
      endTime,
      req.cookies.access_token
    );

    // Calculate averages (assuming calculateAverages is defined somewhere)
    const averageData = calculateAverages(state);

    // Predict stress level for the averages
    const { predictedStress, action } = predictStress(
      averageData.Heart,
      averageData.Calories,
      averageData.Sleep,
      averageData.Steps
    );

    // Prepare response
    res.json({
      state: state,
      averages: averages,
      predictions: {
        predictedStress: predictedStress,
        action: action,
      },
    });
  } catch (error) {
    console.error("Error handling dashboard data:", error);
    res.status(500).send("Error handling dashboard data");
  }
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is connected!, This is Server Vasanth" });
});

app.get("/error", (req, res) => {
  res.send("An error occurred during authentication.");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
