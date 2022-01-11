const express = require("express");
const app = express();
const fs = require("fs");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const shortid = require("shortid");
const PORT = process.env.PORT || 3000;
const path = require("path");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(fileUpload({ createParentPath: true }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", (req, res) => {
  try {
    const file = req.files.file;
    const id = shortid.generate();
    const extension = file.name.split(".")[file.name.split(".").length - 1];
    const allowedExtensions = ["png", "jpeg", "jpg", "gif", "pnga"];

    if (!allowedExtensions.includes(extension)) {
      res.render("message", { message: "Unsupported file type" });
      return;
    }

    const filePath = path.join(__dirname, "uploads", `${id}.${extension}`);
    file.mv(filePath);

    res.redirect(`/${id}.${extension}`);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
});

app.get("/:filename", (req, res) => {
  try {
    const fileName = req.params.filename;
    const filePath = path.join(__dirname, "uploads", fileName);

    const fileStats = fs.statSync(filePath);
    const fileDate = `${fileStats.birthtime.toDateString()}, ${fileStats.birthtime.getHours()}:${fileStats.birthtime.getMinutes()}`;

    res.render("fileviewer", {
      fileName: fileName,
      fileSize: humanFileSize(fileStats.size, true, 1),
      fileDate: fileDate,
    });
  } catch (error) {
    console.log(error);
    res.render("message", { message: "File not found" });
  }
});

app.get("/source/:filename", (req, res) => {
  res.sendFile(path.join(__dirname + "/uploads/" + req.params.filename));
});

app.listen(PORT, () => {
  console.log(`🆙 at http://localhost:${PORT}`);
});

function humanFileSize(bytes, si = false, dp = 1) {
  // Thanks to mpen (https://stackoverflow.com/a/14919494/12282885)
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}
