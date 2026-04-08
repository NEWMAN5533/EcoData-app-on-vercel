import axios from "axios";
import { processedOrders } from "../lib/memoryStore.js";

export default async function handler(req, res) {
  const { fullName, phone, paymentReference } = req.body;

  if (!fullName || !phone || !paymentReference) {
    return res.status(400).json({ error: "Missing fields" });
  }

  if (processedOrders.has(paymentReference)) {
    return res.status(200).json({
      success: true,
      message: "Already processed",
      data: processedOrders.get(paymentReference),
    });
  }

  try {
    const verify = await axios.get(
      `https://api.paystack.co/transaction/verify/${paymentReference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (verify.data.data.status !== "success") {
      throw new Error("Payment failed");
    }

    const base = process.env.SWIFT_BASE_URL.replace(/\/$/, "");

    const swiftRes = await axios.post(
      `${base}/services/mtn-afa`,
      { fullName, phone },
      {
        headers: {
          "x-api-key": process.env.SWIFT_API_KEY,
        },
      }
    );

    processedOrders.set(paymentReference, swiftRes.data);

    res.status(200).json({
      success: true,
      message: "AFA success",
      data: swiftRes.data,
    });

  } catch (err) {
    res.status(500).json({ error: "AFA failed" });
  }
}