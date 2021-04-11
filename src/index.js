// import modules
const express = require("express"); // express module
const cors = require("cors"); // cors module
const bodyParser = require("body-parser"); // body parsing module
const { spawn } = require("child_process"); // child_process to read from python file
const { routes } = require("./routes.json"); // all defined routes
const { prisma } = require("../prisma/prisma"); // prisma client
const { uuid } = require("./uuid");

// initialize express app
const app = express();
// server port defined by the hosting server || static -- 8080
const PORT = process.env.PORT || 8080;

// allow requests from all origins
app.use(cors());
// enables body parsing for POST requests
app.use(bodyParser.urlencoded({ extended: true }));

// landing page - get request
app.get(routes.homepage, (req, res) => {
  res.status(200).send("Whitelabel");
});

// homo_iter - post request
app.post(routes.homo_iter, (req, res) => {
  res.status(200).send("Whitelabel");
});

// iter - post request
app.post(routes.iter, (req, res) => {
  res.status(200).send("Whitelabel");
});

// create voter - post request
app.post(routes.create_voter, (req, res) => {
  // parse request body as JSON
  req.body = JSON.parse(Object.keys(req.body)[0]);

  // extract name, list, and candidate from request body
  // this is the same as:
  // const name = req.body.name
  // const list = req.body.list
  // const candidate = req.body.candidate
  const { name, list, candidate } = req.body;

  // create a voter on the database using prisma
  prisma.voter
    .create({
      data: {
        id: uuid(12),
        name,
        list: String(list),
        candidate: String(candidate),
      },
    })
    .then((response) => {
      return res.status(200).json(response);
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json(error);
    });
});

// start the app
app.listen(PORT, () => {
  console.log(`> Server running at port: ${PORT}`);
});
