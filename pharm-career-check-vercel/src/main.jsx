import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
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

/** ─────────────────────────────────────────────────
 *  データ定義
 *  20問の設問それぞれが、Yesのときに職種スコアへ加点されます
 *  （Noは0点、迷ったらスキップでもOK）
 *  ───────────────────────────────────────────────── */

const JOB_KEYS = [
  "調剤薬局",
  "病院薬剤師",
  "ドラッグストア",
  "製薬企業MR",
  "研究開発",
];

const QUESTIONS = [
  {
    text: "患者さん一人ひとりと丁寧に向き合うのが好きだ。",
    weight: { 調剤薬局: 2, 病院薬剤師: 1 },
  },
  {
    text: "医師や看護師など多職種と連携して働きたい。",
    weight: { 病院薬剤師: 2, 調剤薬局: 1 },
  },
  {
    text: "売場づくりや接客・販売の工夫が楽しいと感じる。",
    weight: { ドラッグストア: 2 },
  },
  {
    text: "新薬の情報やエビデンスを追うのが好きだ。",
    weight: { 病院薬剤師: 2, 研究開発: 1 },
  },
  {
    text: "数字や目標達成にワクワクできる。",
    weight: { 製薬企業MR: 2, ドラッグストア: 1 },
  },
  {
    text: "細かい作業や記録を正確に続けるのは得意。",
    weight: { 調剤薬局: 2, 研究開発: 1 },
  },
  {
    text: "移動や外勤、フットワーク軽く動くのは苦にならない。",
    weight: { 製薬企業MR: 2, ドラッグストア: 1 },
  },
  {
    text: "患者さんからの相談にじっくり乗るのが好きだ。",
    weight: { 調剤薬局: 2, ドラッグストア: 1 },
  },
  {
    text: "急性期医療やチーム医療の現場で貢献したい。",
    weight: { 病院薬剤師: 2 },
  },
  {
    text: "研究や実験、分析にやりがいを感じる。",
    weight: { 研究開発: 2 },
  },
  {
    text: "地域住民の健康を幅広く支えることに興味がある。",
    weight: { ドラッグストア: 2, 調剤薬局: 1 },
  },
  {
    text: "新しい人とすぐに打ち解けたり関係構築が得意。",
    weight: { 製薬企業MR: 2, ドラッグストア: 1 },
  },
  {
    text: "手順通りに正確に遂行し、ミスを最小にするのが得意。",
    weight: { 調剤薬局: 2, 病院薬剤師: 1 },
  },
  {
    text: "重症患者の薬物治療や薬学的管理に関心がある。",
    weight: { 病院薬剤師: 2 },
  },
  {
    text: "仮説検証やデータ解析に没頭できるタイプだ。",
    weight: { 研究開発: 2 },
  },
  {
    text: "商品をわかりやすく提案したり、売上を作るのが楽しい。",
    weight: { ドラッグストア: 2, 製薬企業MR: 1 },
  },
  {
    text: "薬の適正使用を社会に広める役割にやる気を感じる。",
    weight: { 製薬企業MR: 2, 病院薬剤師: 1 },
  },
  {
    text: "同じ場所でじっくり関係を築き、長く寄り添いたい。",
    weight: { 調剤薬局: 2 },
  },
  {
    text: "スピード感のある忙しい現場でも臨機応変に動ける。",
    weight: { ドラッグストア: 1, 病院薬剤師: 1, 製薬企業MR: 1 },
  },
  {
    text: "基礎研究や創薬に関わってみたいと考えたことがある。",
    weight: { 研究開発: 2 },
  },
];

/** 上位3職種の説明テキスト */
const JOB_DESCRIPTIONS = {
  調剤薬局:
    "地域患者さんに最も近い薬剤師。服薬指導や在宅対応、かかりつけ化など「寄り添う力」が生きます。",
  病院薬剤師:
    "チーム医療の要。注射薬調製や治療モニタリングなど医療の最前線で専門性を発揮します。",
  ドラッグストア:
    "セルフメディケーションの中心。接客・売場づくり・数値管理など多彩なスキルを伸ばせます。",
  製薬企業MR:
    "医療者へ適正使用情報を届ける役割。提案力・関係構築・行動力が強みになります。",
  研究開発:
    "実験計画・データ解析・論理的思考で新しい薬の価値を生み出す仕事。粘り強さが武器です。",
};

