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

// python request
function getPythonProcess(filename, args) {
  if (!args?.length) return;
  // spawn python process
  const process = spawn("python", [filename, ...args]);
  // data is returned as buffer from python
  // Buffer objects are used to represent a fixed-length sequence of bytes
  return new Promise((resolve, reject) => {
    // by using the "toString()" method, we know that our buffer is returned as
    // a buffered string with 2 values separated by a comma
    // each value represents respectively the list and the candidate hashed strings
    // split the string to become an array of 2 strings to upload later in the database
    process.stdout.on("data", (data) => resolve(data.toString()));
    process.stderr.on("data", (error) => reject(error));
  }).catch((err) => console.error(err.toString()));
}

// landing page - get request
app.get(routes.homepage, (req, res) => {
  res.sendFile("views/index.html", { root: __dirname });
});

// get all decrypted values
app.get(routes.get_decrypted_values, async (req, res) => {
  // return all voters from database
  const all_voters = await prisma.voter.findMany();

  // filter voter lists and candidates separately for addition
  const all_lists = all_voters.map((voter) => voter.list);
  const all_candidates = all_voters.map((voter) => voter.candidate);

  // return total from database
  const total_votes = await prisma.total.findMany();
  const total_lists = total_votes[0].lists;
  const total_candidates = total_votes[0].Candidates;

  // decrypt using python decryption.py
  let returned_decryption = await getPythonProcess("pylib/decryption.py", [
    all_lists,
    all_candidates,
    total_lists,
    total_candidates,
  ]);

  // replace single quotes with double quotes to be able to parse them as JSON for javascript
  returned_decryption = JSON.parse(returned_decryption.replace(/'/g, '"'));

  res.status(200).json(returned_decryption);
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
  const { list, candidate } = req.body;

  // encrypted attributes returned from python
  const voter_encrypted_attributes = (
    await getPythonProcess("pylib/encryption.py", [list, candidate])
  ).split(",");

  // message to send back to the app as response
  const message = {};

  // create a voter on the database using prisma
  await prisma.voter
    .create({
      data: {
        id: uuid(12),
        list: voter_encrypted_attributes[0],
        candidate: voter_encrypted_attributes[1],
      },
    })
    .then((response) => {
      message.voter = response;
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json(error);
    });

  // return all voters from database
  const all_voters = await prisma.voter.findMany();

  // filter voter lists and candidates separately for addition
  const all_lists = all_voters.map((voter) => voter.list);
  const all_candidates = all_voters.map((voter) => voter.candidate);

  // make addition using python addition.py
  const returned_addition = (
    await getPythonProcess("pylib/addition.py", [all_lists, all_candidates])
  ).split(",");

  // return all totals from database
  const all_totals = await prisma.total.findMany();
  // data to update in database
  const total_data = {
    lists: returned_addition[0],
    Candidates: returned_addition[1],
  };

  // update total in database
  if (all_totals.length == 0) {
    await prisma.total
      .create({
        data: { id: uuid(12), ...total_data },
      })
      .then((response) => {
        message.total = response;
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json(error);
      });
  } else {
    await prisma.total
      .update({
        where: {
          id: all_totals[0].id,
        },
        data: total_data,
      })
      .then((response) => {
        message.total = response;
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json(error);
      });
  }

  return res.status(200).json(message);
});

// start the app
app.listen(PORT, () => {
  console.log(`> Server running at port: ${PORT}`);
});
