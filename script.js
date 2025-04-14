const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

const boomSound = new Audio('firework.mp3');
boomSound.volume = 0.4;

const colors = [
  '255, 215, 0',   // Gold
  '255, 0, 0'      // Red
];

let hue = 0;
let intervalId = null;
let fireworksRunning = false;
let fadeOut = false;
let rockets = [];

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function Rocket(x, y) {
  this.x = x;
  this.y = y;
  this.speed = random(5, 7);
  this.targetY = random(100, 300);
  this.exploded = false;
  this.particles = [];

  this.update = function() {
    if (!this.exploded) {
      this.y -= this.speed;
      if (this.y <= this.targetY) {
        this.exploded = true;
        if (fireworksRunning) {
          boomSound.currentTime = 0;
          boomSound.play();
        }
        this.explode();
      }
    } else {
      this.particles.forEach(p => {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        p.y += 0.5; // Gravity
      });
    }
  };

  this.explode = function() {
    for (let i = 0; i < 100; i++) {
      this.particles.push({
        x: this.x,
        y: this.y,
        radius: random(1, 2),
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * Math.PI * 2,
        speed: random(1, 3),
        alpha: 1,
        decay: 0
      });
    }
  };

  this.draw = function() {
    if (!this.exploded) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
    } else {
      this.particles.forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y + 10);
        ctx.strokeStyle = `rgba(${p.color}, 1)`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
  };
}

function launchRocket() {
  const x = random(100, canvas.width - 100);
  rockets.push(new Rocket(x, canvas.height));
}

canvas.addEventListener('click', function toggleFireworks() {
  if (fireworksRunning) {
    // Stop everything
    clearInterval(intervalId);
    intervalId = null;
    fireworksRunning = false;
    rockets = []; // Clear rockets
    boomSound.pause();
    boomSound.currentTime = 0;
    fadeOut = true; // Start fading background
  } else {
    // Start everything
    intervalId = setInterval(launchRocket, 800);
    fireworksRunning = true;
    fadeOut = false; // Colorful background
  }
});

function animate() {
  if (fadeOut) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; // Slow black fade
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = `hsl(${hue}, 100%, 5%)`; // Color background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    hue += 0.3;
    if (hue > 360) hue = 0;
  }

  rockets.forEach((rocket, index) => {
    rocket.update();
    rocket.draw();
    if (rocket.exploded && rocket.particles.length === 0) {
      rockets.splice(index, 1);
    }
  });

  requestAnimationFrame(animate);
}

animate();
