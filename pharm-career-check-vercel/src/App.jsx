import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// ===================== 設定 =====================

// 職種（スコアのキー）
const ROLES = ["病院薬剤師", "調剤薬局", "ドラッグストア", "企業（研究/開発）", "在宅医療"];

// LPのコピー
const LP_COPY = {
  title: "薬学部キャリア診断",
  lead:
    "20問に答えるだけで、あなたに合った薬剤師の仕事を診断！\n病院 / 調剤 / ドラッグ / 企業 / 在宅 など、いまの強みから将来の道を可視化します。",
};

// 「次の一歩」ひな型
const NEXT_STEP = {
  病院薬剤師: ["症例レビューの読み込み習慣", "急性期/慢性期で関心領域の棚卸し", "院内チームでの役割体験"],
  調剤薬局: ["かかりつけ算定のチャレンジ", "服薬フォローのテンプレ整備", "在宅同行で現場理解"],
  ドラッグストア: ["OTC分類の強化", "カウンセリングの型作り", "健康イベントの企画同席"],
  "企業（研究/開発）": ["研究テーマの調査メモ", "学会/論文のサマリ作成", "統計・薬事の基礎学習"],
  在宅医療: ["多職種カンファ参加", "訪問同行で実地理解", "福祉/介護制度の基本理解"],
};

// 質問20問（スコア加算の重み）
// weightは {職種: 加点} の形で必要分だけ書けばOK（書かない職種は0）
const QUESTIONS = [
  {
    q: "落ち着いた環境より、緊張感のある現場が好きだ。",
    weight: { 病院薬剤師: 2, 在宅医療: 1 },
  },
  { q: "患者さんと継続的に関わるのが向いている。", weight: { 調剤薬局: 2, 在宅医療: 1 } },
  { q: "対面販売や提案が楽しい。", weight: { ドラッグストア: 2 } },
  { q: "研究や論文を読むのが億劫ではない。", weight: { "企業（研究/開発）": 2, 病院薬剤師: 1 } },
  { q: "多職種連携の場で動くのが好き。", weight: { 病院薬剤師: 1, 在宅医療: 2 } },
  { q: "OTCやセルフメディケーション領域に関心が高い。", weight: { ドラッグストア: 2 } },
  { q: "服薬フォローやかかりつけ支援を丁寧にやりたい。", weight: { 調剤薬局: 2 } },
  { q: "統計やデータ分析に抵抗がない。", weight: { "企業（研究/開発）": 2 } },
  { q: "急性期・救急の現場に興味がある。", weight: { 病院薬剤師: 2 } },
  { q: "在宅訪問や生活背景の把握に魅力を感じる。", weight: { 在宅医療: 2 } },
  { q: "イベント企画や売場作りに関心がある。", weight: { ドラッグストア: 2 } },
  { q: "レセプトや加算要件などを追うのが苦にならない。", weight: { 調剤薬局: 1, 在宅医療: 1 } },
  { q: "海外学会や英語論文にもトライしたい。", weight: { "企業（研究/開発）": 2, 病院薬剤師: 1 } },
  { q: "病棟でのチーム医療に関わりたい。", weight: { 病院薬剤師: 2 } },
  { q: "地域連携や訪問薬剤管理指導に面白さを感じる。", weight: { 在宅医療: 2, 調剤薬局: 1 } },
  { q: "接客での雑談やヒアリングが得意だ。", weight: { ドラッグストア: 2, 調剤薬局: 1 } },
  { q: "細かいルールや添付文書を読むことに苦手意識がない。", weight: { 病院薬剤師: 1, 調剤薬局: 1 } },
  { q: "仮説検証や実験で手を動かすのが好き。", weight: { "企業（研究/開発）": 2 } },
  { q: "ご家族対応やケアマネとの連携も前向きにできる。", weight: { 在宅医療: 2 } },
  { q: "薬局運営や店舗数管理、売上にも興味がある。", weight: { ドラッグストア: 1, 調剤薬局: 1 } },
];
// =================================================

const Page = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25 }}
    style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 20px" }}
  >
    {children}
  </motion.div>
);

