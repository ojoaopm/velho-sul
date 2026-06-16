const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 650;
const LANE_Y = [276, 414, 552];
const PARTICIPANTS = ["João Paulo Vieira"];

let game;
let pinhaoImage;
let chimarraoImage;

function preload() {
  pinhaoImage = loadImage("assets/image/pinhao.svg");
  chimarraoImage = loadImage("assets/image/chimarrao.svg");
}

function setup() {
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  canvas.parent("game-container");
  pixelDensity(1);
  frameRate(60);
  textFont("Libre Franklin");
  game = new Game();
}

function draw() {
  const deltaSeconds = min(deltaTime / 1000, 0.05);
  game.update(deltaSeconds);
  game.draw();
}

function keyPressed() {
  return game.handleKey(keyCode, key);
}

function mousePressed() {
  game.handlePointer(mouseX, mouseY);
  return false;
}

function touchStarted() {
  game.handlePointer(mouseX, mouseY);
  return false;
}

class Game {
  constructor() {
    this.state = "menu";
    this.sound = new SoundManager();
    this.player = new Player(170, LANE_Y);
    this.obstacles = [];
    this.collectibles = [];
    this.particles = [];
    this.buttons = [];
    this.actionButtons = [];
    this.menuSelection = 0;
    this.elapsed = 0;
    this.score = 0;
    this.highScore = Number(localStorage.getItem("velhoSulHighScore") || 0);
    this.lives = 3;
    this.pinhaoCount = 0;
    this.speed = 280;
    this.spawnTimer = 1.3;
    this.collectibleTimer = 1.7;
    this.powerTimer = 13;
    this.worldOffset = 0;
    this.phaseIndex = 0;
    this.phaseBannerTimer = 0;
    this.message = "";
    this.nightAmount = 0;
    this.lastTouchAt = 0;
    this.palette = {
      cream: color(239, 217, 164),
      paper: color(214, 184, 123),
      ink: color(34, 23, 16),
      red: color(141, 47, 36),
      green: color(35, 75, 53),
      gold: color(200, 150, 62),
      sunsetTop: color(222, 120, 63),
      sunsetBottom: color(245, 190, 104),
      nightTop: color(12, 25, 39),
      nightBottom: color(35, 53, 65)
    };
    this.phases = [
      { at: 0, name: "Fase I", subtitle: "Saída da Vila" },
      { at: 25, name: "Fase II", subtitle: "Estrada das Araucárias" },
      { at: 50, name: "Fase III", subtitle: "O Cerco dos Jagunços" },
      { at: 75, name: "Fase IV", subtitle: "Noite Sem Fim" }
    ];
  }

  resetGame() {
    this.elapsed = 0;
    this.score = 0;
    this.lives = 3;
    this.pinhaoCount = 0;
    this.speed = 280;
    this.spawnTimer = 1.2;
    this.collectibleTimer = 1.3;
    this.powerTimer = random(11, 15);
    this.worldOffset = 0;
    this.phaseIndex = 0;
    this.phaseBannerTimer = 2.2;
    this.message = "Saída da Vila";
    this.nightAmount = 0;
    this.obstacles = [];
    this.collectibles = [];
    this.particles = [];
    this.player.reset();
  }

  startGame() {
    this.sound.unlock();
    this.sound.playEffect("phase");
    this.resetGame();
    this.state = "playing";
  }

