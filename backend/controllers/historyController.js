const db = require("../config/db");

const getHistory = async (req, res) => {
  try {
    const sql = `
      SELECT *
      FROM generated_messages
      WHERE status = 'Pending'
      ORDER BY created_at DESC
    `;

    const [rows] = await db.execute(sql);

    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error("History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch history"
    });
  }
};

const getHistoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT *
      FROM generated_messages
      WHERE id = ?
    `;

    const [rows] = await db.execute(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "History record not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error("History By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch history record"
    });
  }
};

const addRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    const sql = `
      UPDATE generated_messages
      SET quality_rating = ?
      WHERE id = ?
    `;

    const [result] = await db.execute(sql, [rating, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rating saved successfully"
    });
  } catch (error) {
    console.error("Rating Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save rating"
    });
  }
};

const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      UPDATE generated_messages
      SET status = 'Resolved',
          resolved_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const [result] = await db.execute(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Complaint resolved successfully"
    });
  } catch (error) {
    console.error("Resolve Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to resolve complaint"
    });
  }
};

const getResolvedComplaints = async (req, res) => {
  try {
    const sql = `
      SELECT *
      FROM generated_messages
      WHERE status = 'Resolved'
      ORDER BY resolved_at DESC
    `;

    const [rows] = await db.execute(sql);

    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error("Resolved History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch resolved complaints"
    });
  }
};

module.exports = {
  getHistory,
  getHistoryById,
  addRating,
  resolveComplaint,
  getResolvedComplaints
};