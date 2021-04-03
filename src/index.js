// import modules
const express = require("express"); // express module
const cors = require("cors"); // cors module
const { spawn } = require("child_process"); // child_process to read from python file
const { routes } = require("./routes.json"); // all defined routes

// initialize express app
const app = express();
// server port defined by the hosting server || static -- 3000
const PORT = process.env.PORT || 3000;

// dummy message for displaying on website visit
const static_msg = "Howdy! Looking for something?";

// allow requests from all origins
app.use(cors());

// landing page - get request
app.get(routes.homepage, (req, res) => {
  res.send(static_msg);
});

// homo_iter - post request
app.post(routes.homo_iter, (req, res) => {
  if (req.body) {
  } else {
    res.send(static_msg);
  }
});

// iter - post request
app.post(routes.iter, (req, res) => {
  if (req.body) {
  } else {
    res.send(static_msg);
  }
});

// start the app
app.listen(PORT, () => {
  console.log(`> Server running at port: ${PORT}`);
});
