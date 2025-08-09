// LP ⇄ 診断 の切り替え
document.addEventListener('DOMContentLoaded', () => {
  const lp = document.getElementById('lp');
  const diagnosis = document.getElementById('diagnosis');
  const app = document.getElementById('app');
  const cta = document.getElementById('cta-start');
  const back = document.getElementById('back-to-lp');

  cta.addEventListener('click', () => {
    lp.hidden = true;
    diagnosis.hidden = false;
    startDiagnosis(app);       // 診断を開始
  });

  back.addEventListener('click', () => {
    diagnosis.hidden = true;
    lp.hidden = false;
  });
});

// ====== ここから診断ロジック ======
function startDiagnosis(app) {
  // 質問1の例（ボタンで選択→次へ）
  app.innerHTML = `
    <h2>質問1: あなたの得意な業務は？</h2>
    <p>（例：調剤、接客など）</p>
    <div class="choices">
      <button class="answer-btn" data-score="pharmacy">調剤</button>
      <button class="answer-btn" data-score="hospital">病院業務</button>
      <button class="answer-btn" data-score="drugstore">販売</button>
      <button class="answer-btn" data-score="homecare">在宅</button>
    </div>
    <button id="next-btn" disabled>次へ</button>
  `;

  const answerButtons = app.querySelectorAll('.answer-btn');
  const nextBtn = app.querySelector('#next-btn');
  let selected = null;

  answerButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      selected = btn.dataset.score;
      answerButtons.forEach(b => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      nextBtn.disabled = false;
    });
  });

  nextBtn.addEventListener('click', () => {
    if (!selected) return;
    showQuestion2(app);   // 2問目へ（続きは自由に作れます）
  });
}

function showQuestion2(app) {
  app.innerHTML = `
    <h2>質問2: チームで働くのが好きですか？</h2>
    <div class="choices">
      <button class="answer-btn">はい</button>
      <button class="answer-btn">いいえ</button>
    </div>
    <button id="next-btn">次へ</button>
  `;
  // …以降は同様に質問をつなげればOK
}
