const Groq = require("groq-sdk");
const db = require("../config/db");

const cleanMessage = (text) => {
  if (!text) return "";

  return text
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\*\*/g, "")
    .trim();
};

const generateFallbackMessage = ({
  customerName,
  orderId,
  complaintType,
  itemName,
  resolutionType,
  resolutionDetails
}) => {
  return `Hi ${customerName},

We sincerely apologize for the inconvenience caused regarding ${complaintType.toLowerCase()} for ${itemName} in order ${orderId}. As a resolution, we will proceed with ${resolutionType.toLowerCase()}. ${
    resolutionDetails ||
    "Our support team will take the required action as soon as possible."
  } Thank you for your patience and understanding.

- Team Quiklee`;
};

const generateComplaintMessage = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      orderId,
      complaintType,
      itemName,
      resolutionType,
      resolutionDetails
    } = req.body || {};

    if (
      !customerName ||
      !customerPhone ||
      !orderId ||
      !complaintType ||
      !itemName ||
      !resolutionType
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields"
      });
    }

    const cleanPhone = String(customerPhone).replace(/\D/g, "");

    if (!cleanPhone.startsWith("91") || cleanPhone.length !== 12) {
      return res.status(400).json({
        success: false,
        message:
          "Enter valid Indian WhatsApp number with country code. Example: 917462050039"
      });
    }

    const [existingOrder] = await db.execute(
      "SELECT id FROM generated_messages WHERE order_id = ?",
      [orderId]
    );

    if (existingOrder.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Order ID ${orderId} already exists. You cannot generate another response for the same order ID.`
      });
    }

    let generatedMessage = "";

    try {
      if (!process.env.GROQ_API_KEY) {
        throw new Error("Groq API key missing");
      }

      const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
      });

      const prompt = `
Generate one professional WhatsApp customer support response for Quiklee.

Details:
Customer Name: ${customerName}
Order ID: ${orderId}
Complaint Type: ${complaintType}
Item Name: ${itemName}
Resolution Type: ${resolutionType}
Resolution Details: ${resolutionDetails || "No extra details"}

Rules:
- Start with: Hi ${customerName},
- Apologize sincerely.
- Mention the full order ID: ${orderId}
- Mention the item name: ${itemName}
- Mention the complaint type: ${complaintType}
- Mention the resolution type: ${resolutionType}
- Use resolution details naturally if available.
- Write 4 to 5 complete sentences.
- Do not use bullet points.
- Do not use headings.
- End exactly with: - Team Quiklee
- Return only the final WhatsApp message.
`;

      const completion = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful customer support assistant that writes short, empathetic WhatsApp complaint resolution messages."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 250
      });

      generatedMessage = cleanMessage(
        completion.choices?.[0]?.message?.content
      );

      const isValid =
        generatedMessage &&
        generatedMessage.includes(customerName) &&
        generatedMessage.includes(orderId) &&
        generatedMessage.toLowerCase().includes(itemName.toLowerCase()) &&
        generatedMessage.includes("Team Quiklee");

      if (!isValid) {
        generatedMessage = generateFallbackMessage({
          customerName,
          orderId,
          complaintType,
          itemName,
          resolutionType,
          resolutionDetails
        });
      }
    } catch (aiError) {
      console.log("Groq failed, using fallback:", aiError.message);

      generatedMessage = generateFallbackMessage({
        customerName,
        orderId,
        complaintType,
        itemName,
        resolutionType,
        resolutionDetails
      });
    }

    const sql = `
      INSERT INTO generated_messages
      (
        customer_name,
        customer_phone,
        order_id,
        complaint_type,
        item_name,
        resolution_type,
        resolution_details,
        generated_message,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      customerName,
      cleanPhone,
      orderId,
      complaintType,
      itemName,
      resolutionType,
      resolutionDetails || "",
      generatedMessage,
      "Pending"
    ]);

    console.log("Saved to MySQL with ID:", result.insertId);

    return res.status(201).json({
      success: true,
      message: "Message generated and saved successfully",
      data: {
        id: result.insertId,
        generatedMessage,
        customerPhone: cleanPhone
      }
    });
  } catch (error) {
    console.error("Generate Error:", error.message);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "This Order ID already exists. Please use a unique Order ID."
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate and save message"
    });
  }
};

module.exports = {
  generateComplaintMessage
};