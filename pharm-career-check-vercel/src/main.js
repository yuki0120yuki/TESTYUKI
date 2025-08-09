// main.js

document.addEventListener("DOMContentLoaded", () => {
  const app = document.querySelector('#root');

  if (!app) {
    console.error("ルート要素 #root が見つかりません");
    return;
  }

  // 最初の画面を表示
  app.innerHTML = `
    <h1>薬学部キャリア診断</h1>
    <p>20問の質問に答えて、あなたに合った薬剤師の仕事を診断します！</p>
    <button id="start-btn">診断を始める</button>
  `;

  // ここでボタンを取得してイベント登録
  const startBtn = document.querySelector('#start-btn');
  startBtn.addEventListener('click', () => {
    app.innerHTML = `<p>質問1: あなたの得意な業務は？（例：調剤、接客など）</p>`;
  });
});
