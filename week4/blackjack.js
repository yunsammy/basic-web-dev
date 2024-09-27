let cardOne = getRandomCardNum();
let cardTwo = getRandomCardNum();
let sum = cardOne + cardTwo;
let cardOneBank = getRandomCardNum();
let cardTwoBank = getRandomCardNum();

function getRandomCardNum() {
  return Math.floor(Math.random() * 10 + 1);
}

// 딜러는 17점 이상일 때 멈춰야 하고, 그 이하일 때는 추가 카드를 뽑아야 함
let bankSum = cardOneBank + cardTwoBank;
while (bankSum < 17) {
  bankSum += getRandomCardNum();
}

// 플레이어 추가 카드(Hit)는 뽑지 않는 것으로 구현 (항상 2장으로 승부)
// let cardThree = getRandomCardNum();
// sum += cardThree;

function blackjack(playerSum, bankSum) {
  let isPlayerWin;
  let isDraw;
  // 플레이어가 21점 달성하면 블랙잭(즉시 승리)
  if (playerSum == 21) {
    isPlayerWin = true;
  }
  // 플레이어가 21점 초과 -> 패배
  else if (playerSum > 21) {
    isPlayerWin = false;
  }
  // 플레이어가 21점 초과하지 않고 딜러가 21점 초과 -> 승리
  else if (bankSum > 21) {
    isPlayerWin = true;
  }
  // 플레이어, 딜러 모두 21점 초과하지 않은 경우
  // 플레이어가 딜러보다 카드 합계 높은 경우 -> 승리
  else if (sum > bankSum) {
    isPlayerWin = true;
  }
  // 플레이어보다 딜러가 카드 합계 높은 경우 -> 패배
  else if (sum < bankSum) {
    isPlayerWin = false;
  }
  // 플레이어와 딜러의 카드 합계 같은 경우 -> 무승부
  else if (playerSum === bankSum) {
    isDraw = true;
  }

  if (isPlayerWin) {
    console.log("You win");
  } else if (isDraw) {
    console.log("Draw");
  } else {
    console.log("You lost");
  }

  console.log(`your card number sum is ${sum}`);
  console.log(`dealer's card number sum is ${bankSum}`);
}

blackjack(sum, bankSum);
