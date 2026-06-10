import { useEffect, useState } from "react";
import API from "../api";

function History({ refreshHistory }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const response = await API.get(`/history?t=${Date.now()}`);

      setHistory(response.data.data);
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (id, rating) => {
    try {
      await API.post(`/history/${id}/rating`, { rating });
      alert("Rating saved");
      fetchHistory();
    } catch (error) {
      console.error("Failed to save rating", error);
      alert("Failed to save rating");
    }
  };

  const copyMessage = async (message) => {
    await navigator.clipboard.writeText(message);
    alert("Message copied");
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshHistory]);

  return (
    <section className="page-card">
      <h2>Generation History</h2>

      <button onClick={fetchHistory} style={{ marginBottom: "16px" }}>
        Refresh History
      </button>

      {loading && <p>Loading history...</p>}

      {!loading && history.length === 0 && (
        <p>No pending generated messages found.</p>
      )}

      <div className="history-list">
        {history.map((item) => (
          <div className="history-card" key={item.id}>
            <div className="history-header">
              <h3>{item.customer_name}</h3>
              <span>{new Date(item.created_at).toLocaleString()}</span>
            </div>

            <p>
              <strong>WhatsApp:</strong>{" "}
              {item.customer_phone || "Not provided"}
            </p>

            <p>
              <strong>Order ID:</strong> {item.order_id}
            </p>

            <p>
              <strong>Complaint:</strong> {item.complaint_type}
            </p>

            <p>
              <strong>Item:</strong> {item.item_name}
            </p>

            <p>
              <strong>Resolution:</strong> {item.resolution_type}
            </p>

            <p>
              <strong>Status:</strong> {item.status || "Pending"}
            </p>

            <div className="history-message">{item.generated_message}</div>

            <div className="rating-row">
              <span>Rate quality:</span>

              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => submitRating(item.id, rating)}
                  className={
                    Number(item.quality_rating) === rating
                      ? "rating-active"
                      : ""
                  }
                >
                  {rating}
                </button>
              ))}
            </div>

            <button onClick={() => copyMessage(item.generated_message)}>
              Copy
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default History;