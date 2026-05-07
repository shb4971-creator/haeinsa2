import { useEffect, useState } from "react";

export default function Success() {
  const [status, setStatus] = useState("confirming");
  const [result, setResult] = useState(null);
  const [pending, setPending] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentKey = params.get("paymentKey");
    const orderId = params.get("orderId");
    const amount = params.get("amount");
    const saved = sessionStorage.getItem("pendingPrayer");
    const pendingPrayer = saved ? JSON.parse(saved) : null;
    setPending(pendingPrayer);

    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setResult({ message: "결제 승인 정보가 부족합니다." });
      return;
    }

    async function confirm() {
      try {
        const res = await fetch("/api/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount: Number(amount), pendingPrayer }),
        });
        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          setResult(data);
          return;
        }
        setStatus("success");
        setResult(data);
        sessionStorage.removeItem("pendingPrayer");
      } catch (e) {
        setStatus("error");
        setResult({ message: e.message });
      }
    }
    confirm();
  }, []);

  return (
    <main className="resultPage">
      <section className="resultCard">
        <span className="eyebrow">Payment Result</span>
        {status === "confirming" && <><h1>결제 승인 중입니다</h1><p>잠시만 기다려 주세요.</p></>}
        {status === "success" && <><h1>결제가 완료되었습니다</h1><p>{pending?.type === "lantern" ? "연등" : "기와"} 서원이 정상 접수되었습니다.</p>{pending && <div className="summary"><b>{pending.code}</b><span>{pending.name}</span><p>{pending.message}</p></div>}</>}
        {status === "error" && <><h1>결제 승인 실패</h1><p>{result?.message || "알 수 없는 오류가 발생했습니다."}</p></>}
        <a className="homeLink" href="/">처음으로 돌아가기</a>
      </section>
    </main>
  );
}