  update(deltaSeconds) {
    const intensity = constrain(map(this.elapsed, 0, 120, 0, 1), 0, 1);
    this.sound.update(deltaSeconds, intensity, this.state === "playing");

    if (this.state !== "playing") {
      this.updateParticles(deltaSeconds);
      return;
    }

    this.elapsed += deltaSeconds;
    this.speed = map(constrain(this.elapsed, 0, 120), 0, 120, 280, 820);
    this.score = floor(this.elapsed * 10 + this.pinhaoCount * 75);
    this.worldOffset += this.speed * deltaSeconds;
    this.nightAmount = constrain(map(this.elapsed, 45, 60, 0, 1), 0, 1);
    this.phaseBannerTimer = max(0, this.phaseBannerTimer - deltaSeconds);
    this.player.update(deltaSeconds, this.speed);
    this.updateProgression();
    this.updateSpawning(deltaSeconds);

    this.obstacles.forEach((obstacle) => obstacle.update(deltaSeconds, this.speed));
    this.collectibles.forEach((collectible) => collectible.update(deltaSeconds, this.speed));
    this.updateParticles(deltaSeconds);
    this.resolveCollisions();

    this.obstacles = this.obstacles.filter((obstacle) => !obstacle.remove);
    this.collectibles = this.collectibles.filter((collectible) => !collectible.remove);
  }

  updateProgression() {
    let nextPhase = this.phaseIndex;
    for (let index = 0; index < this.phases.length; index += 1) {
      if (this.elapsed >= this.phases[index].at) nextPhase = index;
    }

    if (nextPhase !== this.phaseIndex) {
      this.phaseIndex = nextPhase;
      this.phaseBannerTimer = 2.5;
      this.message = this.phases[this.phaseIndex].subtitle;
      this.sound.playEffect("phase");
    }
  }

  updateSpawning(deltaSeconds) {
    this.spawnTimer -= deltaSeconds;
    this.collectibleTimer -= deltaSeconds;
    this.powerTimer -= deltaSeconds;

    if (this.spawnTimer <= 0) {
      const spawned = this.spawnObstacle();
      if (spawned) {
        const minimum = map(this.speed, 280, 820, 1.05, 0.52, true);
        const maximum = map(this.speed, 280, 820, 1.65, 0.82, true);
        this.spawnTimer = random(minimum, maximum);
      } else {
        this.spawnTimer = 0.22;
      }
    }

    if (this.collectibleTimer <= 0) {
      const spawned = this.spawnPinhaoTrail();
      this.collectibleTimer = spawned ? random(2.2, 3.8) : 0.28;
    }

    if (this.powerTimer <= 0) {
      const spawned = this.spawnPowerUp();
      this.powerTimer = spawned ? random(14, 20) : 0.35;
    }
  }

  spawnObstacle() {
    const roll = random();
    let type = "jagunco";
    if (this.elapsed > 18 && roll < 0.24) type = "tabua";
    else if (this.elapsed > 8 && roll < 0.52) type = "barril";

    const possibleLanes = type === "tabua" ? [0, 1] : [0, 1, 2];
    const shuffledLanes = possibleLanes.sort(() => random(-1, 1));
    const startX = width + 100;
    const lane = shuffledLanes.find((candidate) => {
      const blockedLanes = type === "tabua" ? [candidate, candidate + 1] : [candidate];
      const obstacle = new Obstacle(type, candidate, LANE_Y, startX, this.speed);

      return (
        this.isSpawnAreaClear(blockedLanes, startX, 380, this.collectibles) &&
        this.isObstaclePathSafe(obstacle)
      );
    });

    if (lane === undefined) return false;

    this.obstacles.push(
      new Obstacle(type, lane, LANE_Y, startX, this.speed)
    );
    return true;
  }

  isObstaclePathSafe(candidate) {
    const activeObstacles = this.obstacles.filter(
      (obstacle) => !obstacle.remove && !obstacle.collisionHandled
    );

    if (activeObstacles.length === 0) return true;

    const playerX = this.player.position.x;
    const secondsToPlayer =
      (candidate.position.x - playerX) /
      max(1, this.speed * candidate.speedMultiplier);
    const simulationStep = 0.12;

    for (let time = 0; time <= secondsToPlayer; time += simulationStep) {
      const candidateX =
        candidate.position.x -
        this.speed * candidate.speedMultiplier * time;
      const blockedLanes = new Set(this.getObstacleLanes(candidate));

      for (const obstacle of activeObstacles) {
        const obstacleX =
          obstacle.position.x -
          this.speed * obstacle.speedMultiplier * time;
        const requiredGap =
          (candidate.width + obstacle.width) / 2 + 105;

        if (abs(candidateX - obstacleX) < requiredGap) {
          this.getObstacleLanes(obstacle).forEach((lane) =>
            blockedLanes.add(lane)
          );
        }
      }

      if (blockedLanes.size === LANE_Y.length) return false;
    }

    return true;
  }

