const express = require("express");
const fileUpload = require("express-fileupload");
const apiRouter = require("./routes/api/api");

const app = express();

app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));

app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
