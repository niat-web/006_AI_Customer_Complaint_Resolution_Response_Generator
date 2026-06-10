const db = require("../config/db");

const getAnalytics = async (req, res) => {
  try {
    const [totalRows] = await db.execute(`
      SELECT COUNT(*) AS totalMessages 
      FROM generated_messages
    `);

    const [complaintRows] = await db.execute(`
      SELECT complaint_type, COUNT(*) AS count
      FROM generated_messages
      GROUP BY complaint_type
      ORDER BY count DESC
    `);

    const [resolutionRows] = await db.execute(`
      SELECT resolution_type, COUNT(*) AS count
      FROM generated_messages
      GROUP BY resolution_type
      ORDER BY count DESC
    `);

    const [ratingRows] = await db.execute(`
      SELECT AVG(quality_rating) AS averageRating
      FROM generated_messages
      WHERE quality_rating IS NOT NULL
    `);

    return res.status(200).json({
      success: true,
      data: {
        totalMessages: totalRows[0].totalMessages,
        complaintStats: complaintRows,
        resolutionStats: resolutionRows,
        averageRating: ratingRows[0].averageRating || 0
      }
    });
  } catch (error) {
    console.error("Analytics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics"
    });
  }
};

module.exports = {
  getAnalytics
};