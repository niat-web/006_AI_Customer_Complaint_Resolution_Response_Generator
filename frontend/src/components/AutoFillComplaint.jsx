import { useState } from "react";
import API from "../api";

function AutoFillComplaint({ onAutoFill }) {
  const [file, setFile] = useState(null);
  const [emailText, setEmailText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleExtract = async () => {
    if (!file && !emailText.trim()) {
      setMessage("Please upload a file or paste email text");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = new FormData();

      if (file) {
        data.append("file", file);
      }

      if (emailText.trim()) {
        data.append("emailText", emailText);
      }

      const response = await API.post("/extract", data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      onAutoFill(response.data.data);
      setMessage("Details extracted and filled successfully");
    } catch (error) {
      console.error(error);

      const backendMessage =
        error.response?.data?.message || "Failed to extract details";

      setMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auto-fill-box">
      <div className="auto-fill-header">
        <div>
          <h3>Smart Auto-Fill</h3>
          <p>
            Upload a complaint PDF/photo or paste customer email. The system
            extracts details and fills the form automatically.
          </p>
        </div>

        <span className="auto-fill-badge">AI Assisted</span>
      </div>

      <div className="auto-fill-grid">
        <div className="upload-panel">
          <label>Upload PDF / Image</label>

          <input
            type="file"
            accept=".pdf,image/*,.txt,.eml"
            onChange={(e) => setFile(e.target.files[0])}
            disabled={loading}
          />

          {file && <p className="selected-file">Selected: {file.name}</p>}
        </div>

        <div className="or-divider">
          <span>OR</span>
        </div>

        <div className="email-panel">
          <label>Paste Email / Complaint Text</label>

          <textarea
            placeholder="Paste customer email or complaint message here..."
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            rows="5"
            disabled={loading}
          ></textarea>
        </div>
      </div>

      <button
        type="button"
        className="extract-btn"
        onClick={handleExtract}
        disabled={loading}
      >
        {loading ? "Extracting Details..." : "Extract & Auto Fill"}
      </button>

      {message && <p className="auto-fill-message">{message}</p>}
    </div>
  );
}

export default AutoFillComplaint;