export default function App() {
  const [step, setStep] = useState("lp"); // 'lp' | 'quiz' | 'result'
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(() =>
    Object.fromEntries(ROLES.map((r) => [r, 0]))
  );

  const progress = (idx / QUESTIONS.length) * 100;

  const onAnswer = (agree) => {
    // agree: true（はい） or false（いいえ）
    const { weight } = QUESTIONS[idx];
    if (agree) {
      const s = { ...score };
      for (const [role, w] of Object.entries(weight)) s[role] += w;
      setScore(s);
    }
    if (idx + 1 < QUESTIONS.length) setIdx(idx + 1);
    else setStep("result");
  };

  const resultData = useMemo(() => {
    // 正規化（最大を100にスケール）
    const max = Math.max(...Object.values(score), 1);
    return ROLES.map((role) => ({
      name: role,
      value: Math.round((score[role] / max) * 100),
    })).sort((a, b) => b.value - a.value);
  }, [score]);

  const top3 = resultData.slice(0, 3);

  return (
    <div
      style={{
        minHeight: "100svh",
        background:
          "radial-gradient(1200px 800px at 10% -10%, #e0f7ff80 0%, transparent 60%), radial-gradient(1000px 700px at 110% 0%, #fff0f680 0%, transparent 60%), linear-gradient(135deg, #f7fbff 0%, #f9f7ff 100%)",
      }}
    >
      <AnimatePresence mode="wait">
        {step === "lp" && (
          <Page key="lp">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr",
                gap: 24,
                alignItems: "center",
                background: "#ffffffcc",
                boxShadow:
                  "0 10px 25px rgba(16,24,40,.08), 0 2px 8px rgba(16,24,40,.06)",
                borderRadius: 20,
                padding: 28,
              }}
            >
              <div>
                <h1 style={{ margin: "0 0 8px", fontSize: 36 }}>
                  {LP_COPY.title}
                </h1>
                <p style={{ color: "#667085", whiteSpace: "pre-wrap" }}>
                  {LP_COPY.lead}
                </p>
                <button
                  onClick={() => setStep("quiz")}
                  style={{
                    display: "inline-flex",
                    gap: 10,
                    alignItems: "center",
                    background: "#4caf50",
                    color: "#fff",
                    fontWeight: 700,
                    padding: "12px 20px",
                    borderRadius: 12,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 8px 18px rgba(76,175,80,.2)",
                  }}
                >
                  診断を受けてみる →
                </button>
              </div>
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: [-6, 0, -6] }}
                transition={{ duration: 6, repeat: Infinity }}
              >
                {/* 画像は public/hero.png 等に差し替えOK */}
                <img
                  src="https://unpkg.com/hero-patterns@1.0.0/svg/undulating.svg"
                  alt=""
                  style={{ width: "100%", maxWidth: 520, filter: "drop-shadow(0 20px 40px rgba(16,24,40,.12))" }}
                />
              </motion.div>
            </div>
          </Page>
        )}

        {step === "quiz" && (
          <Page key="quiz">
            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                boxShadow:
                  "0 10px 25px rgba(16,24,40,.08), 0 2px 8px rgba(16,24,40,.06)",
                padding: 24,
              }}
            >
              <div
                style={{
                  height: 8,
                  background: "#eef2f7",
                  borderRadius: 99,
                  overflow: "hidden",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    background: "#4caf50",
                    transition: "width .25s ease",
                  }}
                />
              </div>
              <p style={{ margin: "0 0 8px", color: "#667085" }}>
                {idx + 1}/{QUESTIONS.length}
              </p>
              <h2 style={{ margin: "0 0 16px", lineHeight: 1.4 }}>
                {QUESTIONS[idx].q}
              </h2>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={() => onAnswer(true)}
                  style={btnStyle("#4caf50")}
                >
                  はい
                </button>
                <button
                  onClick={() => onAnswer(false)}
                  style={btnStyle("#9aa1ab")}
                >
                  いいえ
                </button>
                <button
                  onClick={() => onAnswer(true)} // どちらかと言えば yes 側に
                  style={btnOutline}
                >
                  どちらかと言えばはい
                </button>
              </div>
            </div>
          </Page>
        )}

        {step === "result" && (
          <Page key="result">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr",
                gap: 24,
                alignItems: "start",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  boxShadow:
                    "0 10px 25px rgba(16,24,40,.08), 0 2px 8px rgba(16,24,40,.06)",
                  padding: 24,
                }}
              >
                <h2 style={{ marginTop: 0 }}>あなたのマッチ率</h2>
                <div style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={resultData} layout="vertical" margin={{ left: 12 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Bar dataKey="value" fill="#4caf50" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  boxShadow:
                    "0 10px 25px rgba(16,24,40,.08), 0 2px 8px rgba(16,24,40,.06)",
                  padding: 24,
                }}
              >
                <h3 style={{ marginTop: 0 }}>上位3職種と「次の一歩」</h3>
                <ul style={{ paddingLeft: 18, margin: "0 0 12px" }}>
                  {top3.map((r, i) => (
                    <li key={r.name} style={{ marginBottom: 12 }}>
                      <strong>
                        {i + 1}. {r.name}
                      </strong>{" "}
                      <span style={{ color: "#667085" }}>（マッチ率 {r.value}%）</span>
                      <ul style={{ margin: "6px 0 0 18px" }}>
                        {(NEXT_STEP[r.name] || []).map((n) => (
                          <li key={n} style={{ color: "#667085" }}>
                            {n}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    onClick={() => {
                      // リセットして再診断
                      setIdx(0);
                      setScore(Object.fromEntries(ROLES.map((r) => [r, 0])));
                      setStep("quiz");
                    }}
                    style={btnStyle("#4caf50")}
                  >
                    もう一度診断する
                  </button>
                  <button onClick={() => setStep("lp")} style={btnOutline}>
                    LPに戻る
                  </button>
                </div>
              </div>
            </div>
          </Page>
        )}
      </AnimatePresence>
    </div>
  );
}

// ボタンの簡易スタイル
function btnStyle(color) {
  return {
    background: color,
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 18px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(16,24,40,.08)",
  };
}
const btnOutline = {
  background: "#fff",
  color: "#1a1a1a",
  border: "1px solid #d0d5dd",
  borderRadius: 12,
  padding: "12px 18px",
  fontWeight: 700,
  cursor: "pointer",
};
