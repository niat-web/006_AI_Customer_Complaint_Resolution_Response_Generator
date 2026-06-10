const express = require("express");
const {
  getHistory,
  getHistoryById,
  addRating,
  resolveComplaint,
  getResolvedComplaints
} = require("../controllers/historyController");

const router = express.Router();

router.get("/history", getHistory);
router.get("/history/resolved", getResolvedComplaints);
router.get("/history/:id", getHistoryById);
router.post("/history/:id/rating", addRating);
router.put("/history/:id/resolve", resolveComplaint);

module.exports = router;