const express = require("express");
const { generateComplaintMessage } = require("../controllers/generateController");

const router = express.Router();

router.post("/generate", generateComplaintMessage);

module.exports = router;