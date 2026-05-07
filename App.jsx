import { useMemo, useState } from "react";
import { loadTossPayments } from "@tosspayments/payment-sdk";

const TEMPLE_PHOTO_URL = ""; // public/temple.jpg 사용 시 "/temple.jpg"
const CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY;
const BASE_URL = import.meta.env.VITE_APP_BASE_URL || window.location.origin;

const TILE_ROWS = 12;
const TILE_COLS = 30;
const TILE_TOTAL = TILE_ROWS * TILE_COLS;
const LANTERN_ROWS = 5;
const LANTERN_COLS = 18;
const LANTERN_TOTAL = LANTERN_ROWS * LANTERN_COLS;

const SAMPLES = [
  ["김보현", "가족의 평안과 건강을 발원합니다.", 30000],
  ["이서연", "좋은 인연과 지혜를 기원합니다.", 50000],
  ["박지훈", "부모님의 무병장수를 발원합니다.", 100000],
  ["정다은", "아이의 앞날에 밝은 길이 열리길 바랍니다.", 30000],
  ["한마음회", "모든 생명의 평화를 기원합니다.", 200000],
];

const LANTERN_COLORS = ["#ff4757", "#ffa502", "#feca57", "#ff6b81", "#eccc68", "#ff7f50"];

function makeItems(prefix, total, cols, seedCount, type) {
  const arr = Array.from({ length: total }, (_, i) => ({
    id: i + 1,
    type,
    code: `${prefix}-${String(Math.floor(i / cols) + 1).padStart(2, "0")}-${String((i % cols) + 1).padStart(2, "0")}`,
    name: "",
    message: "",
    amount: 0,
    color: LANTERN_COLORS[i % LANTERN_COLORS.length],
    occupied: false,
  }));

  const used = new Set();
  while (used.size < seedCount) used.add(Math.floor(Math.random() * total));
  let k = 0;
  used.forEach((idx) => {
    const s = SAMPLES[k % SAMPLES.length];
    arr[idx] = {
      ...arr[idx],
      name: s[0],
      message: s[1],
      amount: type === "lantern" ? Math.max(20000, s[2] - 10000) : s[2],
      color: LANTERN_COLORS[k % LANTERN_COLORS.length],
      occupied: true,
    };
    k++;
  });
  return arr;
}

const won = (n) => new Intl.NumberFormat("ko-KR").format(n);

