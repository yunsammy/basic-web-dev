function loadTexture(path, scale = 1) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
      resolve(img);
    };
  });
}

function createEnemies(ctx, canvas, enemyImg) {
  const MONSTER_TOTAL = 5;
  const MONSTER_WIDTH = MONSTER_TOTAL * enemyImg.width;
  const START_X = (canvas.width - MONSTER_WIDTH) / 2;
  const STOP_X = START_X + MONSTER_WIDTH;
  for (let x = START_X; x < STOP_X; x += enemyImg.width) {
    for (let y = 0; y < enemyImg.height * 5; y += enemyImg.height) {
      ctx.drawImage(enemyImg, x, y);
    }
  }
}

function createEnemies2(ctx, canvas, enemyImg) {
  const MONSTER_ROWS = 5; // 행 개수

  for (let row = 0; row < MONSTER_ROWS; row++) {
    const monstersInRow = MONSTER_ROWS - row; // 각 행의 몬스터 수
    const MONSTER_WIDTH = monstersInRow * enemyImg.width;
    const START_X = (canvas.width - MONSTER_WIDTH) / 2; // 중앙 정렬
    const Y_POSITION = row * enemyImg.height; // 각 행의 y 위치

    // 각 행에 몬스터 배치
    for (let col = 0; col < monstersInRow; col++) {
      const x = START_X + col * enemyImg.width;
      ctx.drawImage(enemyImg, x, Y_POSITION);
    }
  }
}

window.onload = async () => {
  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");
  const heroImg = await loadTexture("assets/player.png");
  const assistanceHeroImg = await loadTexture("assets/player.png", 0.5);
  const enemyImg = await loadTexture("assets/enemyShip.png");
  const starBackgroundImg = await loadTexture("assets/starBackground.png");
  const starBackgroundPattern = ctx.createPattern(starBackgroundImg, "repeat");
  ctx.fillStyle = starBackgroundPattern;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    heroImg,
    canvas.width / 2 - 45,
    canvas.height - canvas.height / 4
  );
  ctx.drawImage(
    assistanceHeroImg,
    canvas.width / 2 - (45 + 50),
    canvas.height - canvas.height / 4 + 23,
    49,
    37
  );
  ctx.drawImage(
    assistanceHeroImg,
    canvas.width / 2 - (45 - 100),
    canvas.height - canvas.height / 4 + 23,
    49,
    37
  );
  createEnemies2(ctx, canvas, enemyImg);
};
