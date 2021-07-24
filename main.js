const express = require("express");
const app = express();
const fs = require("fs");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const morgan = require("morgan");
const shortid = require("shortid");
const PORT = process.env.PORT || 7000;

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(fileUpload({ createParentPath: true }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", (req, res) => {
  try {
    const file = req.files.file;
    const id = shortid.generate();
    const extension = file.name.split(".")[file.name.split(".").length - 1];
    const allowedExtensions = ["png", "jpeg", "jpg", "gif", "pnga", "svg"];

    if (!allowedExtensions.includes(extension)) {
      res.redirect("/");
      return;
    }

    file.mv(`./public/source/${id}.${extension}`);

    res.redirect(`/${id}.${extension}`);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
});

app.get("/:filename", (req, res) => {
  try {
    const fileName = req.params.filename;

    const fileStats = fs.statSync(`${__dirname}/public/source/${fileName}`);
    const fileDate = `${fileStats.birthtime.toDateString()}, ${fileStats.birthtime.getHours()}:${fileStats.birthtime.getMinutes()}`;

    res.render("fileviewer", {
      fileName: fileName,
      fileMb: Math.round((fileStats.size / (1024 * 1024)) * 100) / 100,
      fileDate: fileDate,
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`Up and listening: http://localhost:${PORT}`);
});
