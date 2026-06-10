import { useState } from "react";
import API from "../api";
import PriorityBadge from "./PriorityBadge";
import AutoFillComplaint from "./AutoFillComplaint";

function ComplaintForm({ onMessageGenerated }) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    orderId: "",
    complaintType: "",
    itemName: "",
    resolutionType: "",
    resolutionDetails: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const complaintTypes = [
    "Wrong Item Delivered",
    "Item Missing",
    "Late Delivery",
    "Damaged Product",
    "Out of Stock Substitution"
  ];

  const resolutionTypes = [
    "Full Refund",
    "Replacement on Next Delivery",
    "Quiklee Credits",
    "Partial Refund",
    "Apology Only"
  ];

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));

    setError("");
  };

  const handleAutoFill = (extractedData) => {
    setFormData((prev) => ({
      ...prev,
      customerName: extractedData.customerName || "",
      customerPhone: extractedData.customerPhone || prev.customerPhone || "",
      orderId: extractedData.orderId || "",
      complaintType: extractedData.complaintType || "",
      itemName: extractedData.itemName || "",
      resolutionType: extractedData.resolutionType || "",
      resolutionDetails: extractedData.resolutionDetails || ""
    }));

    setError("");
    onMessageGenerated("", "");
  };

  const validateForm = () => {
    const cleanPhone = formData.customerPhone.replace(/\D/g, "");

    if (!formData.customerName.trim()) return "Customer name is required";

    if (!formData.customerPhone.trim()) {
      return "Customer WhatsApp number is required";
    }

    if (!cleanPhone.startsWith("91") || cleanPhone.length !== 12) {
      return "Enter valid Indian WhatsApp number with country code. Example: 917462050039";
    }

    if (!formData.orderId.trim()) return "Order ID is required";
    if (!formData.complaintType) return "Complaint type is required";
    if (!formData.itemName.trim()) return "Item name is required";
    if (!formData.resolutionType) return "Resolution type is required";

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await API.post("/generate", formData);

      const generatedMsg = response.data.data.generatedMessage;

      onMessageGenerated(generatedMsg, formData.customerPhone);
    } catch (err) {
      console.error(err);

      onMessageGenerated("", "");

      const backendMessage =
        err.response?.data?.message ||
        "Failed to generate message. Please try again.";

      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  const fillSample = () => {
    setFormData({
      customerName: "Rahul",
      customerPhone: "917462050039",
      orderId: "QK1001",
      complaintType: "Item Missing",
      itemName: "Amul Milk",
      resolutionType: "Full Refund",
      resolutionDetails: "Refund of ₹65 will be processed within 24 hours"
    });

    setError("");
    onMessageGenerated("", "");
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerPhone: "",
      orderId: "",
      complaintType: "",
      itemName: "",
      resolutionType: "",
      resolutionDetails: ""
    });

    setError("");
    onMessageGenerated("", "");
  };

  return (
    <section className="card">
      <h2>Complaint Details</h2>

      <AutoFillComplaint onAutoFill={handleAutoFill} />

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Customer Name</label>
        <input
          type="text"
          name="customerName"
          placeholder="Enter customer name"
          value={formData.customerName}
          onChange={handleChange}
        />

        <label>Customer WhatsApp Number</label>
        <input
          type="text"
          name="customerPhone"
          placeholder="Example: 917462050039"
          value={formData.customerPhone}
          onChange={handleChange}
        />

        <label>Order ID</label>
        <input
          type="text"
          name="orderId"
          placeholder="Enter unique order ID"
          value={formData.orderId}
          onChange={handleChange}
        />

        <label>Complaint Type</label>
        <select
          name="complaintType"
          value={formData.complaintType}
          onChange={handleChange}
        >
          <option value="">Select complaint type</option>

          {complaintTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <PriorityBadge complaintType={formData.complaintType} />

        <label>Item Name</label>
        <input
          type="text"
          name="itemName"
          placeholder="Example: Amul Milk, Bread, Rice"
          value={formData.itemName}
          onChange={handleChange}
        />

        <label>Resolution Type</label>
        <select
          name="resolutionType"
          value={formData.resolutionType}
          onChange={handleChange}
        >
          <option value="">Select resolution type</option>

          {resolutionTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <label>Resolution Details</label>
        <textarea
          name="resolutionDetails"
          placeholder="Example: Refund of ₹65 will be processed within 24 hours"
          value={formData.resolutionDetails}
          onChange={handleChange}
          rows="4"
        ></textarea>

        <div className="button-row">
          <button type="submit" disabled={loading}>
            {loading ? "Generating..." : "Generate AI Message"}
          </button>

          <button type="button" className="secondary-btn" onClick={fillSample}>
            Fill Sample
          </button>

          <button type="button" className="secondary-btn" onClick={resetForm}>
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}

export default ComplaintForm;