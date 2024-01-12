// api.js
const express = require("express");
const router = express.Router();
const multer = require("multer");


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post("/upload", upload.single("file"), (req, res) => {
  const uploadedFileBuffer = req.file.buffer;
	
	//function here to process the file and return an object to do more stuff with it.
	
	

  res.status(200).send("File uploaded successfully!");
});

module.exports = router;
