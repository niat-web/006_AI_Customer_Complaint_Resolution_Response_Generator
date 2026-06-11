import { useState, useEffect } from "react";
import ComplaintForm from "./components/ComplaintForm";
import MessageOutput from "./components/MessageOutput";
import History from "./components/History";
import Resolution from "./components/Resolution";
import Analytics from "./components/Analytics";
import SupportLogin from "./components/SupportLogin";
import CustomerLogin from "./components/CustomerLogin";

function App() {
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(() => {
    return localStorage.getItem("isCustomerLoggedIn") === "true";
  });

  const [isSupportLoggedIn, setIsSupportLoggedIn] = useState(() => {
    return localStorage.getItem("isSupportLoggedIn") === "true";
  });

  const [activeTab, setActiveTab] = useState(() => {
    if (localStorage.getItem("isSupportLoggedIn") === "true") {
      return localStorage.getItem("supportActiveTab") || "history";
    }

    if (localStorage.getItem("isCustomerLoggedIn") === "true") {
      return "complaint";
    }

    return "landing";
  });

  const [refreshHistory, setRefreshHistory] = useState(0);

  useEffect(() => {
    if (isSupportLoggedIn) {
      localStorage.setItem("supportActiveTab", activeTab);
    }
  }, [activeTab, isSupportLoggedIn]);

  const handleMessageGenerated = (message, phone = "") => {
    setGeneratedMessage(message);
    setCustomerPhone(phone);
    setRefreshHistory((prev) => prev + 1);
  };

  const handleCustomerLogin = (name, phone) => {
    localStorage.setItem("isCustomerLoggedIn", "true");
    localStorage.setItem("customerName", name);
    localStorage.setItem("customerPhone", phone);

    localStorage.removeItem("isSupportLoggedIn");
    localStorage.removeItem("supportActiveTab");

    setIsCustomerLoggedIn(true);
    setIsSupportLoggedIn(false);
    setCustomerPhone(phone);
    setActiveTab("complaint");
  };

  const handleSupportLogin = () => {
    localStorage.setItem("isSupportLoggedIn", "true");
    localStorage.setItem("supportActiveTab", "history");

    localStorage.removeItem("isCustomerLoggedIn");
    localStorage.removeItem("customerEmail");
    localStorage.removeItem("customerName");
    localStorage.removeItem("customerPhone");

    setIsCustomerLoggedIn(false);
    setIsSupportLoggedIn(true);
    setGeneratedMessage("");
    setCustomerPhone("");
    setActiveTab("history");
  };

  const handleLogout = () => {
    localStorage.removeItem("isCustomerLoggedIn");
    localStorage.removeItem("isSupportLoggedIn");
    localStorage.removeItem("supportActiveTab");
    localStorage.removeItem("customerEmail");
    localStorage.removeItem("customerName");
    localStorage.removeItem("customerPhone");

    setIsCustomerLoggedIn(false);
    setIsSupportLoggedIn(false);
    setGeneratedMessage("");
    setCustomerPhone("");
    setActiveTab("landing");
  };

  const changeTab = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Quiklee AI Complaint Response Generator</h1>
        <p>
          Generate professional and empathetic WhatsApp complaint resolution
          messages instantly.
        </p>
      </header>

      {(isCustomerLoggedIn || isSupportLoggedIn) && (
        <nav className="tabs">
          {isCustomerLoggedIn && !isSupportLoggedIn && (
            <>
              <button
                className={activeTab === "complaint" ? "active" : ""}
                onClick={() => changeTab("complaint")}
              >
                Complaint Details
              </button>

              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}

          {isSupportLoggedIn && (
            <>
              <button
                className={activeTab === "history" ? "active" : ""}
                onClick={() => changeTab("history")}
              >
                History
              </button>

              <button
                className={activeTab === "resolution" ? "active" : ""}
                onClick={() => changeTab("resolution")}
              >
                Resolution
              </button>

              <button
                className={activeTab === "analytics" ? "active" : ""}
                onClick={() => changeTab("analytics")}
              >
                Analytics
              </button>

              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </nav>
      )}

      {activeTab === "landing" && !isCustomerLoggedIn && !isSupportLoggedIn && (
        <section className="landing-card">
          <span className="landing-badge">AI Powered Complaint Support</span>

          <h2>Welcome to Quiklee Support System</h2>

          <p>
            Quiklee AI Complaint Response Generator helps customers submit
            complaint details and allows support agents to generate professional
            WhatsApp responses, track complaint history, manage resolutions, and
            view support analytics.
          </p>

          <div className="website-detail-grid">
            <div className="website-detail-card">
              <h3>For Customers</h3>
              <p>
                Customers can upload a PDF, image, or email complaint and fill
                complaint details quickly using Smart Auto-Fill.
              </p>
            </div>

            <div className="website-detail-card">
              <h3>For Support Team</h3>
              <p>
                Support agents can view complaint history, send resolved
                confirmation messages, mark issues as resolved, and check
                analytics.
              </p>
            </div>

            <div className="website-detail-card">
              <h3>Smart Auto-Fill</h3>
              <p>
                The system extracts order ID, complaint type, item name, and
                resolution details automatically from PDF, image, or email text.
              </p>
            </div>
          </div>

          <div className="landing-actions">
            <button
              className="customer-login-main-btn"
              onClick={() => changeTab("customerLogin")}
            >
              Customer Login
            </button>

            <button
              className="support-login-main-btn"
              onClick={() => changeTab("supportLogin")}
            >
              Support Login
            </button>
          </div>

          <footer className="home-footer">
            <div>
              <h3>Quiklee Support</h3>
              <p>
                24×7 AI-powered complaint assistance for faster customer
                support.
              </p>
            </div>

            <div className="footer-links">
              <span>Customer Support</span>
              <span>WhatsApp Response</span>
              <span>Resolution Tracking</span>
            </div>

            <p className="copyright-text">
              © 2026 Quiklee AI Complaint Response Generator. All rights
              reserved.
            </p>
          </footer>
        </section>
      )}

      {activeTab === "customerLogin" && !isCustomerLoggedIn && (
        <CustomerLogin onLogin={handleCustomerLogin} />
      )}

      {activeTab === "supportLogin" && !isSupportLoggedIn && (
        <SupportLogin onLogin={handleSupportLogin} />
      )}

      {isCustomerLoggedIn && activeTab === "complaint" && (
        <main className="main-layout">
          <ComplaintForm
            onMessageGenerated={handleMessageGenerated}
            loggedCustomerName={localStorage.getItem("customerName") || ""}
            loggedCustomerPhone={localStorage.getItem("customerPhone") || ""}
          />

          <MessageOutput
            message={generatedMessage}
            customerPhone={customerPhone}
          />
        </main>
      )}

      {isSupportLoggedIn && activeTab === "history" && (
        <History refreshHistory={refreshHistory} />
      )}

      {isSupportLoggedIn && activeTab === "resolution" && <Resolution />}

      {isSupportLoggedIn && activeTab === "analytics" && <Analytics />}
    </div>
  );
}

export default App;