  getObstacleLanes(obstacle) {
    return obstacle.lanesBlocked === 2
      ? [obstacle.lane, obstacle.lane + 1]
      : [obstacle.lane];
  }

  spawnPinhaoTrail() {
    const startX = width + 80;
    const amount = floor(random(3, 6));
    const endX = startX + (amount - 1) * 70;
    const possibleLanes = [0, 1, 2].sort(() => random(-1, 1));
    const lane = possibleLanes.find((candidate) =>
      this.isSpawnAreaClear([candidate], (startX + endX) / 2, endX - startX + 300, this.obstacles)
    );

    if (lane === undefined) return false;

    for (let index = 0; index < amount; index += 1) {
      this.collectibles.push(
        new Collectible(
          "pinhao",
          lane,
          LANE_Y,
          startX + index * 70,
          pinhaoImage
        )
      );
    }
    return true;
  }

  spawnPowerUp() {
    const startX = width + 90;
    const possibleLanes = [0, 1, 2].sort(() => random(-1, 1));
    const lane = possibleLanes.find((candidate) =>
      this.isSpawnAreaClear([candidate], startX, 320, this.obstacles)
    );

    if (lane === undefined) return false;

    this.collectibles.push(
      new Collectible("chimarrao", lane, LANE_Y, startX, chimarraoImage)
    );
    return true;
  }

  isSpawnAreaClear(lanes, centerX, minimumGap, entities) {
    return entities.every((entity) => {
      if (entity.remove) return true;

      const entityLanes =
        entity instanceof Obstacle
          ? this.getObstacleLanes(entity)
          : [entity.lane];
      const sharesLane = lanes.some((lane) => entityLanes.includes(lane));

      return !sharesLane || abs(entity.position.x - centerX) >= minimumGap;
    });
  }

  resolveCollisions() {
    const playerBounds = this.player.getBounds();

    for (const collectible of this.collectibles) {
      if (!collectible.remove && rectanglesOverlap(playerBounds, collectible.getBounds())) {
        collectible.remove = true;
        if (collectible.type === "chimarrao") {
          this.player.activateLuckyHat();
          this.sound.playEffect("power");
          this.message = "Chimarrão da Sorte: 3 segundos!";
          this.phaseBannerTimer = 1.7;
          this.createBurst(collectible.position.x, collectible.position.y, true);
        } else {
          this.pinhaoCount += 1;
          this.sound.playEffect("collect");
          this.createBurst(collectible.position.x, collectible.position.y, false);
        }
      }
    }

    if (this.player.invincibleTimer > 0) return;

    for (const obstacle of this.obstacles) {
      if (
        !obstacle.remove &&
        !obstacle.collisionHandled &&
        rectanglesOverlap(playerBounds, obstacle.getBounds())
      ) {
        obstacle.hit();
        this.lives -= 1;
        this.player.invincibleTimer = 1.8;
        this.sound.playEffect(obstacle.type === "jagunco" ? "jaguncoHit" : "hit");
        this.createImpact(obstacle.position.x, obstacle.position.y - 42);

        if (this.lives <= 0) {
          this.endGame();
        }
        break;
      }
    }
  }

  endGame() {
    this.highScore = max(this.highScore, this.score);
    localStorage.setItem("velhoSulHighScore", String(this.highScore));
    this.state = "gameover";
  }

  createBurst(x, y, large) {
    const palette = [
      this.palette.gold,
      this.palette.red,
      this.palette.green,
      this.palette.cream
    ];
    const amount = large ? 8 : 5;
    for (let index = 0; index < amount; index += 1) {
      this.particles.push(new Particle(x, y, palette, large));
    }
  }

