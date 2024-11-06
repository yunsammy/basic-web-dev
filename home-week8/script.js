const quotes = [
  "When you have eliminated the impossible, whatever remains, however improbable, must be the truth.",
  "There is nothing more deceptive than an obvious fact.",
  "I thought to know by this time that when a fact appears to be opposed to a long train of deductions it invariably proves to be capable of bearing some other interpretation.",
  "I never make exceptions. An exception disproves the rule.",
  "What one man can invent another can discover.",
  "Nothing clears up a case so much as stating it to another person.",
  "Education never ends, Watson. It is a series of lessons, with the greatest for the last.",
];

let words = [];
let wordIndex = 0;
let startTime = Date.now();
let isGaming = false;

const quoteElement = document.getElementById("quote");
const messageElement = document.getElementById("message");
const typedValueElement = document.getElementById("typed-value");
const startButtonElement = document.getElementById("start");

startEventListener = startButtonElement.addEventListener(
  "click",
  startListener
);

startEventListener.removeEventListener();

function startListener() {
  // 현재 등록되어 있는 start 버튼 클릭 이벤트 리스너 제거
  startButtonElement.removeEventListener("click", startListener);
  // input 입력 이벤트 리스너 등록
  typedValueElement.addEventListener("input", inputListener);
  const quoteIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[quoteIndex];
  words = quote.split(" ");
  wordIndex = 0;
  const spanWords = words.map(function (word) {
    return `<span>${word} </span>`;
  });
  quoteElement.innerHTML = spanWords.join("");
  quoteElement.childNodes[0].className = "highlight";
  messageElement.innerText = "";
  typedValueElement.disabled = false;
  typedValueElement.value = "";
  typedValueElement.focus();
  startTime = new Date().getTime();
}

function inputListener() {
  const currentWord = words[wordIndex];
  const typedValue = typedValueElement.value;
  if (typedValue === currentWord && wordIndex === words.length - 1) {
    const elapsedTime = new Date().getTime() - startTime;
    const message = `CONGRATULATIONS! You finished in ${
      elapsedTime / 1000
    } seconds.`;
    typedValueElement.value = "";
    typedValueElement.disabled = true;
    messageElement.innerText = message;
    // input 입력 이벤트 리스너 제거
    typedValueElement.removeEventListener("input", inputListener);
    // start 버튼 click 이벤트 리스너 등록
    startButtonElement.addEventListener("click", startListener);
  } else if (typedValue.endsWith(" ") && typedValue.trim() === currentWord) {
    typedValueElement.value = "";
    wordIndex++;
    for (const wordElement of quoteElement.childNodes) {
      wordElement.className = "";
    }
    quoteElement.childNodes[wordIndex].className = "highlight";
  } else if (currentWord.startsWith(typedValue)) {
    typedValueElement.className = "";
  } else {
    typedValueElement.className = "error";
  }
}
