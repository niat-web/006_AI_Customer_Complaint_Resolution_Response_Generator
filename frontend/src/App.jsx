import { useState, useEffect } from "react";
import ComplaintForm from "./components/ComplaintForm";
import MessageOutput from "./components/MessageOutput";
import History from "./components/History";
import Resolution from "./components/Resolution";
import Analytics from "./components/Analytics";
import SupportLogin from "./components/SupportLogin";

function App() {
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [isSupportLoggedIn, setIsSupportLoggedIn] = useState(() => {
    return localStorage.getItem("isSupportLoggedIn") === "true";
  });

  const [activeTab, setActiveTab] = useState(() => {
    const loggedIn = localStorage.getItem("isSupportLoggedIn") === "true";

    if (loggedIn) {
      return localStorage.getItem("supportActiveTab") || "history";
    }

    return localStorage.getItem("publicActiveTab") || "home";
  });

  const [refreshHistory, setRefreshHistory] = useState(0);

  useEffect(() => {
    if (isSupportLoggedIn) {
      localStorage.setItem("supportActiveTab", activeTab);
    } else {
      localStorage.setItem("publicActiveTab", activeTab);
    }
  }, [activeTab, isSupportLoggedIn]);

  const handleMessageGenerated = (message, phone = "") => {
    setGeneratedMessage(message);
    setCustomerPhone(phone);
    setRefreshHistory((prev) => prev + 1);
  };

  const handleSupportLogin = () => {
    localStorage.setItem("isSupportLoggedIn", "true");
    localStorage.setItem("supportActiveTab", "history");

    setIsSupportLoggedIn(true);
    setActiveTab("history");
  };

  const handleLogout = () => {
    localStorage.removeItem("isSupportLoggedIn");
    localStorage.removeItem("supportActiveTab");
    localStorage.setItem("publicActiveTab", "home");

    setIsSupportLoggedIn(false);
    setActiveTab("home");
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

      <nav className="tabs">
        {!isSupportLoggedIn && (
          <>
            <button
              className={activeTab === "home" ? "active" : ""}
              onClick={() => changeTab("home")}
            >
              Complaint Details
            </button>

            <button
              className={activeTab === "supportLogin" ? "active" : ""}
              onClick={() => changeTab("supportLogin")}
            >
              Support Login
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

      {!isSupportLoggedIn && activeTab === "home" && (
        <main className="main-layout">
          <ComplaintForm onMessageGenerated={handleMessageGenerated} />

          <MessageOutput
            message={generatedMessage}
            customerPhone={customerPhone}
          />
        </main>
      )}

      {!isSupportLoggedIn && activeTab === "supportLogin" && (
        <SupportLogin onLogin={handleSupportLogin} />
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