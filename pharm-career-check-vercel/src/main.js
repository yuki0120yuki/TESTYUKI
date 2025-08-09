const questions = [
  "友達といるとき、話をリードすることが多いですか？",
  "困っている人を見ると、自然に声をかけますか？",
  "細かい作業や記録を丁寧に行うのは得意ですか？"
];
let current = 0;
const app = document.querySelector('#app');

function showQuestion() {
  if (current < questions.length) {
    app.innerHTML = `
      <div class="question">
        <h2>Q${current + 1}. ${questions[current]}</h2>
        <button onclick="next()">はい</button>
        <button onclick="next()">いいえ</button>
      </div>
    `;
  } else {
    app.innerHTML = `
      <h1>診断結果</h1>
      <p>薬局薬剤師 70%</p>
      <p>病院薬剤師 50%</p>
    `;
  }
}

window.next = function() {
  current++;
  showQuestion();
};

showQuestion();