  createImpact(x, y) {
    const palette = [color(255, 210, 93), color(164, 57, 37), color(56, 35, 21)];
    for (let index = 0; index < 6; index += 1) {
      this.particles.push(new Particle(x, y, palette, true));
    }
  }

  updateParticles(deltaSeconds) {
    this.particles.forEach((particle) => particle.update(deltaSeconds));
    this.particles = this.particles.filter((particle) => particle.life > 0);
  }

  draw() {
    this.actionButtons = [];

    if (this.state === "menu") this.drawMenu();
    else if (this.state === "about") this.drawAbout();
    else if (this.state === "help") this.drawHelp();
    else {
      this.drawWorld();
      if (this.state === "paused") this.drawPause();
      if (this.state === "gameover") this.drawGameOver();
    }
  }

  drawWorld() {
    this.drawSky();
    this.drawDistantLandscape();
    this.drawRoads();

    this.collectibles.forEach((collectible) => collectible.draw());
    this.obstacles.forEach((obstacle) => obstacle.draw());
    this.player.draw();
    this.particles.forEach((particle) => particle.draw());

    if (this.nightAmount > 0.05) this.drawNightOverlay();
    this.drawHud();
    this.drawPhaseBanner();
  }

  drawSky() {
    const topColor = lerpColor(
      this.palette.sunsetTop,
      this.palette.nightTop,
      this.nightAmount
    );
    const bottomColor = lerpColor(
      this.palette.sunsetBottom,
      this.palette.nightBottom,
      this.nightAmount
    );

    noStroke();
    for (let y = 0; y <= 205; y += 4) {
      fill(lerpColor(topColor, bottomColor, y / 205));
      rect(0, y, width, 5);
    }

    const celestialX = 785;
    const celestialY = 83;
    fill(246, 205, 105, 255 * (1 - this.nightAmount));
    circle(celestialX, celestialY, 72);
    fill(225, 229, 216, 255 * this.nightAmount);
    circle(celestialX, celestialY, 58);
    fill(red(topColor), green(topColor), blue(topColor), 255 * this.nightAmount);
    circle(celestialX + 18, celestialY - 10, 49);

    if (this.nightAmount > 0.2) {
      fill(245, 230, 178, 180 * this.nightAmount);
      for (let index = 0; index < 30; index += 1) {
        const x = (index * 83 + 37) % width;
        const y = 22 + ((index * 47) % 145);
        circle(x, y, index % 5 === 0 ? 3 : 2);
      }
    }
  }

  drawDistantLandscape() {
    noStroke();
    fill(86, 78, 56);
    beginShape();
    vertex(0, 206);
    for (let x = 0; x <= width; x += 40) {
      vertex(x, 165 + noise(x * 0.006) * 48);
    }
    vertex(width, 230);
    vertex(0, 230);
    endShape(CLOSE);

    const farOffset = (this.worldOffset * 0.09) % 190;
    for (let index = -1; index < 8; index += 1) {
      const x = index * 190 - farOffset;
      this.drawAraucaria(x, 220, 0.78, color(31, 61, 43));
    }

    const houseOffset = (this.worldOffset * 0.16) % 280;
    for (let index = -1; index < 6; index += 1) {
      const x = index * 280 - houseOffset + 50;
      this.drawColonialHouse(x, 220, 0.75, index % 2 === 0);
    }
  }

  drawRoads() {
    noStroke();
    fill(57, 42, 31);
    rect(0, 215, width, height - 215);

    for (let lane = 0; lane < LANE_Y.length; lane += 1) {
      const y = LANE_Y[lane];
      fill(lane % 2 === 0 ? 99 : 91, lane % 2 === 0 ? 75 : 68, 52);
      rect(0, y - 57, width, 114);

      stroke(203, 174, 112, 90);
      strokeWeight(2);
      line(0, y - 57, width, y - 57);
      line(0, y + 57, width, y + 57);

      noStroke();
      fill(224, 198, 139, 115);
      const dashOffset = this.worldOffset % 95;
      for (let x = -95; x < width + 95; x += 95) {
        rect(x - dashOffset, y + 48, 44, 3);
      }

    }
  }

