const express = require("express");
const { inflate } = require("pako");
const { compareArray, adfProcess } = require("../../utils");
const router = express.Router();

router.post("/upload", (req, res) => {
  const resultObject = {};
  const filesObject = req.files || {};

  for (const fullPath in filesObject) {
    if (Object.hasOwnProperty.call(filesObject, fullPath)) {
      const file = filesObject[fullPath];

      let adfRaw = new Uint8Array(file?.data || "");

      if (compareArray(adfRaw, "SAVE", 4)) {
        adfRaw = adfRaw.slice(34); // TODO this is a hack to skip the header
        adfRaw = inflate(adfRaw, { windowBits: -15 });
      }

      if (compareArray(adfRaw, "\x01\x01\x00\x00\x00 FDA", 9)) {
        adfRaw = adfRaw.slice(5);
      }

      if (compareArray(adfRaw, " FDA", 4)) {
        const adfObject = adfProcess(adfRaw);
        resultObject[fullPath] = adfObject;
      } else {
        resultObject[fullPath] = "UNKNOWN FORMAT";
      }
    }
  }

  res.status(200).json(resultObject);
});

module.exports = router;
