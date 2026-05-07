export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey || secretKey.includes("여기에")) {
    return res.status(500).json({ message: "TOSS_SECRET_KEY 환경변수가 설정되지 않았습니다." });
  }

  const { paymentKey, orderId, amount, pendingPrayer } = req.body || {};
  if (!paymentKey || !orderId || !amount) {
    return res.status(400).json({ message: "paymentKey, orderId, amount가 필요합니다." });
  }

  try {
    const authorization = "Basic " + Buffer.from(secretKey + ":").toString("base64");
    const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: { Authorization: authorization, "Content-Type": "application/json" },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: data?.message || "토스페이먼츠 결제 승인 실패",
        tossResponse: data,
      });
    }

    // TODO: Supabase/Firebase/PostgreSQL 저장
    // pendingPrayer.type: "tile" | "lantern"

    return res.status(200).json({
      message: "결제 승인 성공",
      payment: data,
      prayer: pendingPrayer || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "서버 오류" });
  }
}