  drawAraucaria(x, groundY, scaleValue, treeColor) {
    push();
    translate(x, groundY);
    scale(scaleValue);
    noStroke();
    fill(75, 47, 27);
    rect(-7, -94, 14, 96);
    fill(treeColor);
    triangle(-46, -85, 0, -137, 46, -85);
    ellipse(0, -118, 83, 32);
    ellipse(-25, -102, 56, 22);
    ellipse(27, -101, 57, 23);
    pop();
  }

  drawColonialHouse(x, groundY, scaleValue, alternate) {
    push();
    translate(x, groundY);
    scale(scaleValue);
    noStroke();
    fill(alternate ? 206 : 223, alternate ? 169 : 190, 115);
    rect(-60, -72, 120, 72);
    fill(112, 47, 34);
    triangle(-72, -70, 0, -112, 72, -70);
    fill(49, 73, 63);
    rect(-42, -50, 24, 32);
    rect(18, -50, 24, 32);
    fill(89, 48, 28);
    rect(-11, -42, 22, 42);
    pop();
  }

  drawNightOverlay() {
    noStroke();
    fill(4, 9, 14, 175 * this.nightAmount);
    rect(0, 0, width, height);

    this.obstacles.forEach((obstacle) => obstacle.drawLanternGlow(this.nightAmount));

    fill(235, 190, 100, 22 * this.nightAmount);
    circle(this.player.position.x, this.player.position.y - 35, 120);
    fill(235, 190, 100, 42 * this.nightAmount);
    circle(this.player.position.x, this.player.position.y - 35, 65);
  }

  drawHud() {
    push();
    noStroke();
    fill(24, 16, 12, 205);
    rect(20, 18, 300, 82, 3);
    fill(this.palette.paper);
    rect(25, 23, 290, 72, 2);
    fill(this.palette.ink);
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    textSize(14);
    text(this.phases[this.phaseIndex].name.toUpperCase(), 40, 34);
    textSize(25);
    text(nf(this.score, 6), 40, 53);
    textSize(12);
    text(`PINHÕES  ${nf(this.pinhaoCount, 2)}`, 190, 36);
    text(`VELOCIDADE  ${this.speed.toFixed(0)}`, 190, 58);

    textAlign(RIGHT, TOP);
    textSize(23);
    for (let index = 0; index < 3; index += 1) {
      fill(index < this.lives ? this.palette.red : color(103, 87, 67));
      text("♥", width - 32 - index * 31, 31);
    }

    if (this.player.luckyTimer > 0) {
      const barWidth = map(this.player.luckyTimer, 0, 3, 0, 190);
      fill(20, 29, 19, 220);
      rect(width - 234, 66, 208, 29, 2);
      fill(72, 127, 61);
      rect(width - 225, 74, barWidth, 13);
      fill(this.palette.cream);
      textAlign(CENTER, CENTER);
      textSize(10);
      text("CHIMARRÃO DA SORTE", width - 130, 80);
    }
    pop();
  }

  drawPhaseBanner() {
    if (this.phaseBannerTimer <= 0) return;

    const alpha = min(1, this.phaseBannerTimer * 2) * min(1, (2.5 - this.phaseBannerTimer) * 3);
    push();
    translate(width / 2, 133);
    noStroke();
    fill(28, 18, 13, 215 * alpha);
    rectMode(CENTER);
    rect(0, 0, 450, 74, 2);
    fill(this.palette.gold);
    rect(0, -31, 420, 3);
    rect(0, 31, 420, 3);
    fill(239, 217, 164, 255 * alpha);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(13);
    text(this.phases[this.phaseIndex].name.toUpperCase(), 0, -12);
    textSize(24);
    text(this.message, 0, 12);
    pop();
  }