export default function App() {
  const [tiles, setTiles] = useState(() => makeItems("HG", TILE_TOTAL, TILE_COLS, 74, "tile"));
  const [lanterns, setLanterns] = useState(() => makeItems("LD", LANTERN_TOTAL, LANTERN_COLS, 22, "lantern"));
  const [mode, setMode] = useState("tile");
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", message: "", amount: 30000, color: "#ffa502" });
  const [paying, setPaying] = useState(false);

  const items = mode === "tile" ? tiles : lanterns;
  const setItems = mode === "tile" ? setTiles : setLanterns;
  const selectedItem = selected !== null ? items[selected] : null;

  const filledTiles = tiles.filter((t) => t.occupied).length;
  const filledLanterns = lanterns.filter((t) => t.occupied).length;
  const totalAmount = [...tiles, ...lanterns].reduce((sum, item) => sum + item.amount, 0);
  const tileProgress = Math.round((filledTiles / TILE_TOTAL) * 100);
  const lanternProgress = Math.round((filledLanterns / LANTERN_TOTAL) * 100);

  const top = useMemo(
    () => [...tiles, ...lanterns].filter((t) => t.occupied).sort((a, b) => b.amount - a.amount).slice(0, 6),
    [tiles, lanterns]
  );

  const openItem = (type, idx) => {
    setMode(type);
    setSelected(idx);
    const target = type === "tile" ? tiles[idx] : lanterns[idx];
    if (!target.occupied) {
      setForm({
        name: "",
        message: "",
        amount: type === "tile" ? 30000 : 20000,
        color: LANTERN_COLORS[idx % LANTERN_COLORS.length],
      });
      setModal(true);
    } else {
      setModal(false);
    }
  };

  const savePending = (orderId, amount) => {
    sessionStorage.setItem("pendingPrayer", JSON.stringify({
      type: mode,
      code: selectedItem.code,
      index: selected,
      name: form.name.trim(),
      message: form.message.trim(),
      amount,
      color: form.color,
      orderId,
    }));
  };

  const startPayment = async () => {
    if (!selectedItem || !form.name.trim() || !form.message.trim()) {
      alert("이름과 발원문을 입력해 주세요.");
      return;
    }
    if (!CLIENT_KEY || CLIENT_KEY.includes("여기에")) {
      alert("VITE_TOSS_CLIENT_KEY가 설정되지 않았습니다. .env를 확인해 주세요.");
      return;
    }

    try {
      setPaying(true);
      const tossPayments = await loadTossPayments(CLIENT_KEY);
      const amount = Number(form.amount);
      const orderId = `${mode}_${selectedItem.code}_${Date.now()}`;
      savePending(orderId, amount);

      await tossPayments.requestPayment("카드", {
        amount,
        orderId,
        orderName: mode === "tile" ? `해인사 기와불사 ${selectedItem.code}` : `해인사 연등불사 ${selectedItem.code}`,
        customerName: form.name.trim(),
        successUrl: `${BASE_URL}/success`,
        failUrl: `${BASE_URL}/fail`,
      });
    } catch (e) {
      alert(e?.message || "결제창 호출 중 오류가 발생했습니다.");
    } finally {
      setPaying(false);
    }
  };

  const demoRegister = () => {
    if (!selectedItem || !form.name.trim() || !form.message.trim()) {
      alert("이름과 발원문을 입력해 주세요.");
      return;
    }
    setItems((prev) => {
      const next = [...prev];
      next[selected] = {
        ...next[selected],
        name: form.name.trim(),
        message: form.message.trim(),
        amount: Number(form.amount),
        color: form.color,
        occupied: true,
      };
      return next;
    });
    setModal(false);
  };

  return (
    <main className="page">
      <section className="hero">
        <div className="nav">
          <div>
            <span className="eyebrow">온라인 기와불사 · 연등불사 · 결제 MVP</span>
            <h1>해인사 대웅전 앞마당 디지털 서원</h1>
          </div>
          <div className="switcher">
            <button className={mode === "tile" ? "on" : ""} onClick={() => { setMode("tile"); setSelected(null); }}>기와</button>
            <button className={mode === "lantern" ? "on" : ""} onClick={() => { setMode("lantern"); setSelected(null); }}>연등</button>
          </div>
        </div>

        <p className="lead">
          지붕에는 기와를, 앞마당에는 연등을 같은 방식으로 배치했습니다. 사용자는 원하는 위치를 선택하고 발원문과 후원금액을 등록할 수 있습니다.
        </p>

        <div className="stats">
          <div><b>{TILE_TOTAL}</b><span>총 기와</span></div>
          <div><b>{filledTiles}</b><span>기와 서원</span></div>
          <div><b>{filledLanterns}/{LANTERN_TOTAL}</b><span>연등 서원</span></div>
          <div><b>{won(totalAmount)}원</b><span>누적 후원</span></div>
        </div>
      </section>

      <section className="temple">
        <div className="bar">
          <div>
            <strong>{mode === "tile" ? "대웅전 지붕 기와 영역" : "대웅전 앞마당 연등 영역"}</strong>
            <p>기와 또는 연등을 클릭하면 서원 등록/상세보기가 열립니다.</p>
          </div>
          <div className="gauge">
            <span>{mode === "tile" ? "기와 완성률" : "연등 점등률"}</span>
            <div><i style={{ width: `${mode === "tile" ? tileProgress : lanternProgress}%` }} /></div>
            <b>{mode === "tile" ? tileProgress : lanternProgress}%</b>
          </div>
        </div>

        <div className="scene">
          {TEMPLE_PHOTO_URL ? <img className="photo" src={TEMPLE_PHOTO_URL} alt="해인사 대웅전" /> : <FallbackTemple />}
          <div className={`tileLayer ${mode !== "tile" ? "dim" : ""}`}>
            {tiles.map((t, i) => (
              <button key={t.id} title={`${t.code} ${t.occupied ? t.name : "빈 기와"}`} onClick={() => openItem("tile", i)} className={`tile ${t.occupied ? "filled" : ""} ${mode === "tile" && selected === i ? "active" : ""}`}>
                {t.occupied ? "卍" : ""}
              </button>
            ))}
          </div>

          <div className={`lanternLayer ${mode !== "lantern" ? "dim" : ""}`}>
            {lanterns.map((l, i) => (
              <button
                key={l.id}
                title={`${l.code} ${l.occupied ? l.name : "빈 연등"}`}
                onClick={() => openItem("lantern", i)}
                className={`lantern ${l.occupied ? "lit" : ""} ${mode === "lantern" && selected === i ? "active" : ""}`}
                style={{ "--c": l.occupied ? l.color : "rgba(255,255,255,.18)" }}
              >
                <span />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="content">
        <article className="panel">
          <h2>선택한 {mode === "tile" ? "기와" : "연등"}</h2>
          {selectedItem ? selectedItem.occupied ? (
            <div className="detail">
              <span>{selectedItem.code}</span>
              <h3>{selectedItem.name}</h3>
              <p>{selectedItem.message}</p>
              <b>{won(selectedItem.amount)}원</b>
            </div>
          ) : (
            <div className="empty">
              <span>{selectedItem.code}</span>
              <p>아직 비어 있는 {mode === "tile" ? "기와" : "연등"}입니다.</p>
              <button onClick={() => setModal(true)}>서원 등록하기</button>
            </div>
          ) : <p className="muted">원하는 위치를 클릭하면 상세 정보가 표시됩니다.</p>}
        </article>

        <article className="panel">
          <h2>대표 서원</h2>
          {top.map((d) => (
            <div className="donor" key={d.code}>
              <span>{d.type === "tile" ? "기와" : "연등"}</span>
              <strong>{d.name}</strong>
              <em>{won(d.amount)}원</em>
            </div>
          ))}
        </article>

        <article className="panel">
          <h2>서비스 확장 포인트</h2>
          <ul>
            <li>기와: 지붕 좌표와 실제 기와 후원 연결</li>
            <li>연등: 앞마당 연등 행렬/야간 점등 연출</li>
            <li>결제 후 DB 저장 및 관리자 승인</li>
            <li>연등 색상, 기간, 이름표, 공유 링크</li>
          </ul>
        </article>
      </section>

      {modal && selectedItem && (
        <div className="modalBg" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <span className="code">{selectedItem.code}</span>
            <h2>{mode === "tile" ? "기와 서원 등록" : "연등 서원 등록"}</h2>

            <label>이름 / 단체명</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="예: 최재호" />

            <label>발원문</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="가족의 건강과 평안을 발원합니다." />

            <label>후원 금액</label>
            <select value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}>
              {mode === "tile" ? (
                <>
                  <option value={30000}>기와 3만원</option>
                  <option value={50000}>기와 5만원</option>
                  <option value={100000}>기와 10만원</option>
                  <option value={200000}>기와 20만원</option>
                </>
              ) : (
                <>
                  <option value={20000}>연등 2만원</option>
                  <option value={30000}>연등 3만원</option>
                  <option value={50000}>연등 5만원</option>
                  <option value={100000}>가족 연등 10만원</option>
                </>
              )}
            </select>

            {mode === "lantern" && (
              <>
                <label>연등 색상</label>
                <div className="colors">
                  {LANTERN_COLORS.map((c) => (
                    <button key={c} onClick={() => setForm({ ...form, color: c })} style={{ background: c }} className={form.color === c ? "picked" : ""} />
                  ))}
                </div>
              </>
            )}

            <div className="notice">테스트 결제용 MVP입니다. 실제 운영 전에는 결제 승인 후 DB 저장과 관리자 승인 절차가 필요합니다.</div>

            <div className="actions">
              <button className="ghost" onClick={() => setModal(false)}>취소</button>
              <button className="secondary" onClick={demoRegister}>데모 등록</button>
              <button className="primary" onClick={startPayment} disabled={paying}>{paying ? "결제 준비 중..." : "결제하고 등록"}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function FallbackTemple() {
  return (
    <div className="fallback">
      <div className="sky" />
      <div className="mountain a" />
      <div className="mountain b" />
      <div className="ground" />
      <div className="shadow" />
      <div className="base" />
      <div className="wall">{Array.from({ length: 9 }, (_, i) => <span key={i} />)}</div>
      <div className="columns">{Array.from({ length: 8 }, (_, i) => <span key={i} />)}</div>
      <div className="roof" />
      <div className="deepRoof" />
      <div className="ridge" />
      <div className="eave left" />
      <div className="eave right" />
      <div className="sign">大雄殿</div>
      <div className="yardPath" />
    </div>
  );
}
