function MessageOutput({ message, customerPhone }) {
  const copyMessage = async () => {
    if (!message) return;

    await navigator.clipboard.writeText(message);
    alert("Message copied successfully");
  };

  const sendOnWhatsApp = () => {
    if (!message) {
      alert("Please generate a message first");
      return;
    }

    let phoneNumber = customerPhone;

    if (!phoneNumber) {
      phoneNumber = prompt(
        "Enter customer WhatsApp number with country code.\nExample: 917462050039"
      );
    }

    if (!phoneNumber) return;

    const cleanPhone = phoneNumber.replace(/\D/g, "");

    if (!cleanPhone.startsWith("91") || cleanPhone.length !== 12) {
      alert(
        "Please enter valid Indian WhatsApp number with country code. Example: 917462050039"
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

  const downloadMessage = () => {
    if (!message) return;

    const blob = new Blob([message], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "quiklee-whatsapp-message.txt";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <section className="card output-card">
      <h2>Generated WhatsApp Message</h2>

      {!message ? (
        <p className="placeholder-text">
          Fill the complaint form and click generate to see AI response here.
        </p>
      ) : (
        <>
          <div className="message-box">{message}</div>

          {customerPhone && (
            <p className="whatsapp-number-preview">
              WhatsApp Number: {customerPhone}
            </p>
          )}

          <div className="button-row">
            <button type="button" onClick={copyMessage}>
              Copy Message
            </button>

            <button
              type="button"
              className="whatsapp-btn"
              onClick={sendOnWhatsApp}
            >
              Send on WhatsApp
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={downloadMessage}
            >
              Download
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default MessageOutput;