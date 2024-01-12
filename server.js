const express = require("express");
const app = express();
const apiRouter = require("./routes/api/api");

app.use(express.static(__dirname + "/public"));
app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.sendFile(__dirname+"/public/tool/adf.html");
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
