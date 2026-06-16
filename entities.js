class Player {
  constructor(x, laneYs) {
    this.position = createVector(x, laneYs[1]);
    this.laneYs = laneYs;
    this.lane = 1;
    this.width = 60;
    this.height = 82;
    this.invincibleTimer = 0;
    this.luckyTimer = 0;
    this.stepTime = 0;
  }

  reset() {
    this.lane = 1;
    this.position.set(this.position.x, this.laneYs[this.lane]);
    this.invincibleTimer = 0;
    this.luckyTimer = 0;
    this.stepTime = 0;
  }

  move(direction) {
    this.lane = constrain(this.lane + direction, 0, this.laneYs.length - 1);
  }

  update(deltaSeconds, speed) {
    const targetY = this.laneYs[this.lane];
    const interpolation = 1 - Math.pow(0.82, deltaSeconds * 60);
    this.position.y = lerp(this.position.y, targetY, interpolation);
    this.stepTime += deltaSeconds * map(speed, 280, 820, 7, 13, true);
    this.invincibleTimer = max(0, this.invincibleTimer - deltaSeconds);
    this.luckyTimer = max(0, this.luckyTimer - deltaSeconds);
  }

  activateLuckyHat() {
    this.luckyTimer = 3;
    this.invincibleTimer = max(this.invincibleTimer, 3);
  }

  getBounds() {
    return {
      x: this.position.x - 21,
      y: this.position.y - 61,
      width: 42,
      height: 64
    };
  }

  draw() {
    const bob = sin(this.stepTime * 2) * 2.4;
    const legSwing = sin(this.stepTime) * 0.52;

    push();
    translate(this.position.x, this.position.y + bob);

    if (this.luckyTimer > 0) {
      const pulse = 76 + sin(frameCount * 0.19) * 8;
      noStroke();
      fill(212, 169, 58, 42);
      circle(0, -36, pulse);
    }

    if (this.invincibleTimer > 0 && floor(this.invincibleTimer * 12) % 2 === 0) {
      tint(255, 130);
    }

    this.drawShadow();

    stroke(31, 20, 13);
    strokeWeight(5);
    strokeCap(ROUND);
    line(-10, -6, -13 + legSwing * 12, 18);
    line(10, -6, 13 - legSwing * 12, 18);
    strokeWeight(7);
    line(-14 + legSwing * 12, 18, -22 + legSwing * 10, 20);
    line(14 - legSwing * 12, 18, 22 - legSwing * 10, 20);

    noStroke();
    fill(76, 50, 26);
    rect(-21, -47, 42, 43, 9);
    fill(181, 139, 73);
    rect(-17, -43, 34, 34, 7);
    fill(97, 35, 27);
    triangle(-17, -42, 17, -42, 0, -8);

    stroke(53, 31, 16);
    strokeWeight(6);
    line(-18, -37, -29 - legSwing * 5, -20);
    line(18, -37, 29 + legSwing * 5, -23);

    noStroke();
    fill(181, 126, 76);
    ellipse(0, -61, 29, 32);
    fill(41, 28, 18);
    arc(0, -68, 32, 25, PI, TWO_PI);
    fill(35, 24, 16);
    ellipse(0, -72, 50, 10);
    rect(-15, -84, 30, 14, 4);
    fill(139, 48, 34);
    rect(-15, -74, 30, 4);

    stroke(43, 26, 14);
    strokeWeight(2);
    line(5, -61, 10, -60);
    line(10, -60, 7, -56);

    noTint();
    pop();
  }

  drawShadow() {
    noStroke();
    fill(20, 14, 10, 78);
    ellipse(0, 21, 64, 15);
  }
}

class Obstacle {
  constructor(type, lane, laneYs, startX, speed) {
    this.type = type;
    this.lane = lane;
    this.laneYs = laneYs;
    this.position = createVector(startX, laneYs[lane]);
    this.baseSpeed = speed;
    this.age = random(10);
    this.remove = false;
    this.collisionHandled = false;
    this.hitTimer = 0;
    this.hitDuration = 0.34;

    if (type === "tabua") {
      this.lanesBlocked = 2;
      this.width = 108;
      this.height = abs(laneYs[1] - laneYs[0]) + 82;
      this.speedMultiplier = 0.78;
      this.position.y = (laneYs[lane] + laneYs[lane + 1]) / 2;
    } else if (type === "barril") {
      this.lanesBlocked = 1;
      this.width = 48;
      this.height = 58;
      this.speedMultiplier = 1.43;
    } else {
      this.lanesBlocked = 1;
      this.width = 58;
      this.height = 80;
      this.speedMultiplier = 1;
    }
  }

