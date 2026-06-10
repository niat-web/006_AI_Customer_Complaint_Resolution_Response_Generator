const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");

const allowedComplaintTypes = [
  "Wrong Item Delivered",
  "Item Missing",
  "Late Delivery",
  "Damaged Product",
  "Out of Stock Substitution"
];

const allowedResolutionTypes = [
  "Full Refund",
  "Replacement on Next Delivery",
  "Quiklee Credits",
  "Partial Refund",
  "Apology Only"
];

const extractValue = (text, patterns) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match && match[1]) {
      return match[1].trim().replace(/\.$/, "");
    }
  }

  return "";
};

const normalizeText = (text) => {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n+/g, "\n")
    .trim();
};

const cleanPhoneNumber = (phone) => {
  if (!phone) return "";

  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }

  return cleaned;
};

const detectComplaintType = (text) => {
  const lower = text.toLowerCase();

  if (
    lower.includes("wrong item") ||
    lower.includes("different item") ||
    lower.includes("incorrect item") ||
    lower.includes("wrong product")
  ) {
    return "Wrong Item Delivered";
  }

  if (
    lower.includes("missing") ||
    lower.includes("not received") ||
    lower.includes("item was not delivered") ||
    lower.includes("not delivered")
  ) {
    return "Item Missing";
  }

  if (
    lower.includes("late") ||
    lower.includes("delay") ||
    lower.includes("delivered very late") ||
    lower.includes("late delivery")
  ) {
    return "Late Delivery";
  }

  if (
    lower.includes("damaged") ||
    lower.includes("broken") ||
    lower.includes("packet was open") ||
    lower.includes("partially open") ||
    lower.includes("damaged product")
  ) {
    return "Damaged Product";
  }

  if (
    lower.includes("out of stock") ||
    lower.includes("substitution") ||
    lower.includes("substitute")
  ) {
    return "Out of Stock Substitution";
  }

  return "";
};

const detectResolutionType = (text) => {
  const lower = text.toLowerCase();

  if (lower.includes("partial refund")) {
    return "Partial Refund";
  }

  if (lower.includes("full refund") || lower.includes("refund")) {
    return "Full Refund";
  }

  if (
    lower.includes("replacement") ||
    lower.includes("replace") ||
    lower.includes("next delivery")
  ) {
    return "Replacement on Next Delivery";
  }

  if (
    lower.includes("quiklee credits") ||
    lower.includes("credits") ||
    lower.includes("wallet")
  ) {
    return "Quiklee Credits";
  }

  if (lower.includes("apology")) {
    return "Apology Only";
  }

  return "";
};

const extractItemName = (text) => {
  const item = extractValue(text, [
    /Item Name\s*[:\-]?\s*([^\n\r]+)/i,
    /Item\s*[:\-]?\s*([^\n\r]+)/i,
    /I ordered\s+([A-Za-z0-9\s]+?)\s*(?:,|but|and|\.|\n|$)/i,
    /ordered\s+([A-Za-z0-9\s]+?)\s*(?:,|but|and|\.|\n|$)/i,
    /your\s+([A-Za-z0-9\s]+?)\s+(?:was|is)\s+missing/i,
    /missing\s+([A-Za-z0-9\s]+?)(?:\.|,|\n|$)/i,
    /replacement of\s+([A-Za-z0-9\s]+?)\s+should/i
  ]);

  return item.trim();
};

const cleanComplaintType = (complaintType, text) => {
  const directMatch = allowedComplaintTypes.find(
    (type) => type.toLowerCase() === String(complaintType).trim().toLowerCase()
  );

  if (directMatch) return directMatch;

  return detectComplaintType(text);
};

const cleanResolutionType = (resolutionType, text) => {
  const directMatch = allowedResolutionTypes.find(
    (type) => type.toLowerCase() === String(resolutionType).trim().toLowerCase()
  );

  if (directMatch) return directMatch;

  return detectResolutionType(text);
};

const cleanExtractedData = (data) => {
  return {
    customerName: data.customerName || "",
    customerPhone: cleanPhoneNumber(data.customerPhone || ""),
    orderId: data.orderId || "",
    complaintType: data.complaintType || "",
    itemName: data.itemName || "",
    resolutionType: data.resolutionType || "",
    resolutionDetails: data.resolutionDetails || ""
  };
};