/** ─────────────────────────────────────────────────
 *  ユーティリティ
 *  ───────────────────────────────────────────────── */

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const calcResult = (answers) => {
  // 職種別の合計点
  const totals = Object.fromEntries(JOB_KEYS.map((k) => [k, 0]));
  answers.forEach((a, idx) => {
    if (a !== true) return; // Yesのみ加点
    const w = QUESTIONS[idx].weight;
    Object.keys(w).forEach((job) => (totals[job] += w[job]));
  });

  // 合計点の最大値から割合化
  const max = Math.max(...Object.values(totals), 1);
  const data = JOB_KEYS.map((k) => ({
    name: k,
    score: totals[k],
    percent: Math.round((totals[k] / max) * 100),
  }));

  // 上位3件
  const top3 = [...data].sort((a, b) => b.score - a.score).slice(0, 3);

  return { data, top3 };
};

/** ─────────────────────────────────────────────────
 *  UI（LP / 診断 / 結果）
 *  ───────────────────────────────────────────────── */

const pageWrap = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25 },
};

const btnStyle = {
  background: "#5d7bff",
  color: "#fff",
  border: "none",
  padding: "14px 20px",
  borderRadius: 12,
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 6px 20px rgba(93,123,255,.35)",
};

const ghostBtn = {
  background: "transparent",
  color: "#c9d2ff",
  border: "1px solid #334",
  padding: "12px 16px",
  borderRadius: 10,
  fontSize: 14,
  cursor: "pointer",
};

const card = {
  background:
    "linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02))",
  border: "1px solid rgba(255,255,255,.08)",
  borderRadius: 16,
  padding: 20,
};

const Container = ({ children, max = 920 }) => (
  <div
    style={{
      maxWidth: max,
      margin: "0 auto",
      padding: "28px 20px 56px",
    }}
  >
    {children}
  </div>
);

