// === Fredagsfrågesport med Open Trivia DB ===
// Hämtar en ny fråga varje fredag

const API_URL = "https://opentdb.com/api.php?amount=3&category=11&type=multiple";
let dagensFraga = null;
let harSvarat = false;

// === Element ===
const questionBox = document.getElementById("question");
const optionsBox = document.getElementById("options");
const result = document.getElementById("result");

// === Hjälpfunktion för att hämta vecka ===
function getWeekNumber(date) {
  const onejan = new Date(date.getFullYear(), 0, 1);
  const millisSince = date - onejan + ((onejan.getTimezoneOffset() - date.getTimezoneOffset()) * 60000);
  const dayNum = Math.floor(millisSince / 86400000) + 1;
  return Math.ceil(dayNum / 7);
}

// === Hämta veckans fråga (samma varje vecka) ===
async function hamtaVeckansFraga() {
  const today = new Date();
  const weekNumber = getWeekNumber(today);

  // Spara en fråga i localStorage för att hålla samma fråga hela veckan
  const lagrad = JSON.parse(localStorage.getItem("veckansFraga"));
  if (lagrad && lagrad.week === weekNumber) {
    dagensFraga = lagrad.data;
    visaFraga();
    return;
  }

  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const randomIndex = weekNumber % data.results.length;
      const fraga = data.results[randomIndex];
      
      // Blanda svarsalternativen
      const alternativ = [...fraga.incorrect_answers, fraga.correct_answer]
        .sort(() => Math.random() - 0.5);
      
      dagensFraga = {
        question: decodeHTML(fraga.question),
        options: alternativ.map(decodeHTML),
        answer: decodeHTML(fraga.correct_answer)
      };

      // Spara så att det är samma fråga hela veckan
      localStorage.setItem("veckansFraga", JSON.stringify({
        week: weekNumber,
        data: dagensFraga
      }));

      visaFraga();
    } else {
      questionBox.textContent = "Kunde inte hämta någon fråga just nu.";
    }
  } catch (err) {
    console.error("Fel vid hämtning av fråga:", err);
    questionBox.textContent = "Ett fel uppstod vid hämtning av frågan.";
  }
}

// === Dekodera HTML-entiteter från API:et ===
function decodeHTML(str) {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

// === Visa frågan ===
function visaFraga() {
  if (!dagensFraga) return;
  questionBox.textContent = dagensFraga.question;
  optionsBox.innerHTML = "";
  result.textContent = "";
  harSvarat = false;

  dagensFraga.options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.className = "option-btn";
    btn.addEventListener("click", () => kontrolleraSvar(option));
    optionsBox.appendChild(btn);
  });
}

// === Kontrollera svar ===
function kontrolleraSvar(val) {
  if (harSvarat) return;
  harSvarat = true;

  if (val === dagensFraga.answer) {
    result.textContent = `✅ Rätt! Svaret är ${dagensFraga.answer}.`;
    result.style.color = "#00ff88";
  } else {
    result.textContent = `❌ Fel! Rätt svar är ${dagensFraga.answer}.`;
    result.style.color = "#ff4444";
  }
}

// === Visa endast på fredagar ===
const idag = new Date().getDay(); // 5 = fredag
if (idag !== 5) {
  document.querySelector(".quiz-box").innerHTML =
    "<p>Kom tillbaka på fredag för veckans fråga! 📅</p>";
} else {
  hamtaVeckansFraga();
}