const parseComplaintText = (inputText) => {
  const text = normalizeText(inputText);

  const customerName = extractValue(text, [
    /Customer Name\s*[:\-]?\s*([A-Za-z\s]+?)(?=\n|Customer Phone|Phone|WhatsApp|Mobile|Order ID|$)/i,
    /My name is\s+([A-Za-z\s]+?)(?:\.|,|\n|$)/i,
    /Name\s*[:\-]?\s*([A-Za-z\s]+?)(?=\n|Phone|WhatsApp|Mobile|Order ID|$)/i
  ]);

  const customerPhone = extractValue(text, [
    /Customer Phone\s*[:\-]?\s*(\+?91[\s\-]?\d{10})/i,
    /Customer WhatsApp Number\s*[:\-]?\s*(\+?91[\s\-]?\d{10})/i,
    /WhatsApp Number\s*[:\-]?\s*(\+?91[\s\-]?\d{10})/i,
    /WhatsApp\s*[:\-]?\s*(\+?91[\s\-]?\d{10})/i,
    /Phone\s*[:\-]?\s*(\+?91[\s\-]?\d{10})/i,
    /Mobile\s*[:\-]?\s*(\+?91[\s\-]?\d{10})/i,
    /Contact\s*[:\-]?\s*(\+?91[\s\-]?\d{10})/i,
    /(\+?91[\s\-]?\d{10})/i,
    /\b([6-9]\d{9})\b/i
  ]);

  const orderId = extractValue(text, [
    /Order ID\s*[:\-]?\s*([A-Z0-9]+)/i,
    /Order\s*[:\-]?\s*([A-Z0-9]+)/i,
    /order\s+ID\s+is\s+([A-Z0-9]+)/i,
    /order\s+([A-Z]{1,5}[0-9]{2,})/i,
    /Order ID\s*[:\-]?\s*(\d+)/i
  ]);

  const rawComplaintType = extractValue(text, [
    /Complaint Type\s*[:\-]?\s*([^\n\r]+)/i
  ]);

  const complaintType = cleanComplaintType(rawComplaintType, text);

  const itemName = extractItemName(text);

  const rawResolutionType = extractValue(text, [
    /Suggested Resolution\s*[:\-]?\s*([^\n\r]+)/i,
    /Resolution Type\s*[:\-]?\s*([^\n\r]+)/i,
    /Resolution\s*[:\-]?\s*([^\n\r]+)/i
  ]);

  const resolutionType = cleanResolutionType(rawResolutionType, text);

  const resolutionDetails =
    extractValue(text, [
      /Resolution Details\s*[:\-]?\s*([^\n\r]+)/i,
      /Refund of\s*([^\n\r]+)/i,
      /refund amount is\s*([^\n\r]+)/i,
      /Replacement of\s*([^\n\r]+)/i
    ]) ||
    (resolutionType === "Full Refund"
      ? "Refund should be processed for the affected item."
      : resolutionType === "Quiklee Credits"
      ? "Quiklee Credits should be added to the customer's account."
      : resolutionType === "Replacement on Next Delivery"
      ? "Replacement should be arranged in the next delivery slot."
      : resolutionType === "Partial Refund"
      ? "Partial refund should be processed for the affected issue."
      : "");

  return cleanExtractedData({
    customerName,
    customerPhone,
    orderId,
    complaintType,
    itemName,
    resolutionType,
    resolutionDetails
  });
};

const extractTextFromFile = async (file) => {
  if (!file) return "";

  if (file.mimetype === "application/pdf") {
    const pdfData = await pdfParse(file.buffer);
    return pdfData.text || "";
  }

  if (file.mimetype.startsWith("image/")) {
    const result = await Tesseract.recognize(file.buffer, "eng");
    return result.data.text || "";
  }

  if (file.mimetype === "text/plain") {
    return file.buffer.toString("utf-8");
  }

  return "";
};

const extractComplaintDetails = async (req, res) => {
  try {
    console.log("FREE EXTRACT CONTROLLER RUNNING");

    const emailText = req.body.emailText || "";
    const uploadedFile = req.file;

    if (!emailText && !uploadedFile) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF/image or paste email text"
      });
    }

    let extractedText = emailText;

    if (uploadedFile) {
      extractedText = await extractTextFromFile(uploadedFile);
    }

    if (!extractedText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Could not read text from the uploaded file"
      });
    }

    const extractedData = parseComplaintText(extractedText);

    console.log("Extracted Data:", extractedData);

    return res.status(200).json({
      success: true,
      message: "Complaint details extracted successfully",
      data: extractedData,
      rawText: extractedText
    });
  } catch (error) {
    console.error("Extract Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to extract complaint details"
    });
  }
};

module.exports = {
  extractComplaintDetails
};