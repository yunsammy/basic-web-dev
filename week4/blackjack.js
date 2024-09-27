let cardOne = getRandomCardNum();
let cardTwo = getRandomCardNum();
let sum = cardOne + cardTwo;
let cardOneBank = getRandomCardNum();
let cardTwoBank = getRandomCardNum();

function getRandomCardNum() {
  return Math.floor(Math.random() * 10);
}

// 딜러는 17점 이상일 때 멈춰야 하고, 그 이하일 때는 추가 카드를 뽑아야 함
let bankSum = cardOneBank + cardTwoBank;
while (bankSum < 17) {
  bankSum += getRandomCardNum();
}

// 플레이어가 21점 달성하면 블랙잭(즉시 승리)
if (sum === 21) {
  console.log("You win");
  process.exit();
}

let cardThree = getRandomCardNum();
sum += cardThree;

function blackjack(playerSum, bankSum) {
  let isPlayerWin;
  // 플레이어가 21점 달성하면 블랙잭(즉시 승리)
  if (playerSum == 21) {
    isPlayerWin = true;
  }

  // 플레이어가 21점 초과 -> 패배
  if (playerSum > 21) {
    isPlayerWin = false;
  }

  // 딜러가 21점 초과 -> 승리
  if (bankSum > 21) {
    isPlayerWin = true;
  }

  // 플레이어와 딜러의 카드 합계가 21을 넘으면 Bust(패배)
  if (playerSum + bankSum > 21) {
    isPlayerWin = false;
  }

  if (playerSum === bankSum) {
    console.log("Draw");
    return;
  }

  // 플레이어 패의 숫자가 딜러 크기보다 큰 경우
  if (playerSum > bankSum) {
    isPlayerWin = true;
  }

  if (isPlayerWin) {
    console.log("You win");
  } else {
    console.log("You lost");
  }

  console.log(`your card number sum is ${sum}`);
  console.log(`dealer's card number sum is ${bankSum}`);
}

blackjack(sum, bankSum);