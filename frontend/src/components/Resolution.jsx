import { useEffect, useState } from "react";
import API from "../api";

function Resolution() {
  const [complaints, setComplaints] = useState([]);
  const [resolved, setResolved] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resolvedMessages, setResolvedMessages] = useState({});

  const fetchPendingComplaints = async () => {
    try {
      setLoading(true);

      const response = await API.get(`/history?t=${Date.now()}`);

      setComplaints(response.data.data);

      const messageMap = {};

      response.data.data.forEach((item) => {
        messageMap[item.id] = createResolvedMessage(item);
      });

      setResolvedMessages(messageMap);
    } catch (error) {
      console.error("Failed to fetch pending complaints", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResolvedComplaints = async () => {
    try {
      const response = await API.get(`/history/resolved?t=${Date.now()}`);

      setResolved(response.data.data);
    } catch (error) {
      console.error("Failed to fetch resolved complaints", error);
    }
  };

  const createResolvedMessage = (item) => {
    return `Hi ${item.customer_name},

Good news! Your issue regarding ${item.complaint_type.toLowerCase()} for ${item.item_name} in order ${item.order_id} has been resolved.

As per the resolution, ${item.resolution_type.toLowerCase()} has been completed/arranged by Quiklee. Thank you for your patience and for giving us the opportunity to fix this issue.

We hope your next experience with Quiklee will be smooth and better.

- Team Quiklee`;
  };

  const handleResolvedMessageChange = (id, value) => {
    setResolvedMessages((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const sendOnWhatsApp = (phone, message) => {
    if (!message) {
      alert("Resolved message is empty");
      return;
    }

    if (!phone) {
      alert("Customer WhatsApp number not available");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");

    if (!cleanPhone.startsWith("91") || cleanPhone.length !== 12) {
      alert(
        "Invalid WhatsApp number. It should include country code. Example: 917462050039"
      );
      return;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const markResolved = async (id) => {
    const confirmResolve = window.confirm(
      "Are you sure this complaint is resolved?"
    );

    if (!confirmResolve) return;

    try {
      await API.put(`/history/${id}/resolve`);

      alert("Complaint marked as resolved");

      fetchPendingComplaints();
      fetchResolvedComplaints();
    } catch (error) {
      console.error("Failed to resolve complaint", error);
      alert("Failed to resolve complaint");
    }
  };

  const sendAndResolve = async (item) => {
    const resolvedMessage = resolvedMessages[item.id];

    sendOnWhatsApp(item.customer_phone, resolvedMessage);

    const confirmResolve = window.confirm(
      "After sending WhatsApp message, do you want to mark this complaint as resolved?"
    );

    if (!confirmResolve) return;

    try {
      await API.put(`/history/${item.id}/resolve`);

      alert("Complaint marked as resolved");

      fetchPendingComplaints();
      fetchResolvedComplaints();
    } catch (error) {
      console.error("Failed to resolve complaint", error);
      alert("Failed to resolve complaint");
    }
  };

  useEffect(() => {
    fetchPendingComplaints();
    fetchResolvedComplaints();
  }, []);

  return (
    <section className="page-card">
      <h2>Resolution Management</h2>

      <p className="page-subtitle">
        Track pending complaints, prepare a resolved confirmation message, send
        it on WhatsApp, and then mark the issue as resolved.
      </p>

      <button onClick={fetchPendingComplaints} style={{ marginBottom: "16px" }}>
        Refresh Pending Complaints
      </button>

      <h3>Pending Complaints</h3>

      {loading && <p>Loading complaints...</p>}

      {!loading && complaints.length === 0 && (
        <p>No pending complaints available.</p>
      )}

      <div className="history-list">
        {complaints.map((item) => (
          <div className="history-card resolution-card" key={item.id}>
            <div className="history-header">
              <h3>{item.customer_name}</h3>
              <span className="status-badge pending-status">Pending</span>
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

            <label>
              <strong>Resolved Confirmation Message</strong>
            </label>

            <textarea
              className="resolved-message-box"
              value={resolvedMessages[item.id] || ""}
              onChange={(e) =>
                handleResolvedMessageChange(item.id, e.target.value)
              }
              rows="7"
            ></textarea>

            <div className="button-row">
              <button
                className="whatsapp-btn"
                onClick={() =>
                  sendOnWhatsApp(
                    item.customer_phone,
                    resolvedMessages[item.id]
                  )
                }
              >
                Send Resolved Msg on WhatsApp
              </button>

              <button
                className="resolve-btn"
                onClick={() => markResolved(item.id)}
              >
                Mark as Resolved
              </button>

              <button
                className="resolve-btn"
                onClick={() => sendAndResolve(item)}
              >
                Send & Resolve
              </button>
            </div>
          </div>
        ))}
      </div>

      <hr className="section-divider" />

      <h3>Resolved Complaints</h3>

      {resolved.length === 0 && <p>No resolved complaints yet.</p>}

      <div className="history-list">
        {resolved.map((item) => (
          <div className="history-card resolved-card" key={item.id}>
            <div className="history-header">
              <h3>{item.customer_name}</h3>
              <span className="status-badge resolved-status">Resolved</span>
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
              <strong>Resolved At:</strong>{" "}
              {item.resolved_at
                ? new Date(item.resolved_at).toLocaleString()
                : "N/A"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Resolution;