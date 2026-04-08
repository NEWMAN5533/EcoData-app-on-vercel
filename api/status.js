import axios from "axios";

export default async function handler(req, res) {
  const { orderIdOrRef } = req.query;

  if (!orderIdOrRef) {
    return res.status(400).json({ error: "Missing order reference" });
  }

  try {
    const base = process.env.SWIFT_BASE_URL.replace(/\/$/, "");

    const response = await axios.get(
      `${base}/order/status/${orderIdOrRef}`,
      {
        headers: {
          "x-api-key": process.env.SWIFT_API_KEY,
        },
      }
    );

    res.status(200).json(response.data);

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch status" });
  }
}