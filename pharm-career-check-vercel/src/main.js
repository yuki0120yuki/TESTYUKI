<!-- index.html（例）-->
<body>
  <!-- LP（ランディング） -->
  <section id="lp">
    <h1>薬学部キャリア診断</h1>
    <p>20問の質問に答えて、あなたに合った薬剤師の仕事を診断します！</p>
    <button id="cta-start">診断を受けてみる</button>
  </section>

  <!-- 診断ビュー（最初は非表示） -->
  <section id="diagnosis" hidden>
    <div id="app"></div>
    <button id="back-to-lp">LPに戻る</button>
  </section>

  <!-- 既存の診断用スクリプト（Viteでビルドされる想定）-->
  <script type="module" src="/src/main.js"></script>

  <!-- LP↔診断の切り替え制御 -->
  <script>
    const lp = document.getElementById('lp');
    const diagnosis = document.getElementById('diagnosis');
    const startBtn = document.getElementById('cta-start');
    const backBtn = document.getElementById('back-to-lp');

    startBtn.addEventListener('click', () => {
      lp.hidden = true;
      diagnosis.hidden = false;

      // 診断開始イベント（必要なら main.js 側で拾って初期化に使える）
      window.dispatchEvent(new Event('start-diagnosis'));
    });

    backBtn.addEventListener('click', () => {
      diagnosis.hidden = true;
      lp.hidden = false;
    });
  </script>
</body>