function Landing({ onStart }) {
  return (
    <motion.div key="lp" {...pageWrap}>
      <Container>
        <div style={{ display: "grid", gap: 18 }}>
          <motion.h1
            style={{ margin: 0, lineHeight: 1.2, fontSize: 36 }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            薬学部キャリア診断
          </motion.h1>
          <p style={{ margin: 0, color: "#c9d2ff" }}>
            たった20問に答えるだけ。あなたに合う薬剤師の働き方を、グラフィックでわかりやすく可視化します。
          </p>
          <div style={{ height: 16 }} />
          <div style={{ display: "flex", gap: 12 }}>
            <button style={btnStyle} onClick={onStart}>
              診断を受けてみる
            </button>
            <a
              href="#how"
              style={{ ...ghostBtn, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              仕組みを見る
              <span style={{ opacity: 0.6 }}>→</span>
            </a>
          </div>

          <div style={{ height: 30 }} />

          <div style={{ ...card }}>
            <h3 style={{ margin: "0 0 8px 0" }}>この診断で分かること</h3>
            <ul style={{ margin: 0, paddingLeft: 18, color: "#c9d2ff", lineHeight: 1.7 }}>
              <li>あなたの傾向に合う職種（上位3つ）</li>
              <li>各職種へのマッチ度（グラフ表示）</li>
              <li>それぞれの「次の一歩」アクション</li>
            </ul>
          </div>
        </div>
      </Container>
    </motion.div>
  );
}

function QuestionView({ index, total, q, onAnswer, onBackLP }) {
  const progress = clamp(((index + 1) / total) * 100, 0, 100);

  return (
    <motion.div key={`q-${index}`} {...pageWrap}>
      <Container max={760}>
        <div style={{ display: "grid", gap: 18 }}>
          <div
            style={{
              ...card,
              padding: 16,
              display: "grid",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 12, color: "#9aa6ff" }}>
              Q{index + 1} / {total}
            </div>
            <div
              style={{
                height: 8,
                width: "100%",
                borderRadius: 999,
                background: "rgba(255,255,255,.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background:
                    "linear-gradient(90deg, #5d7bff 0%, #7ca1ff 100%)",
                }}
              />
            </div>
          </div>

          <div style={{ ...card }}>
            <h2 style={{ marginTop: 0, lineHeight: 1.4 }}>{q.text}</h2>
            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              <button style={btnStyle} onClick={() => onAnswer(true)}>
                はい
              </button>
              <button
                style={{ ...ghostBtn, borderColor: "#445", color: "#b8c1ff" }}
                onClick={() => onAnswer(false)}
              >
                いいえ
              </button>
              <button
                style={{ ...ghostBtn, borderColor: "#445", color: "#b8c1ff" }}
                onClick={() => onAnswer(null)}
              >
                スキップ
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button style={{ ...ghostBtn }} onClick={onBackLP}>
              ← LPに戻る
            </button>
            <div style={{ color: "#8ea0ff", fontSize: 12 }}>
              所要時間の目安：2〜3分
            </div>
          </div>
        </div>
      </Container>
    </motion.div>
  );
}

function ResultView({ answers, onRetry, onBackLP }) {
  const { data, top3 } = useMemo(() => calcResult(answers), [answers]);

  return (
    <motion.div key="result" {...pageWrap}>
      <Container>
        <div style={{ display: "grid", gap: 18 }}>
          <h2 style={{ margin: "0 0 4px 0" }}>診断結果</h2>
          <p style={{ margin: 0, color: "#c9d2ff" }}>
            あなたにマッチする職種 上位3つと、全体の傾向を可視化しました。
          </p>

          <div style={{ ...card }}>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#c9d2ff" }}
                    axisLine={{ stroke: "rgba(255,255,255,.2)" }}
                  />
                  <YAxis
                    tick={{ fill: "#c9d2ff" }}
                    axisLine={{ stroke: "rgba(255,255,255,.2)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#101630",
                      border: "1px solid rgba(255,255,255,.1)",
                      color: "#fff",
                      borderRadius: 8,
                    }}
                    formatter={(v, k, p) => [`${p.payload.score} 点`, "スコア"]}
                    labelFormatter={(l) => `${l}`}
                  />
                  <Bar dataKey="score" fill="#7ca1ff" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {top3.map((t, i) => (
              <div key={t.name} style={{ ...card }}>
                <div
                  style={{
                    fontSize: 12,
                    color: "#9aa6ff",
                    marginBottom: 6,
                    letterSpacing: ".08em",
                  }}
                >
                  TOP {i + 1}
                </div>
                <h3 style={{ margin: "0 0 8px 0" }}>
                  {t.name}（スコア：{t.score}）
                </h3>
                <p style={{ margin: 0, color: "#c9d2ff" }}>
                  {JOB_DESCRIPTIONS[t.name]}
                </p>

                <div
                  style={{
                    background: "rgba(124,161,255,.15)",
                    color: "#e9edff",
                    border: "1px solid rgba(124,161,255,.35)",
                    padding: "10px 12px",
                    borderRadius: 10,
                    marginTop: 10,
                    fontSize: 14,
                  }}
                >
                  <b>次の一歩：</b>
                  {t.name === "調剤薬局" &&
                    " 在宅やかかりつけ対応の実例を調べ、対話シナリオを3つ作って練習してみましょう。"}
                  {t.name === "病院薬剤師" &&
                    " チーム医療の症例レポートを読み、TDMや抗菌薬の最新ガイドラインをチェック。"}
                  {t.name === "ドラッグストア" &&
                    " カテゴリ別の売場レイアウトと季節プロモの基本を学び、POPを1枚作ってみる。"}
                  {t.name === "製薬企業MR" &&
                    " 製品プロファイルの要点（効能・安全性・位置づけ）を90秒で話せる台本に。"}
                  {t.name === "研究開発" &&
                    " 統計入門を復習し、試験計画とデータ解析の基本を小さく手を動かして確認。"}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button style={btnStyle} onClick={onRetry}>
              もう一度診断する
            </button>
            <button style={ghostBtn} onClick={onBackLP}>
              LPに戻る
            </button>
          </div>
        </div>
      </Container>
    </motion.div>
  );
}

/** ─────────────────────────────────────────────────
 *  ルート
 *  ───────────────────────────────────────────────── */

function App() {
  const [page, setPage] = useState("lp"); // "lp" | "q" | "result"
  const [answers, setAnswers] = useState([]); // true/false/null の配列
  const [idx, setIdx] = useState(0);

  const start = () => {
    setAnswers([]);
    setIdx(0);
    setPage("q");
  };

  const backToLP = () => {
    setPage("lp");
  };

  const answer = (ans) => {
    const next = [...answers];
    next[idx] = ans;
    setAnswers(next);

    if (idx + 1 < QUESTIONS.length) {
      setIdx(idx + 1);
    } else {
      setPage("result");
    }
  };

  const retry = () => {
    setAnswers([]);
    setIdx(0);
    setPage("q");
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {page === "lp" && <Landing key="lp" onStart={start} />}
        {page === "q" && (
          <QuestionView
            key={`q-${idx}`}
            index={idx}
            total={QUESTIONS.length}
            q={QUESTIONS[idx]}
            onAnswer={answer}
            onBackLP={backToLP}
          />
        )}
        {page === "result" && (
          <ResultView
            key="result"
            answers={answers}
            onRetry={retry}
            onBackLP={backToLP}
          />
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <div style={{ opacity: 0.75 }}>
      <Container>
        <div
          style={{
            marginTop: 36,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,.08)",
            fontSize: 12,
            color: "#a8b2ff",
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <span>© 薬学部キャリア診断</span>
          <span>データは端末内でのみ処理されます</span>
        </div>
      </Container>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
