document.addEventListener("DOMContentLoaded", () => {
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


// Visa bara på fredag
if (new Date().getDay() !== 5) {
quizBox.innerHTML = "<p>Kom tillbaka på fredag för veckans 5 frågor! 📅</p>";
} else {
hamtaVeckansFragor();
}
});
</script>
</body>
</html>
