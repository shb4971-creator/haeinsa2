export default function Fail() {
  const params = new URLSearchParams(window.location.search);
  const message = params.get("message") || "결제가 취소되었거나 실패했습니다.";
  const code = params.get("code");
  return (
    <main className="resultPage">
      <section className="resultCard">
        <span className="eyebrow">Payment Failed</span>
        <h1>결제가 완료되지 않았습니다</h1>
        <p>{message}</p>
        {code && <p className="muted">오류 코드: {code}</p>}
        <a className="homeLink" href="/">처음으로 돌아가기</a>
      </section>
    </main>
  );
}
