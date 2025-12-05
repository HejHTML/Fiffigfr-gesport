// === Fredagsfrågesport med Open Trivia DB ===
// Hämtar fem nya frågor varje fredag

const API_URL = "https://opentdb.com/api.php?amount=12&category=11&difficulty=easy&type=multiple";
let veckansFragor = [];
let aktuellIndex = 0;
let harSvarat = false;
let poang = 0;

// === Element ===
const questionBox = document.getElementById("question");
const optionsBox = document.getElementById("options");
const result = document.getElementById("result");
const scoreBox = document.getElementById("score");

// === Hjälpfunktion för att hämta vecka ===
function getWeekNumber(date) {
  const onejan = new Date(date.getFullYear(), 0, 1);
  const millisSince = date - onejan + ((onejan.getTimezoneOffset() - date.getTimezoneOffset()) * 60000);
  const dayNum = Math.floor(millisSince / 86400000) + 1;
  return Math.ceil(dayNum / 7);
}

// === Hämta veckans 5 frågor ===
async function hamtaVeckansFragor() {
  const today = new Date();
  const weekNumber = getWeekNumber(today);

  const lagrade = JSON.parse(localStorage.getItem("fredagsQuiz"));
  if (lagrade && lagrade.week === weekNumber) {
    veckansFragor = lagrade.data;
    visaFraga();
    return;
  }

  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      questionBox.textContent = "Kunde inte hämta frågor just nu.";
      return;
    }

    const slumpade = data.results
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .map(fraga => {
        const blandade = [...fraga.incorrect_answers, fraga.correct_answer]
          .sort(() => Math.random() - 0.5);

        return {
          question: decodeHTML(fraga.question),
          options: blandade.map(decodeHTML),
          answer: decodeHTML(fraga.correct_answer)
        };
      });

    veckansFragor = slumpade;

    localStorage.setItem("fredagsQuiz", JSON.stringify({ week: weekNumber, data: veckansFragor }));

    visaFraga();
  } catch (err) {
    console.error("Fel:", err);
    questionBox.textContent = "Fel vid hämtning av frågorna.";
  }
}

// === Dekodera HTML-entiteter ===
function decodeHTML(str) {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

// === Visa fråga ===
function visaFraga() {
  if (!veckansFragor.length) return;

  const fraga = veckansFragor[aktuellIndex];

  questionBox.textContent = `Fråga ${aktuellIndex + 1} av 5: ${fraga.question}`;
  optionsBox.innerHTML = "";
  result.textContent = "";
  harSvarat = false;

  scoreBox.textContent = `Poäng: ${poang}/5`;

  fraga.options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.className = "option-btn";
  btn.addEventListener("click", () => kontrolleraSvar(btn, btn.textContent));

    optionsBox.appendChild(btn);
  });
}

// === Kontrollera svar ===
function kontrolleraSvar(btn, val) {
  if (harSvarat) return;
  harSvarat = true;

  const fraga = veckansFragor[aktuellIndex];
  const knappar = document.querySelectorAll(".option-btn");
  knappar.forEach(k => k.disabled = true);

  if (val === fraga.answer) {
    poang++;
    btn.style.backgroundColor = "#00cc66";
    result.textContent = `✅ Rätt!`;
    result.style.color = "#00ff88";
  } else {
    btn.style.backgroundColor = "#cc0033";
    result.textContent = `❌ Fel! Rätt svar är ${fraga.answer}.`;
    result.style.color = "#ff4444";
  }

  scoreBox.textContent = `Poäng: ${poang}/5`;

  setTimeout(() => {
    aktuellIndex++;
    if (aktuellIndex < 5) {
      visaFraga();
    } else {
      questionBox.textContent = "🎉 Klart! Du har gjort alla 5 fredagsfrågorna!";
      optionsBox.innerHTML = "";
      if (poang === 5) startConfetti();
    }
  }, 1500);
}

// === Confetti ===
function startConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({ particleCount: 5, spread: 60 });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

// === Visa endast fredag ===
const idag = new Date().getDay();
if (idag !== 5) {
  document.querySelector(".quiz-box").innerHTML = "<p>Kom tillbaka på fredag för veckans 5 frågor! 📅</p>";
} else {
  hamtaVeckansFragor();
}
