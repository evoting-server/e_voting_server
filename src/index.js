// import modules
const express = require("express"); // express module
const cors = require("cors"); // cors module
const bodyParser = require("body-parser"); // body parsing module
const { spawn } = require("child_process"); // child_process to read from python file
const { routes } = require("./routes.json"); // all defined routes
const { prisma } = require("../prisma/prisma"); // prisma client
const { uuid } = require("./uuid"); // generate a random ID for the voter

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

// create voter - post request
app.post(routes.create_voter, async (req, res) => {
  // parse request body as JSON
  req.body = JSON.parse(Object.keys(req.body)[0]);

  // extract name, list, and candidate from request body
  // this is the same as:
  // const name = req.body.name
  // const list = req.body.list
  // const candidate = req.body.candidate
  const { name, list, candidate } = req.body;

  const python_process = spawn("python", [
    "pylib/custom_hash.py",
    list,
    candidate,
  ]);

  // data is returned as buffer from python
  // Buffer objects are used to represent a fixed-length sequence of bytes
  const hashed_attributes_buffer = await new Promise((resolve, reject) => {
    python_process.stdout.on("data", (data) => resolve(data));
    python_process.stderr.on("data", (error) => reject(error));
  });

  // by using the "toString()" method, we know that our buffer is returned as
  // a buffered string with 2 values separated by a comma
  // each value represents respectively the list and the candidate hashed strings
  // split the string to become an array of 2 strings to upload later in the database
  const hashed_attributes = hashed_attributes_buffer.toString().split(",");

  // create a voter on the database using prisma
  prisma.voter
    .create({
      data: {
        id: uuid(12),
        name,
        list: hashed_attributes[0],
        candidate: hashed_attributes[1],
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
