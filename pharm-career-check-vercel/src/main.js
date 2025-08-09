// src/main.js
document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector('#app');
  if (!app) {
    console.error('ルート要素 #app が見つかりません');
    return;
  }

  // LPから「診断開始」された時に初期化したい場合
  window.addEventListener('start-diagnosis', () => {
    startDiagnosis(app);
  });

  // 直接URLを開いた場合の初期化（任意）
  // startDiagnosis(app);
});

function startDiagnosis(app) {
  // ここから診断の中身。例：最初の画面
  app.innerHTML = `
    <h1>薬学部キャリア診断</h1>
    <p>20問の質問に答えて、あなたに合った薬剤師の仕事を診断します！</p>
    <button id="start-btn">診断を始める</button>
  `;

  const startBtn = app.querySelector('#start-btn');
  startBtn.addEventListener('click', () => {
    // 1問目などに差し替え
    app.innerHTML = `<p>質問1: あなたの得意な業務は？（例：調剤、接客など）</p>`;
  });
}
