// pulling in required modules
const { randomUUID } = require("crypto");
const express = require("express");
const fs = require("fs");
const path = require("path");
const util = require("util");
const notes = require("./db/db.json");
// declare PORT and readFromFile
const PORT = process.env.port || 3001;
const readFromFile = util.promisify(fs.readFile);

// create an instance of express
const app = express();
// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
// Create routes for paths, including wildcard which will send to main homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});
app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/notes.html"));
});
app.get("/api/notes", (req, res) => {
  readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)));
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

const writeToFile = (destination, content) =>
  fs.writeFile(
    destination,
    JSON.stringify(content, null, 4),
    (err) => {
      if (err) {
        console.error(err);
      } else {
        console.info(`\nData written to ${destination}`);
      }
    }
    // err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

const readAndAppend = (content, file) => {
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};

app.post("/api/notes", (req, res) => {
  const { title, text } = req.body;
  if (req.body) {
    const newNote = {
      title,
      text,
      id: randomUUID(),
    };
    readAndAppend(newNote, "./db/db.json");
    res.json(`Note added successfully`);
  } else {
    res.error(`Error adding note.`);
  }
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