  drawMenu() {
    this.drawSimpleMenuBackground();
    this.buttons = [];

    push();
    fill(this.palette.ink);
    textAlign(CENTER, CENTER);
    textStyle(NORMAL);
    textFont("Alfa Slab One");
    textSize(58);
    text("VELHO SUL", width / 2, 150);
    textFont("Libre Franklin");
    textStyle(BOLD);
    textSize(12);
    text("UMA FUGA PELAS TERRAS DO SUL", width / 2, 202);

    const labels = ["JOGAR", "COMO JOGAR", "SOBRE"];
    for (let index = 0; index < labels.length; index += 1) {
      this.drawButton(labels[index], width / 2, 300 + index * 66, 270, index);
    }

    fill(this.palette.ink);
    textStyle(BOLD);
    textSize(10);
    text("↑ ↓ ESCOLHER  •  ENTER CONFIRMAR", width / 2, 535);
    if (this.highScore > 0) {
      fill(this.palette.red);
      text(`RECORDE  ${nf(this.highScore, 6)}`, width / 2, 565);
    }
    pop();
  }

  drawSimpleMenuBackground() {
    background(this.palette.paper);
    noStroke();
    fill(this.palette.green);
    rect(0, 0, width, 12);
    rect(0, height - 12, width, 12);
    fill(this.palette.red);
    rect(0, 20, width, 3);
    rect(0, height - 23, width, 3);
  }

  drawPosterBackground() {
    this.drawSimpleMenuBackground();
  }

  drawButton(label, x, y, buttonWidth, index) {
    const hovered = pointInside(mouseX, mouseY, x - buttonWidth / 2, y - 22, buttonWidth, 44);
    if (hovered) this.menuSelection = index;
    const selected = this.menuSelection === index;

    stroke(this.palette.ink);
    strokeWeight(2);
    fill(selected ? this.palette.red : this.palette.paper);
    rectMode(CENTER);
    rect(x, y, buttonWidth, 44, 1);
    noStroke();
    fill(selected ? this.palette.cream : this.palette.ink);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(15);
    text(label, x, y);

    this.buttons.push({
      x: x - buttonWidth / 2,
      y: y - 22,
      width: buttonWidth,
      height: 44,
      action: index
    });
  }

  drawAbout() {
    this.drawPosterBackground();
    push();
    fill(this.palette.ink);
    textAlign(CENTER, TOP);
    textFont("Alfa Slab One");
    textSize(38);
    text("SOBRE", width / 2, 92);
    textFont("Libre Franklin");
    textStyle(BOLD);
    textSize(14);
    text(
      "Velho Sul é um jogo de corrida em três faixas.\n" +
        "Desvie dos obstáculos e colete pinhões.",
      width / 2,
      170
    );

    fill(this.palette.red);
    rectMode(CENTER);
    rect(width / 2, 250, 260, 2);
    fill(this.palette.ink);
    textSize(13);
    text("PARTICIPANTE", width / 2, 292);
    textSize(24);
    PARTICIPANTS.forEach((participant, index) => {
      text(participant, width / 2, 334 + index * 38);
    });

    textFont("Libre Franklin");
    textSize(11);
    text(
      "Projeto final de HTML5 Canvas & Games",
      width / 2,
      425
    );
    this.drawBackHint();
    pop();
  }

  drawHelp() {
    this.drawPosterBackground();
    push();
    fill(this.palette.ink);
    textAlign(CENTER, TOP);
    textFont("Alfa Slab One");
    textSize(38);
    text("COMO JOGAR", width / 2, 82);
    textFont("Libre Franklin");

    const cards = [
      ["1", "Use ↑ e ↓ para trocar de faixa."],
      ["2", "Desvie de jagunços, barris e barreiras com tábuas."],
      ["3", "Colete pinhões para aumentar os pontos."],
      ["4", "O chimarrão deixa você invencível por 3 segundos."]
    ];

    cards.forEach((card, index) => {
      const y = 175 + index * 82;
      fill(this.palette.red);
      textAlign(RIGHT, CENTER);
      textStyle(BOLD);
      textSize(20);
      text(card[0], 285, y);
      fill(this.palette.ink);
      textAlign(LEFT, CENTER);
      textSize(14);
      text(card[1], 325, y);
      stroke(34, 23, 16, 45);
      strokeWeight(1);
      line(325, y + 31, 735, y + 31);
      noStroke();
    });

    this.drawBackHint();
    pop();
  }

