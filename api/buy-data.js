import axios from "axios";
import { processedOrders } from "../lib/memoryStore.js";

export default async function handler(req, res) {
  const data = req.method === "POST" ? req.body : req.query;

  const { network, recipient, package: pkg, size, paymentReference } = data;

  if (!network || !recipient || !pkg || !paymentReference) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  // Prevent duplicates
  if (processedOrders.has(paymentReference)) {
    return res.status(200).json({
      success: true,
      message: "Already processed",
      order: processedOrders.get(paymentReference),
    });
  }

  try {
    const orderData = {
      type: "single",
      volume: parseInt(size, 10),
      phone: recipient,
      offerSlug: pkg,
    };

    const base = process.env.SWIFT_BASE_URL.replace(/\/$/, "");
    const response = await axios.post(
      `${base}/order/${network}`,
      orderData,
      {
        headers: {
          "x-api-key": process.env.SWIFT_API_KEY,
        },
      }
    );

    processedOrders.set(paymentReference, response.data);

    res.status(200).json({
      success: true,
      message: "Bundle ordered",
      order: response.data,
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to process order" });
  }
}