import { useEffect, useState } from "react";
import API from "../api";

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const response = await API.get("/analytics");
      setAnalytics(response.data.data);
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <section className="page-card">
        <p>Loading analytics...</p>
      </section>
    );
  }

  if (!analytics) {
    return (
      <section className="page-card">
        <p>No analytics available.</p>
      </section>
    );
  }

  return (
    <section className="page-card">
      <h2>Admin Analytics Dashboard</h2>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Total Messages</h3>
          <p>{analytics.totalMessages}</p>
        </div>

        <div className="analytics-card">
          <h3>Average Quality Rating</h3>
          <p>{Number(analytics.averageRating).toFixed(2)} / 5</p>
        </div>
      </div>

      <div className="analytics-section">
        <h3>Complaint Type Analytics</h3>

        {analytics.complaintStats.length === 0 ? (
          <p>No complaint data found.</p>
        ) : (
          analytics.complaintStats.map((item) => (
            <div className="bar-row" key={item.complaint_type}>
              <span>{item.complaint_type}</span>
              <strong>{item.count}</strong>
            </div>
          ))
        )}
      </div>

      <div className="analytics-section">
        <h3>Resolution Type Analytics</h3>

        {analytics.resolutionStats.length === 0 ? (
          <p>No resolution data found.</p>
        ) : (
          analytics.resolutionStats.map((item) => (
            <div className="bar-row" key={item.resolution_type}>
              <span>{item.resolution_type}</span>
              <strong>{item.count}</strong>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Analytics;