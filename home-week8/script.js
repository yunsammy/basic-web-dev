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

const titleElement = document.getElementById("title");
const infoElement = document.getElementById("info");
const quoteElement = document.getElementById("quote");
const typedValueElement = document.getElementById("typed-value");
const startButtonElement = document.getElementById("start");

const resultDialogElement = document.getElementById("result-dialog");
const maxScoreElement = document.getElementById("max-score");
const resultMessageElement = document.getElementById("result-message");
const restartButtonElement = document.getElementById("restart-button");

function startListener() {
  titleElement.style.display = "none";
  infoElement.style.display = "none";
  typedValueElement.style.display = "block";
  startButtonElement.style.display = "none";

  const quoteIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[quoteIndex];
  words = quote.split(" ");
  wordIndex = 0;
  const spanWords = words.map(function (word) {
    return `<span>${word} </span>`;
  });

  quoteElement.innerHTML = spanWords.join("");
  quoteElement.childNodes[0].className = "highlight";
  typedValueElement.disabled = false;
  typedValueElement.value = "";
  typedValueElement.focus();
  startTime = new Date().getTime();

  // 현재 등록되어 있는 start 버튼 클릭 이벤트 리스너 제거
  startButtonElement.removeEventListener("click", startListener);
  // input 입력 이벤트 리스너 등록
  typedValueElement.addEventListener("input", inputListener);
}

function updateResultDialog(maxScoreMessage, resultMessage) {
  maxScoreElement.textContent = maxScoreMessage;
  resultMessageElement.textContent = resultMessage;

  // 애니메이션 클래스 추가
  maxScoreElement.classList.add("fade-in");
  resultMessageElement.classList.add("fade-in");

  // 애니메이션 종료 후 클래스 제거
  maxScoreElement.addEventListener(
    "animationend",
    () => {
      maxScoreElement.classList.remove("fade-in");
    },
    { once: true }
  );

  resultMessageElement.addEventListener(
    "animationend",
    () => {
      resultMessageElement.classList.remove("fade-in");
    },
    { once: true }
  );
}

function inputListener() {
  const currentWord = words[wordIndex];
  const typedValue = typedValueElement.value;

  if (typedValue === currentWord && wordIndex === words.length - 1) {
    const elapsedTime = new Date().getTime() - startTime;
    const score = elapsedTime / 1000;

    // maxScore(localStorage) check
    let maxScore = localStorage.getItem("maxScore");

    if (maxScore === null) {
      maxScore = 0;
    }

    let maxScoreMessage;
    let resultMessage;

    // 현재 점수와 최고 점수 비교
    if (maxScore == 0 || score < maxScore) {
      maxScoreMessage = `최고 점수: ${score} seconds`;
      resultMessage = `CONGRATULATIONS! You have set a new high score!`;
      localStorage.setItem("maxScore", score); // 최고 점수 갱신
    } else {
      maxScoreMessage = `최고 점수: ${maxScore} seconds`;
      resultMessage = `You finished in ${score} seconds.`;
    }

    quoteElement.childNodes[wordIndex].className = "";
    titleElement.style.display = "inline";
    infoElement.style.display = "inline";
    typedValueElement.style.display = "none";
    startButtonElement.style.display = "inline";
    quoteElement.innerText = "";
    typedValueElement.value = "";
    typedValueElement.disabled = true;
    resultDialogElement.showModal();
    updateResultDialog(maxScoreMessage, resultMessage);

    // input 입력 이벤트 리스너 제거
    typedValueElement.removeEventListener("input", inputListener);
    // start 버튼 click 이벤트 리스너 등록
    startButtonElement.addEventListener("click", startListener);
  } else if (typedValue.endsWith(" ") && typedValue.trim() === currentWord) {
    typedValueElement.value = "";
    quoteElement.childNodes[wordIndex].classList.add("correct");
    wordIndex++;
    for (const wordElement of quoteElement.childNodes) {
      wordElement.className = "";
    }

    quoteElement.childNodes[wordIndex].className = "highlight";
  } else if (currentWord.startsWith(typedValue)) {
    typedValueElement.className = "";
  } else {
    typedValueElement.classList.add("error");
    typedValueElement.classList.add("shake");
    typedValueElement.addEventListener(
      "animationend",
      () => {
        typedValueElement.classList.remove("shake");
      },
      { once: true }
    );
  }
}

function closeModal() {
  resultDialogElement.close();
}

startButtonElement.addEventListener("click", startListener);
restartButtonElement.addEventListener("click", closeModal);