  drawBackHint() {
    fill(this.palette.ink);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(12);
    text("ESC, ENTER OU CLIQUE PARA VOLTAR", width / 2, 572);
  }

  drawPause() {
    rectMode(CORNER);
    noStroke();
    fill(12, 9, 7, 198);
    rect(0, 0, width, height);

    fill(this.palette.cream);
    textAlign(CENTER, CENTER);
    textFont("Alfa Slab One");
    textSize(48);
    text("PAUSA", width / 2, height / 2 - 86);
    textFont("Libre Franklin");

    this.drawOverlayButton("CONTINUAR", width / 2, height / 2, 280, "resume", true);
    this.drawOverlayButton(
      "TELA DE TÍTULO",
      width / 2,
      height / 2 + 58,
      280,
      "title",
      false
    );

    fill(this.palette.paper);
    textStyle(BOLD);
    textSize(10);
    text("P CONTINUA  •  ESC VOLTA AO TÍTULO", width / 2, height / 2 + 112);
  }

  drawGameOver() {
    rectMode(CORNER);
    noStroke();
    fill(12, 9, 7, 185);
    rect(0, 0, width, height);

    push();
    rectMode(CENTER);
    stroke(this.palette.ink);
    strokeWeight(3);
    fill(this.palette.paper);
    rect(width / 2, height / 2, 520, 410, 4);

    noStroke();
    fill(this.palette.ink);
    textAlign(CENTER, CENTER);
    textFont("Alfa Slab One");
    textSize(39);
    text("FIM DA FUGA", width / 2, height / 2 - 137);
    textFont("Libre Franklin");
    textStyle(BOLD);
    textSize(11);
    fill(this.palette.red);
    text("PONTUAÇÃO", width / 2, height / 2 - 91);
    textSize(36);
    fill(this.palette.ink);
    text(nf(this.score, 6), width / 2, height / 2 - 55);
    textSize(13);
    text(`PINHÕES ${this.pinhaoCount}  •  ${this.elapsed.toFixed(1)} SEGUNDOS`, width / 2, height / 2 - 12);

    fill(this.score >= this.highScore ? this.palette.red : this.palette.ink);
    textSize(11);
    text(
      this.score >= this.highScore ? "NOVO RECORDE!" : `RECORDE ${nf(this.highScore, 6)}`,
      width / 2,
      height / 2 + 18
    );
    pop();

    this.drawOverlayButton(
      "JOGAR NOVAMENTE",
      width / 2,
      height / 2 + 90,
      300,
      "restart",
      true,
      true
    );
    this.drawOverlayButton(
      "TELA DE TÍTULO",
      width / 2,
      height / 2 + 146,
      300,
      "title",
      false,
      true
    );
  }

  drawOverlayButton(label, x, y, buttonWidth, action, primary, lightBackground = false) {
    const buttonHeight = 40;
    const hovered = pointInside(
      mouseX,
      mouseY,
      x - buttonWidth / 2,
      y - buttonHeight / 2,
      buttonWidth,
      buttonHeight
    );

    push();
    stroke(lightBackground ? this.palette.ink : primary || hovered ? this.palette.gold : this.palette.paper);
    strokeWeight(2);
    if (primary || hovered) {
      fill(this.palette.red);
    } else if (lightBackground) {
      fill(this.palette.paper);
    } else {
      fill(20, 15, 12, 110);
    }
    rectMode(CENTER);
    rect(x, y, buttonWidth, buttonHeight, 1);
    noStroke();
    fill(primary || hovered ? this.palette.cream : lightBackground ? this.palette.ink : this.palette.cream);
    textAlign(CENTER, CENTER);
    textFont("Libre Franklin");
    textStyle(BOLD);
    textSize(12);
    text(label, x, y);
    pop();

    this.actionButtons.push({
      x: x - buttonWidth / 2,
      y: y - buttonHeight / 2,
      width: buttonWidth,
      height: buttonHeight,
      action
    });
  }

