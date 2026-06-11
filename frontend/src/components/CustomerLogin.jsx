import { useState } from "react";

function CustomerLogin({ onLogin }) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const cleanPhone = customerPhone.replace(/\D/g, "");

    if (!customerName.trim()) {
      setError("Customer name is required");
      return;
    }

    if (!cleanPhone.startsWith("91") || cleanPhone.length !== 12) {
      setError("Enter valid WhatsApp number with country code. Example: 917462050039");
      return;
    }

    localStorage.setItem("isCustomerLoggedIn", "true");
    localStorage.setItem("customerName", customerName);
    localStorage.setItem("customerPhone", cleanPhone);

    onLogin(customerName, cleanPhone);
  };

  return (
    <section className="page-card login-card">
      <h2>Customer Login</h2>

      <p className="page-subtitle">
        Login as a customer to submit complaint details and generate WhatsApp response.
      </p>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleLogin}>
        <label>Customer Name</label>
        <input
          type="text"
          placeholder="Enter customer name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />

        <label>WhatsApp Number</label>
        <input
          type="text"
          placeholder="Example: Your Number with Country Code Like: 9174620***39"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
        />

        <button type="submit">Continue as Customer</button>
      </form>
    </section>
  );
}

export default CustomerLogin;