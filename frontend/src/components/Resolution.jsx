import { useEffect, useState } from "react";
import API from "../api";

function Resolution() {
  const [complaints, setComplaints] = useState([]);
  const [resolved, setResolved] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resolvedMessages, setResolvedMessages] = useState({});

  const createResolvedMessage = (item) => {
    return `Hi ${item.customer_name},

Good news! Your issue regarding ${item.complaint_type.toLowerCase()} for ${item.item_name} in order ${item.order_id} has been resolved.

As per the resolution, ${item.resolution_type.toLowerCase()} has been completed/arranged by Quiklee. Thank you for your patience and for giving us the opportunity to fix this issue.

We hope your next experience with Quiklee will be smooth and better.

- Team Quiklee`;
  };

  const fetchPendingComplaints = async () => {
    try {
      setLoading(true);

      const response = await API.get(`/history?t=${Date.now()}`);

      const pendingData = response.data.data || [];

      setComplaints(pendingData);

      const messageMap = {};

      pendingData.forEach((item) => {
        messageMap[item.id] = createResolvedMessage(item);
      });

      setResolvedMessages(messageMap);
    } catch (error) {
      console.error("Failed to fetch pending complaints", error);
      alert("Failed to fetch pending complaints");
    } finally {
      setLoading(false);
    }
  };

  const fetchResolvedComplaints = async () => {
    try {
      const response = await API.get(`/history/resolved?t=${Date.now()}`);

      setResolved(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch resolved complaints", error);
      alert("Failed to fetch resolved complaints");
    }
  };

  const handleResolvedMessageChange = (id, value) => {
    setResolvedMessages((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const sendOnWhatsApp = (phone, message) => {
    if (!message || !message.trim()) {
      alert("Resolved message is empty");
      return;
    }

    if (!phone) {
      alert("Customer WhatsApp number not available");
      return;
    }

    const cleanPhone = String(phone).replace(/\D/g, "");

    if (!cleanPhone.startsWith("91") || cleanPhone.length !== 12) {
      alert(
        "Invalid WhatsApp number. It should include country code. Example: 917462050039"
      );
      return;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    const newWindow = window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );

    if (!newWindow) {
      alert("Popup blocked. Please allow popups for localhost and try again.");
    }
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

    if (!resolvedMessage || !resolvedMessage.trim()) {
      alert("Resolved message is empty");
      return;
    }

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
      <div className="resolution-page-header">
        <h2>Resolution Management</h2>

        <p className="page-subtitle">
          Track pending complaints, prepare a resolved confirmation message, send
          it on WhatsApp, and then mark the issue as resolved.
        </p>

        <button
          className="refresh-resolution-btn"
          onClick={fetchPendingComplaints}
        >
          Refresh Pending Complaints
        </button>
      </div>

      <h3 className="section-title">Pending Complaints</h3>

      {loading && <p>Loading complaints...</p>}

      {!loading && complaints.length === 0 && (
        <p>No pending complaints available.</p>
      )}

      <div className="history-list">
        {complaints.map((item) => (
          <div className="history-card resolution-card" key={item.id}>
            <div className="history-header">
              <div>
                <h3>{item.customer_name}</h3>
                <p className="complaint-id">Complaint #{item.id}</p>
              </div>

              <span className="status-badge pending-status">Pending</span>
            </div>

            <div className="complaint-info-grid">
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
            </div>

            <div className="resolved-message-section">
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
            </div>

            <div className="resolution-actions">
              <button
                className="send-resolved-btn"
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
                className="mark-resolved-btn"
                onClick={() => markResolved(item.id)}
              >
                Mark as Resolved
              </button>

              <button
                className="send-resolve-btn"
                onClick={() => sendAndResolve(item)}
              >
                Send & Resolve
              </button>
            </div>
          </div>
        ))}
      </div>

      <hr className="section-divider" />

      <h3 className="section-title resolved-section-title">
        Resolved Complaints
      </h3>

      {resolved.length === 0 && <p>No resolved complaints yet.</p>}

      <div className="history-list">
        {resolved.map((item) => (
          <div className="history-card resolved-card" key={item.id}>
            <div className="history-header">
              <div>
                <h3>{item.customer_name}</h3>
                <p className="complaint-id">Complaint #{item.id}</p>
              </div>

              <span className="status-badge resolved-status">Resolved</span>
            </div>

            <div className="complaint-info-grid">
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
                <strong>Status:</strong> {item.status || "Resolved"}
              </p>

              <p>
                <strong>Resolved At:</strong>{" "}
                {item.resolved_at
                  ? new Date(item.resolved_at).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Resolution;