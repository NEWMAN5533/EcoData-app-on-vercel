import axios from "axios";
import { db } from "../firebaseAdmin.js";

export default async function handler(req, res) {
  const { reference, uid } = req.body;

  if (!reference || !uid) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;

    if (data.status !== "success") {
      return res.status(400).json({ error: "Payment failed" });
    }

    await db.collection("users").doc(uid).update({
      isAgent: true,
      paymentStatus: "verified",
    });

    res.status(200).json({ success: true });

  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
}