document.addEventListener("DOMContentLoaded", () => {
  const API1_URL = "https://opentdb.com/api.php?amount=5&category=12&difficulty=easy&type=multiple";
  const API2_URL = "https://opentdb.com/api.php?amount=10&category=11&difficulty=medium&type=multiple";
  const questionBox = document.getElementById("question");
  const optionsBox = document.getElementById("options");
  const result = document.getElementById("result");
  const scoreBox = document.getElementById("score");
  const quizBox = document.querySelector(".quiz-box");

  let veckansFragor = [];
  let aktuellIndex = 0;
  let poang = 0;
  let harSvarat = false;

  function decodeHTML(str) {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  }

  function getWeekNumber(date) {
    const onejan = new Date(date.getFullYear(), 0, 1);
    const millisSince = date - onejan + ((onejan.getTimezoneOffset() - date.getTimezoneOffset()) * 60000);
    const dayNum = Math.floor(millisSince / 86400000) + 1;
    return Math.ceil(dayNum / 7);
  }

  async function fetchRandomQuestion(apiChoice) {
    try {
      if (apiChoice === "API1") {
        const res = await fetch(API1_URL);
        const data = await res.json();
        if (!data.results || data.results.length === 0) return null;
        return normalizeQuestion(data.results[0], "API1");
      } else {
        const res = await fetch(API2_URL);
        const data = await res.json();
        return normalizeQuestion(data, "API2");
      }
    } catch (err) {
      console.error("Fel vid hämtning av fråga:", err);
      return null;
    }
  }

  function normalizeQuestion(apiQuestion, source) {
    if (source === "API1") {
      return {
        question: decodeHTML(apiQuestion.question),
        options: [...apiQuestion.incorrect_answers.map(decodeHTML), decodeHTML(apiQuestion.correct_answer)]
          .sort(() => Math.random() - 0.5),
        answer: decodeHTML(apiQuestion.correct_answer)
      };
    } else if (source === "API2") {
      return {
        question: apiQuestion.text,
        options: apiQuestion.options.sort(() => Math.random() - 0.5),
        answer: apiQuestion.answer
      };
    }
  }

  async function hamtaVeckansFragor() {
    const weekNumber = getWeekNumber(new Date());

    try {
      const lagrade = JSON.parse(localStorage.getItem("fredagsQuiz"));
      if (lagrade && lagrade.week === weekNumber && Array.isArray(lagrade.data) && lagrade.data.length === 5) {
        veckansFragor = lagrade.data;
        aktuellIndex = 0;
        poang = 0;
        visaFraga();
        return;
      }
    } catch (e) {}

    veckansFragor = [];
    while (veckansFragor.length < 5) {
      const apiChoice = veckansFragor.length % 2 === 0 ? "API1" : "API2"; // växla API
      const fraga = await fetchRandomQuestion(apiChoice);
      if (fraga) veckansFragor.push(fraga);
    }

    localStorage.setItem("fredagsQuiz", JSON.stringify({ week: weekNumber, data: veckansFragor }));
    aktuellIndex = 0;
    poang = 0;
    visaFraga();
  }

  function visaFraga() {
    if (aktuellIndex >= veckansFragor.length) return visaSlut();
    harSvarat = false;
    const fraga = veckansFragor[aktuellIndex];

    questionBox.textContent = `Fråga ${aktuellIndex + 1} av 5: ${fraga.question}`;
    optionsBox.innerHTML = "";
    result.textContent = "";
    scoreBox.textContent = `Poäng: ${poang}/${veckansFragor.length}`;

    fraga.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = opt;
      btn.addEventListener("click", () => kontrolleraSvar(btn, opt));
      optionsBox.appendChild(btn);
    });
  }

  function kontrolleraSvar(btn, val) {
    if (harSvarat) return;
    harSvarat = true;

    const fraga = veckansFragor[aktuellIndex];
    const knappar = optionsBox.querySelectorAll("button");
    knappar.forEach(b => b.disabled = true);

    if (val.trim() === fraga.answer.trim()) {
      poang++;
      btn.style.backgroundColor = "#00cc66";
      result.textContent = "✅ Rätt!";
    } else {
      btn.style.backgroundColor = "#cc0033";
      knappar.forEach(b => {
        if (b.textContent.trim() === fraga.answer.trim()) b.style.backgroundColor = "#00cc66";
      });
      result.textContent = `❌ Fel! Rätt svar är: ${fraga.answer}`;
    }

    scoreBox.textContent = `Poäng: ${poang}/${veckansFragor.length}`;

    setTimeout(() => {
      aktuellIndex++;
      visaFraga();
    }, 1000);
  }

  function visaSlut() {
    questionBox.textContent = "🎉 Klart! Du har gjort alla 5 fredagsfrågorna!";
    optionsBox.innerHTML = "";
    result.textContent = `Din slutpoäng: ${poang}/${veckansFragor.length}`;
    if (poang === veckansFragor.length && typeof confetti === "function") startConfetti();
  }

  function startConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;
    (function frame() {
      confetti({ particleCount: 6, spread: 60, origin: { y: 0.6 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  
});