  update(deltaSeconds, speed) {
    this.age += deltaSeconds;

    if (this.hitTimer > 0) {
      this.hitTimer -= deltaSeconds;
      this.position.x += 150 * deltaSeconds;
      if (this.hitTimer <= 0) this.remove = true;
      return;
    }

    this.position.x -= speed * this.speedMultiplier * deltaSeconds;
    this.remove = this.position.x < -this.width - 30;
  }

  hit() {
    this.collisionHandled = true;

    if (this.type === "jagunco") {
      this.hitTimer = this.hitDuration;
    } else {
      this.remove = true;
    }
  }

  getBounds() {
    if (this.type === "tabua") {
      return {
        x: this.position.x - this.width / 2 + 10,
        y: this.position.y - this.height / 2 + 9,
        width: this.width - 20,
        height: this.height - 18
      };
    }

    return {
      x: this.position.x - this.width / 2 + 6,
      y: this.position.y - this.height + 7,
      width: this.width - 12,
      height: this.height - 10
    };
  }

  draw() {
    if (this.type === "tabua") {
      this.drawBoardCarriers();
    } else if (this.type === "barril") {
      this.drawBarrel();
    } else {
      this.drawJagunco();
    }
  }

  drawJagunco() {
    const sway = sin(this.age * 9) * 0.1;
    const wasHit = this.hitTimer > 0;
    const flashRed = wasHit && floor(this.hitTimer * 28) % 2 === 0;
    push();
    translate(this.position.x, this.position.y);
    rotate(sway - (wasHit ? 0.18 : 0));

    if (wasHit) {
      stroke(196, 61, 42);
      strokeWeight(4);
      line(-34, -72, -46, -82);
      line(-37, -47, -52, -47);
      line(-29, -23, -42, -14);
    }

    noStroke();
    fill(17, 13, 11, 75);
    ellipse(0, 7, 58, 13);

    stroke(27, 19, 14);
    strokeWeight(6);
    line(-9, -5, -12, 10);
    line(9, -5, 13, 10);

    noStroke();
    fill(flashRed ? color(151, 48, 37) : color(46, 38, 29));
    rect(-21, -54, 42, 51, 5);
    fill(flashRed ? color(210, 82, 57) : color(94, 42, 28));
    triangle(-21, -50, 21, -50, 0, -6);
    fill(flashRed ? color(224, 151, 103) : color(164, 111, 65));
    ellipse(0, -68, 28, 31);
    fill(24, 18, 14);
    ellipse(0, -82, 53, 10);
    rect(-17, -91, 34, 10, 2);

    stroke(30, 20, 12);
    strokeWeight(4);
    line(18, -43, 34, -25);
    line(33, -25, 36, -8);
    noStroke();
    fill(234, 169, 54);
    rect(29, -12, 14, 19, 3);
    fill(255, 221, 128, 180);
    rect(32, -9, 8, 11, 2);
    pop();
  }

  drawLanternGlow(nightAmount) {
    if (this.type !== "jagunco" || nightAmount < 0.15) return;

    const glowX = this.position.x + 36;
    const glowY = this.position.y - 4;
    noStroke();
    fill(255, 208, 92, 18 * nightAmount);
    circle(glowX, glowY, 126);
    fill(255, 208, 92, 35 * nightAmount);
    circle(glowX, glowY, 72);
    fill(255, 221, 128, 70 * nightAmount);
    circle(glowX, glowY, 28);
  }

  drawBoardCarriers() {
    const laneDistance = abs(this.laneYs[1] - this.laneYs[0]);

    push();
    translate(this.position.x, this.position.y);

    push();
    translate(31, -37);
    rotate(-0.08);
    stroke(67, 38, 20);
    strokeWeight(4);
    fill(139, 79, 36);
    rectMode(CENTER);
    rect(0, 0, 32, laneDistance + 58, 3);
    stroke(191, 123, 57);
    strokeWeight(2);
    line(-5, -laneDistance / 2 - 20, -5, laneDistance / 2 + 20);
    pop();

    this.drawBoardCarrier(-laneDistance / 2, color(42, 84, 62), -1);
    this.drawBoardCarrier(laneDistance / 2, color(50, 75, 105), 1);

    pop();
  }