  handleKey(code, pressedKey) {
    this.sound.unlock();

    if (pressedKey === "m" || pressedKey === "M") {
      this.sound.toggleMute();
      return false;
    }

    if (this.state === "menu") {
      if (code === UP_ARROW) {
        this.menuSelection = (this.menuSelection + 2) % 3;
        this.sound.playEffect("menu");
      } else if (code === DOWN_ARROW) {
        this.menuSelection = (this.menuSelection + 1) % 3;
        this.sound.playEffect("menu");
      } else if (code === ENTER || pressedKey === " ") {
        this.activateMenu(this.menuSelection);
      }
      return false;
    }

    if (this.state === "about" || this.state === "help") {
      if (code === ESCAPE || code === ENTER || pressedKey === " ") {
        this.state = "menu";
        this.sound.playEffect("menu");
      }
      return false;
    }

    if (this.state === "gameover") {
      if (code === ENTER || pressedKey === " ") {
        this.startGame();
      } else if (code === ESCAPE) {
        this.goToTitle();
      }
      return false;
    }

    if (this.state === "paused") {
      if (pressedKey === "p" || pressedKey === "P" || code === ENTER) {
        this.state = "playing";
      } else if (code === ESCAPE) {
        this.goToTitle();
      }
      this.sound.playEffect("menu");
      return false;
    }

    if (this.state === "playing") {
      if (pressedKey === "p" || pressedKey === "P" || code === ESCAPE) {
        this.state = "paused";
        this.sound.playEffect("menu");
        return false;
      }

      if (code === UP_ARROW || pressedKey === "w" || pressedKey === "W") {
        this.player.move(-1);
        this.sound.playEffect("menu");
      } else if (code === DOWN_ARROW || pressedKey === "s" || pressedKey === "S") {
        this.player.move(1);
        this.sound.playEffect("menu");
      }
    }
    return false;
  }

  handlePointer(pointerX, pointerY) {
    const now = millis();
    if (now - this.lastTouchAt < 120) return;
    this.lastTouchAt = now;
    this.sound.unlock();

    if (this.state === "menu") {
      const clicked = this.buttons.find((button) =>
        pointInside(pointerX, pointerY, button.x, button.y, button.width, button.height)
      );
      if (clicked) this.activateMenu(clicked.action);
      return;
    }

    if (this.state === "about" || this.state === "help") {
      this.state = "menu";
      this.sound.playEffect("menu");
    } else if (this.state === "gameover") {
      const clicked = this.findActionButton(pointerX, pointerY);
      if (clicked?.action === "title") this.goToTitle();
      else if (clicked?.action === "restart") this.startGame();
    } else if (this.state === "paused") {
      const clicked = this.findActionButton(pointerX, pointerY);
      if (clicked?.action === "title") this.goToTitle();
      else if (clicked?.action === "resume") this.state = "playing";
    } else if (this.state === "playing") {
      this.player.move(pointerY < this.player.position.y ? -1 : 1);
      this.sound.playEffect("menu");
    }
  }

  activateMenu(index) {
    this.sound.playEffect("menu");
    if (index === 0) this.startGame();
    else if (index === 1) this.state = "help";
    else this.state = "about";
  }

  findActionButton(pointerX, pointerY) {
    return this.actionButtons.find((button) =>
      pointInside(
        pointerX,
        pointerY,
        button.x,
        button.y,
        button.width,
        button.height
      )
    );
  }

  goToTitle() {
    this.state = "menu";
    this.menuSelection = 0;
    this.obstacles = [];
    this.collectibles = [];
    this.particles = [];
    this.sound.playEffect("menu");
  }
}

function rectanglesOverlap(first, second) {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  );
}

function pointInside(pointX, pointY, x, y, boxWidth, boxHeight) {
  return (
    pointX >= x &&
    pointX <= x + boxWidth &&
    pointY >= y &&
    pointY <= y + boxHeight
  );
}