  drawBoardCarrier(offsetY, shirtColor, side) {
    const step = sin(this.age * 7 + side) * 3;

    push();
    translate(0, offsetY);

    noStroke();
    fill(19, 14, 11, 65);
    ellipse(0, 8, 55, 12);

    stroke(29, 20, 14);
    strokeWeight(6);
    line(-8, -4, -11 + step, 11);
    line(8, -4, 11 - step, 11);

    noStroke();
    fill(shirtColor);
    rect(-20, -52, 40, 48, 5);
    fill(113, 55, 35);
    triangle(-20, -48, 20, -48, 0, -7);

    fill(176, 122, 76);
    ellipse(0, -66, 28, 30);
    fill(31, 23, 17);
    ellipse(0, -79, 50, 9);
    rect(-16, -88, 32, 10, 2);

    stroke(42, 27, 17);
    strokeWeight(5);
    line(16, -39, 29, -32);
    line(29, -32, 27, -19);
    pop();
  }

  drawBarrel() {
    const rotation = this.age * 8;
    push();
    translate(this.position.x, this.position.y - 28);
    rotate(rotation);
    noStroke();
    fill(28, 18, 12, 65);
    ellipse(7, 34, 51, 12);
    fill(109, 55, 25);
    ellipse(0, 0, 47, 57);
    fill(143, 76, 31);
    rect(-19, -19, 38, 38, 4);
    stroke(48, 31, 20);
    strokeWeight(5);
    line(-22, -15, 22, -15);
    line(-22, 15, 22, 15);
    noFill();
    stroke(214, 162, 57);
    strokeWeight(2);
    circle(0, 0, 17);
    line(-6, -6, 6, 6);
    line(6, -6, -6, 6);
    pop();
  }
}

class Collectible {
  constructor(type, lane, laneYs, startX, imageAsset = null) {
    this.type = type;
    this.lane = lane;
    this.laneYs = laneYs;
    this.position = createVector(startX, laneYs[lane] - 37);
    this.baseY = this.position.y;
    this.phase = random(TWO_PI);
    this.age = 0;
    this.remove = false;
    this.imageAsset = imageAsset;
    this.radius = type === "chimarrao" ? 28 : 21;
    this.halfWidth = type === "chimarrao" ? 28 : 18;
    this.halfHeight = type === "chimarrao" ? 28 : 29;
  }

  update(deltaSeconds, speed) {
    this.age += deltaSeconds;
    this.position.x -= speed * 0.86 * deltaSeconds;
    this.position.y = this.baseY + cos(this.age * 5.2 + this.phase) * 22;
    this.remove = this.position.x < -50;
  }

  getBounds() {
    return {
      x: this.position.x - this.halfWidth,
      y: this.position.y - this.halfHeight,
      width: this.halfWidth * 2,
      height: this.halfHeight * 2
    };
  }

  draw() {
    push();
    translate(this.position.x, this.position.y);
    rotate(sin(this.age * 4) * 0.16);

    noStroke();
    const auraColor = this.type === "chimarrao" ? color(96, 181, 82) : color(231, 177, 57);
    fill(red(auraColor), green(auraColor), blue(auraColor), 35);
    circle(0, 0, this.radius * 2.5);

    if (this.imageAsset) {
      imageMode(CENTER);
      if (this.type === "chimarrao") {
        image(this.imageAsset, 0, 0, 57, 57);
      } else {
        image(this.imageAsset, 0, 0, 36, 58);
      }
    } else if (this.type === "chimarrao") {
      this.drawChimarrao();
    } else {
      this.drawPinhao();
    }
    pop();
  }

  drawPinhao() {
    noStroke();
    fill(112, 53, 26);
    ellipse(0, 3, 21, 49);
    fill(181, 105, 43);
    ellipse(-4, 0, 7, 34);
    fill(63, 38, 21);
    triangle(-5, -20, 6, -20, 1, -31);
  }

  drawChimarrao() {
    noStroke();
    fill(102, 58, 28);
    ellipse(0, 5, 35, 39);
    fill(46, 91, 43);
    ellipse(0, -5, 31, 15);
    stroke(197, 170, 104);
    strokeWeight(4);
    line(8, -10, 20, -32);
  }
}

class Particle {
  constructor(x, y, palette, burst = false) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.fromAngle(
      random(burst ? PI : TWO_PI),
      random(burst ? 90 : 45, burst ? 260 : 130)
    );
    if (burst) this.velocity.y -= random(80, 210);
    this.life = random(0.55, 1.05);
    this.maxLife = this.life;
    this.size = random(3, 7);
    this.color = random(palette);
  }

  update(deltaSeconds) {
    this.velocity.y += 420 * deltaSeconds;
    this.position.add(p5.Vector.mult(this.velocity, deltaSeconds));
    this.life -= deltaSeconds;
  }

  draw() {
    noStroke();
    fill(red(this.color), green(this.color), blue(this.color), map(this.life, 0, this.maxLife, 0, 255));
    circle(this.position.x, this.position.y, this.size);
  }
}
