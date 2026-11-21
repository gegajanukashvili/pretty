
/* --------------------------------
   DOM ELEMENTS
-------------------------------- */

const questionScreen = document.getElementById("screen-question");
const detailsScreen = document.getElementById("screen-details");
const successScreen = document.getElementById("screen-success");

const stage = document.getElementById("buttonStage");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const noQuestion = document.getElementById("noQuestion");
const hint = document.getElementById("hint");

const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");

const confirmButton = document.getElementById("confirmButton");
const backButton = document.getElementById("backButton");
const restartButton = document.getElementById("restartButton");

const resultDate = document.getElementById("resultDate");
const resultTime = document.getElementById("resultTime");

/* MUSIC ELEMENTS */

const backgroundMusic = document.getElementById("backgroundMusic");
const musicToggle = document.getElementById("musicToggle");
const musicIcon = document.getElementById("musicIcon");
const musicText = document.getElementById("musicText");


/* --------------------------------
   VARIABLES
-------------------------------- */

let questionCount = 0;
let isRunaway = false;
let isMoving = false;
let questionTimer = null;
let previousPositions = [];

let musicEnabled = true;
let bookingAnimationRunning = false;
let bookingRequestRunning = false;

const questions = [
  "Are you sure?",
  "Really sure?"
];

const escapeDistance = 85;

// Production PHP API
const BOOKING_API = "https://cnk.ge/api/setup.php?action=book";


/* --------------------------------
   SCREEN SWITCHING
-------------------------------- */

function showScreen(screen) {
  if (!screen) return;

  document.querySelectorAll(".screen").forEach(item => {
    item.classList.remove("active");
  });

  screen.classList.add("active");
}


/* --------------------------------
   DATE
-------------------------------- */

function getLocalDateString() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

if (dateInput) {
  dateInput.min = getLocalDateString();
}


/* --------------------------------
   HINT
-------------------------------- */

function updateHint(message) {
  if (!hint) return;

  const hintText = hint.querySelector("span:last-child");

  if (hintText) {
    hintText.textContent = message;
  }
}


/* --------------------------------
   NO QUESTION
-------------------------------- */

function showNoQuestion() {
  if (questionCount >= 2) {
    isRunaway = true;

    noQuestion.classList.remove("visible");

    noButton.style.display = "";
    noButton.classList.remove("moving");

    noButton.style.left = "";
    noButton.style.top = "";

    previousPositions = [];

    updateHint("დააჭირე კის, სადამდე უნდა ზდიო.");

    return;
  }

  const question = questions[questionCount];

  questionCount++;

  noButton.style.display = "none";

  noQuestion.textContent = question;
  noQuestion.classList.remove("visible");

  void noQuestion.offsetWidth;

  noQuestion.classList.add("visible");

  clearTimeout(questionTimer);

  questionTimer = setTimeout(() => {
    noQuestion.classList.remove("visible");
    noButton.style.display = "";
  }, 1400);
}


/* --------------------------------
   NO BUTTON MOVEMENT
-------------------------------- */

function moveNoButton() {
  if (!isRunaway || isMoving || !stage || !noButton) return;

  isMoving = true;

  const padding = 18;

  const buttonWidth = noButton.offsetWidth;
  const buttonHeight = noButton.offsetHeight;

  const stageRect = stage.getBoundingClientRect();
  const currentRect = noButton.getBoundingClientRect();

  // Stage-ის რეალური საზღვრები

  const minX = padding;
  const minY = padding;

  const maxX = Math.max(
    minX,
    stageRect.width - buttonWidth - padding
  );

  const maxY = Math.max(
    minY,
    stageRect.height - buttonHeight - padding
  );

  // მიმდინარე პოზიცია Stage-ის მიმართ

  const currentX = currentRect.left - stageRect.left;
  const currentY = currentRect.top - stageRect.top;

  const moveDistance = 120;
  const candidates = [];

  for (let i = 0; i < 100; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 45 + Math.random() * moveDistance;

    let x = currentX + Math.cos(angle) * distance;
    let y = currentY + Math.sin(angle) * distance;

    x = Math.max(minX, Math.min(maxX, x));
    y = Math.max(minY, Math.min(maxY, y));

    const currentDistance = Math.hypot(
      x - currentX,
      y - currentY
    );

    const historyDistance = previousPositions.length
      ? Math.min(
          ...previousPositions.map(position =>
            Math.hypot(x - position.x, y - position.y)
          )
        )
      : 100;

    const score = Math.min(
      currentDistance,
      historyDistance * 0.7
    );

    candidates.push({ x, y, score });
  }

  candidates.sort((a, b) => b.score - a.score);

  const best = candidates[0];

  if (!best) {
    isMoving = false;
    return;
  }

  previousPositions.push({
    x: best.x,
    y: best.y
  });

  if (previousPositions.length > 5) {
    previousPositions.shift();
  }

  noButton.classList.add("moving");

  noButton.style.left = `${best.x}px`;
  noButton.style.top = `${best.y}px`;

  setTimeout(() => {
    isMoving = false;
  }, 550);
}


/* --------------------------------
   MOUSE PROXIMITY DETECTION
-------------------------------- */

if (stage && noButton) {
  stage.addEventListener("mousemove", (event) => {
    if (!isRunaway || isMoving) return;

    const rect = noButton.getBoundingClientRect();

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const closestX = Math.max(
      rect.left,
      Math.min(mouseX, rect.right)
    );

    const closestY = Math.max(
      rect.top,
      Math.min(mouseY, rect.bottom)
    );

    const distance = Math.hypot(
      mouseX - closestX,
      mouseY - closestY
    );

    if (distance < escapeDistance) {
      moveNoButton();
    }
  });
}


/* --------------------------------
   NO BUTTON EVENTS
-------------------------------- */

if (noButton) {
  noButton.addEventListener("mouseenter", () => {
    if (isRunaway) {
      moveNoButton();
    } else {
      showNoQuestion();
    }
  });


  /* --------------------------------
     MOBILE TOUCH
  -------------------------------- */

  noButton.addEventListener("touchstart", (event) => {
    event.preventDefault();

    if (isRunaway) {
      moveNoButton();
    } else {
      showNoQuestion();
    }
  }, { passive: false });


  /* --------------------------------
     NO BUTTON CLICK
  -------------------------------- */

  noButton.addEventListener("click", (event) => {
    event.preventDefault();

    if (isRunaway) {
      moveNoButton();
    } else {
      showNoQuestion();
    }
  });
}


/* --------------------------------
   CELEBRATION SOUND
-------------------------------- */

function playCelebrationSound() {
  const melody = new Audio("sounds/celebration.mp3");

  melody.volume = 0.65;
  melody.currentTime = 0;

  melody.addEventListener("ended", () => {
    startBackgroundMusic();
  }, { once: true });

  melody.play().catch(error => {
    console.log("Celebration playback error:", error);
  });
}


/* --------------------------------
   BACKGROUND MUSIC
-------------------------------- */

function startBackgroundMusic() {
  if (!backgroundMusic || !musicEnabled) return;

  backgroundMusic.volume = 0.35;

  backgroundMusic.play().catch(error => {
    console.log("Background music playback error:", error);
  });
}


function stopBackgroundMusic() {
  if (!backgroundMusic) return;

  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
}


/* --------------------------------
   MUSIC BUTTON DESIGN
-------------------------------- */

function updateMusicButton() {
  if (!musicToggle || !musicIcon || !musicText) return;

  musicIcon.textContent = "♫";
  musicText.textContent = "×";

  if (musicEnabled) {
    musicToggle.classList.remove("muted");
    musicToggle.setAttribute("aria-label", "Turn music off");
    musicToggle.setAttribute("title", "Music on");
  } else {
    musicToggle.classList.add("muted");
    musicToggle.setAttribute("aria-label", "Turn music on");
    musicToggle.setAttribute("title", "Music off");
  }
}


/* --------------------------------
   MUSIC TOGGLE
-------------------------------- */

if (musicToggle && backgroundMusic) {
  musicToggle.addEventListener("click", () => {
    musicEnabled = !musicEnabled;

    if (musicEnabled) {
      startBackgroundMusic();
    } else {
      backgroundMusic.pause();
    }

    updateMusicButton();
  });
}


/* --------------------------------
   YES CELEBRATION ANIMATION
-------------------------------- */

function startCelebration() {
  const celebration = document.createElement("div");

  celebration.className = "celebration-overlay";

  const decorations = [
    "🎀", "🦋", "🌸", "💗", "✨", "💕"
  ];

  const confettiColors = [
    "#f5a9c4",
    "#e8b4c5",
    "#f7d4e0",
    "#dba4ff",
    "#ffe08a",
    "#ffffff"
  ];

  // Falling confetti

  for (let i = 0; i < 65; i++) {
    const piece = document.createElement("span");

    piece.className = "celebration-confetti";
    piece.style.left = `${Math.random() * 100}%`;

    piece.style.background =
      confettiColors[
        Math.floor(Math.random() * confettiColors.length)
      ];

    piece.style.animationDelay = `${Math.random() * 2}s`;
    piece.style.animationDuration = `${2.5 + Math.random() * 2}s`;

    piece.style.setProperty(
      "--drift",
      `${Math.random() * 180 - 90}px`
    );

    celebration.appendChild(piece);
  }

  // Floating decorations

  for (let i = 0; i < 18; i++) {
    const decoration = document.createElement("span");

    decoration.className = "celebration-decoration";

    decoration.textContent =
      decorations[
        Math.floor(Math.random() * decorations.length)
      ];

    decoration.style.left = `${Math.random() * 94 + 3}%`;
    decoration.style.top = `${Math.random() * 85 + 5}%`;
    decoration.style.animationDelay = `${Math.random() * 1.5}s`;
    decoration.style.animationDuration = `${2 + Math.random() * 2}s`;

    decoration.style.setProperty(
      "--float",
      `${Math.random() * 50 + 20}px`
    );

    celebration.appendChild(decoration);
  }

  // Sparkles

  for (let i = 0; i < 35; i++) {
    const sparkle = document.createElement("span");

    sparkle.className = "celebration-sparkle";
    sparkle.textContent = "✦";

    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.animationDelay = `${Math.random() * 2}s`;
    sparkle.style.fontSize = `${10 + Math.random() * 20}px`;

    celebration.appendChild(sparkle);
  }

  // Main message

  const message = document.createElement("div");

  message.className = "celebration-message";

  message.innerHTML = `
    <div class="celebration-top">
      ✧ A LITTLE MOMENT TO CELEBRATE ✧
    </div>

    <div class="celebration-bow">🎀</div>

    <h2>მართლა უნდა წამოხვიდე ხოიცი!</h2>

    <p>This just got exciting.</p>

    <div class="celebration-bottom">
      ♡ ✨ ♡ ✨ ♡
    </div>
  `;

  celebration.appendChild(message);
  document.body.appendChild(celebration);

  setTimeout(() => {
    celebration.classList.add("celebration-exit");

    setTimeout(() => {
      celebration.remove();
    }, 500);
  }, 3200);
}


/* --------------------------------
   BOOKING CELEBRATION STYLES
-------------------------------- */

function addBookingCelebrationStyles() {
  if (document.getElementById("bookingCelebrationStyles")) return;

  const style = document.createElement("style");
  style.id = "bookingCelebrationStyles";

  style.textContent = `
    .booking-celebration {
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #fff1f6;
      animation: bunnyFadeIn .5s ease both;
    }

    .booking-content {
      position: relative;
      z-index: 5;
      width: min(94%, 550px);
      text-align: center;
      padding: 30px 15px;
    }

    .booking-envelope {
      position: relative;
      width: 180px;
      height: 115px;
      margin: 100px auto 55px;
      border-radius: 7px;
      background: #eaa6bd;
      box-shadow: 0 15px 35px rgba(190,110,140,.2);
      perspective: 600px;
      animation: envelopeBounce .7s ease both;
    }

    .booking-envelope::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 6;
      background: #f8c9d9;
      clip-path: polygon(0 0, 50% 57%, 100% 0);
      transform-origin: top center;
      animation: envelopeOpen .7s 1s ease forwards;
    }

    .booking-envelope::after {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 4;
      background: linear-gradient(135deg,#f4bfd0,#e79ab5);
      clip-path: polygon(0 100%, 50% 48%, 100% 100%);
    }

    /* GIRL BUNNY */

    .girl-bunny {
      position: absolute;
      z-index: 8;
      left: 50%;
      bottom: 5px;
      width: 115px;
      height: 175px;
      transform: translateX(-50%);
      opacity: 0;
      animation: bunnyJumpOut 1.1s 1.25s cubic-bezier(.2,1.4,.4,1) forwards;
    }

    .bunny-body {
      position: absolute;
      bottom: 0;
      left: 25px;
      width: 65px;
      height: 75px;
      background: #fffafc;
      border: 2px solid #f0dce4;
      border-radius: 48% 48% 35% 35%;
      box-shadow: inset -7px -5px 0 #f9e8ee;
    }

    .bunny-head {
      position: absolute;
      z-index: 3;
      top: 37px;
      left: 17px;
      width: 82px;
      height: 77px;
      background: #fffafc;
      border: 2px solid #f0dce4;
      border-radius: 48% 48% 45% 45%;
      box-shadow: inset -5px -4px 0 #f9e8ee;
    }

    .bunny-ear {
      position: absolute;
      z-index: 1;
      top: 0;
      width: 25px;
      height: 68px;
      background: #fffafc;
      border: 2px solid #f0dce4;
      border-radius: 50% 50% 45% 45%;
      transform-origin: bottom center;
    }

    .bunny-ear::after {
      content: "";
      position: absolute;
      inset: 9px 6px;
      border-radius: 50%;
      background: #f5b5ca;
    }

    .bunny-ear.left {
      left: 28px;
      transform: rotate(-15deg);
      animation: earWiggle 1.2s 2s ease-in-out infinite;
    }

    .bunny-ear.right {
      right: 28px;
      transform: rotate(15deg);
      animation: earWiggle 1.2s 2.15s ease-in-out infinite reverse;
    }

    .bunny-eye {
      position: absolute;
      top: 31px;
      width: 7px;
      height: 9px;
      border-radius: 50%;
      background: #55404a;
    }

    .bunny-eye.left { left: 22px; }
    .bunny-eye.right { right: 22px; }

    .bunny-cheek {
      position: absolute;
      top: 44px;
      width: 15px;
      height: 8px;
      border-radius: 50%;
      background: #f6b6c9;
      opacity: .85;
    }

    .bunny-cheek.left { left: 8px; }
    .bunny-cheek.right { right: 8px; }

    .bunny-nose {
      position: absolute;
      top: 43px;
      left: 50%;
      width: 9px;
      height: 7px;
      transform: translateX(-50%);
      border-radius: 50% 50% 60% 60%;
      background: #d98ca7;
    }

    .bunny-mouth {
      position: absolute;
      top: 50px;
      left: 50%;
      width: 13px;
      height: 7px;
      transform: translateX(-50%);
      border-bottom: 2px solid #a97989;
      border-radius: 50%;
    }

    /* PINK BOW */

    .bunny-bow {
      position: absolute;
      z-index: 5;
      top: 28px;
      right: 14px;
      width: 29px;
      height: 20px;
      transform: rotate(18deg);
    }

    .bunny-bow::before,
    .bunny-bow::after {
      content: "";
      position: absolute;
      top: 0;
      width: 15px;
      height: 17px;
      background: #ee91b1;
      border: 1px solid #d9789d;
    }

    .bunny-bow::before {
      left: 0;
      border-radius: 80% 20% 60% 40%;
      transform: rotate(-25deg);
    }

    .bunny-bow::after {
      right: 0;
      border-radius: 20% 80% 40% 60%;
      transform: rotate(25deg);
    }

    .bunny-bow-center {
      position: absolute;
      z-index: 2;
      top: 6px;
      left: 11px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #d96f98;
    }

    /* WAVING PAW */

    .bunny-arm {
      position: absolute;
      z-index: 9;
      top: 95px;
      right: 0;
      width: 30px;
      height: 43px;
      background: #fffafc;
      border: 2px solid #f0dce4;
      border-radius: 50%;
      transform-origin: 12px 12px;
      transform: rotate(-35deg);
    }

    .bunny-arm::after {
      content: "";
      position: absolute;
      top: -8px;
      right: -2px;
      width: 17px;
      height: 17px;
      border-radius: 50%;
      background: #fffafc;
      border: 2px solid #f0dce4;
    }

    .girl-bunny.waving .bunny-arm {
      animation: bunnyWave .38s 2.1s ease-in-out 7;
    }

    .booking-title {
      margin: 0;
      color: #d47f9e;
      font-family: "Playfair Display", serif;
      font-size: clamp(26px, 6vw, 42px);
      line-height: 1.2;
      opacity: 0;
      animation: bunnyTextIn .7s 2.1s ease forwards;
    }

    .booking-subtitle {
      color: #a77c8e;
      font-family: "DM Sans", sans-serif;
      font-size: 16px;
      margin-top: 13px;
      opacity: 0;
      animation: bunnyTextIn .7s 2.45s ease forwards;
    }

    .booking-floating {
      position: absolute;
      z-index: 3;
      pointer-events: none;
      opacity: 0;
      animation: bunnyHeartFloat 3s ease-out forwards;
    }

    .booking-sparkle {
      position: absolute;
      z-index: 2;
      color: #e9a0b9;
      animation: bunnyTwinkle 1.4s ease-in-out infinite alternate;
    }

    @keyframes bunnyFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes envelopeBounce {
      0% { transform: translateY(40px) scale(.7) rotate(-7deg); opacity: 0; }
      70% { transform: translateY(-12px) scale(1.06) rotate(3deg); opacity: 1; }
      100% { transform: translateY(0) scale(1) rotate(0); opacity: 1; }
    }

    @keyframes envelopeOpen {
      to { transform: rotateX(180deg); }
    }

    @keyframes bunnyJumpOut {
      0% {
        opacity: 0;
        transform: translate(-50%, 50px) scale(.5);
      }
      55% {
        opacity: 1;
        transform: translate(-50%, -105px) scale(1.08);
      }
      75% {
        transform: translate(-50%, -88px) scale(.97);
      }
      100% {
        opacity: 1;
        transform: translate(-50%, -95px) scale(1);
      }
    }

    @keyframes bunnyWave {
      0%, 100% { transform: rotate(-35deg); }
      50% { transform: rotate(-125deg); }
    }

    @keyframes earWiggle {
      0%, 100% { rotate: 0deg; }
      50% { rotate: 12deg; }
    }

    @keyframes bunnyTextIn {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes bunnyHeartFloat {
      0% {
        opacity: 0;
        transform: translate(0,0) scale(.5) rotate(0);
      }
      15% { opacity: 1; }
      100% {
        opacity: 0;
        transform: translate(var(--x),var(--y)) scale(1.2) rotate(var(--r));
      }
    }

    @keyframes bunnyTwinkle {
      from { opacity: .25; transform: scale(.6) rotate(0); }
      to { opacity: 1; transform: scale(1.3) rotate(45deg); }
    }

    .booking-celebration.booking-exit {
      animation: bunnyFadeOut .6s ease forwards;
    }

    @keyframes bunnyFadeOut {
      to { opacity: 0; }
    }

    @media (max-width: 600px) {
      .booking-envelope {
        width: 160px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .booking-celebration *,
      .booking-celebration {
        animation-duration: .01ms !important;
        animation-delay: 0ms !important;
      }
    }
  `;

  document.head.appendChild(style);
}


/* --------------------------------
   BOOKING CELEBRATION
-------------------------------- */

function startBookingCelebration() {
  if (bookingAnimationRunning) return;

  bookingAnimationRunning = true;

  addBookingCelebrationStyles();

  const overlay = document.createElement("div");
  overlay.className = "booking-celebration";

  overlay.innerHTML = `
    <div class="booking-content">

      <div class="booking-envelope">

        <div class="girl-bunny waving">

          <div class="bunny-ear left"></div>
          <div class="bunny-ear right"></div>

          <div class="bunny-body"></div>

          <div class="bunny-head">

            <div class="bunny-eye left"></div>
            <div class="bunny-eye right"></div>

            <div class="bunny-cheek left"></div>
            <div class="bunny-cheek right"></div>

            <div class="bunny-nose"></div>
            <div class="bunny-mouth"></div>

          </div>

          <div class="bunny-bow">
            <div class="bunny-bow-center"></div>
          </div>

          <div class="bunny-arm"></div>

        </div>

      </div>

      <h2 class="booking-title">
        WELL... LOOK WHO MADE PLANS!
      </h2>

      <p class="booking-subtitle">
        Your date is officially booked! 💗
      </p>

    </div>
  `;

  document.body.appendChild(overlay);

  // Floating hearts

  const decorations = [
    "💗", "💕", "♡", "💖", "🎀", "✨"
  ];

  for (let i = 0; i < 32; i++) {
    const item = document.createElement("span");

    item.className = "booking-floating";

    item.textContent =
      decorations[Math.floor(Math.random() * decorations.length)];

    item.style.left = `${Math.random() * 100}%`;
    item.style.top = `${35 + Math.random() * 50}%`;
    item.style.fontSize = `${17 + Math.random() * 20}px`;
    item.style.animationDelay = `${1.3 + Math.random() * .8}s`;

    item.style.setProperty(
      "--x",
      `${Math.random() * 180 - 90}px`
    );

    item.style.setProperty(
      "--y",
      `${-120 - Math.random() * 200}px`
    );

    item.style.setProperty(
      "--r",
      `${Math.random() * 80 - 40}deg`
    );

    overlay.appendChild(item);
  }

  // Sparkles

  for (let i = 0; i < 22; i++) {
    const sparkle = document.createElement("span");

    sparkle.className = "booking-sparkle";
    sparkle.textContent = "✦";

    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.fontSize = `${12 + Math.random() * 18}px`;
    sparkle.style.animationDelay = `${Math.random() * 1.5}s`;

    overlay.appendChild(sparkle);
  }

  // Finish animation

  setTimeout(() => {
    overlay.classList.add("booking-exit");

    setTimeout(() => {
      overlay.remove();
      bookingAnimationRunning = false;
    }, 650);

  }, 6000);
}


/* --------------------------------
   YES BUTTON
-------------------------------- */

if (yesButton) {
  yesButton.addEventListener("click", () => {
    clearTimeout(questionTimer);

    yesButton.disabled = true;

    playCelebrationSound();
    startCelebration();

    setTimeout(() => {
      showScreen(detailsScreen);
      yesButton.disabled = false;
    }, 3200);
  });
}


/* --------------------------------
   BACK BUTTON
-------------------------------- */

if (backButton) {
  backButton.addEventListener("click", () => {
    if (bookingRequestRunning) return;

    stopBackgroundMusic();
    showScreen(questionScreen);
  });
}


/* --------------------------------
   CONFIRM DATE & TIME + DATABASE
-------------------------------- */

if (confirmButton) {
  confirmButton.addEventListener("click", async () => {
    if (bookingAnimationRunning || bookingRequestRunning) return;

    const selectedDate = dateInput.value;
    const selectedTime = timeInput.value;

    if (!selectedDate || !selectedTime) {
      if (!selectedDate) {
        dateInput.focus();
      } else {
        timeInput.focus();
      }

      return;
    }

    if (selectedDate < getLocalDateString()) {
      dateInput.value = "";
      dateInput.focus();
      alert("გთხოვ, აირჩიე დღევანდელი ან მომავალი თარიღი.");
      return;
    }

    // ვიღებთ მონიშნულ აქტივობებს
    // "ყველა" არ იგზავნება ბაზაში

    const selectedPlans = [
      ...document.querySelectorAll(".plan-item.selected")
    ]
      .map(item => item.dataset.plan)
      .filter(plan => plan && plan !== "ყველა");

    if (selectedPlans.length === 0) {
      alert("გთხოვ, აირჩიე მინიმუმ ერთი აქტივობა.");
      return;
    }

    const originalButtonText = confirmButton.textContent;

    bookingRequestRunning = true;
    confirmButton.disabled = true;
    confirmButton.textContent = "იტვირთება...";

    try {
      const response = await fetch(BOOKING_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          plans: selectedPlans
        })
      });

      // ვამოწმებთ, რომ სერვერმა JSON პასუხი დააბრუნა

      let result;

      try {
        result = await response.json();
      } catch {
        throw new Error("სერვერმა არასწორი პასუხი დააბრუნა.");
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "ჯავშნის შენახვა ვერ მოხერხდა."
        );
      }

      // თარიღის ფორმატირება

      const dateObject = new Date(
        `${selectedDate}T12:00:00`
      );

      const formattedDate = dateObject.toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric"
        }
      );

      // დროის ფორმატირება

      const [hours, minutes] = selectedTime.split(":");

      const formattedTime = new Date(
        2000,
        0,
        1,
        Number(hours),
        Number(minutes)
      ).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
      });

      resultDate.textContent = formattedDate;
      resultTime.textContent = formattedTime;

      // წარმატებული შენახვის შემდეგ Success ეკრანი

      showScreen(successScreen);

      startBookingCelebration();

    } catch (error) {
      console.error("Booking error:", error);

      alert(
        error.message ||
        "სერვერთან დაკავშირება ვერ მოხერხდა. სცადე თავიდან."
      );

    } finally {
      bookingRequestRunning = false;
      confirmButton.disabled = false;
      confirmButton.textContent = originalButtonText;
    }
  });
}


/* --------------------------------
   RESTART
-------------------------------- */

if (restartButton) {
  restartButton.addEventListener("click", () => {
    if (bookingRequestRunning) return;

    stopBackgroundMusic();

    dateInput.value = "";
    timeInput.value = "";

    questionCount = 0;
    isRunaway = false;
    isMoving = false;

    previousPositions = [];

    clearTimeout(questionTimer);

    noQuestion.classList.remove("visible");

    noButton.style.display = "";
    noButton.classList.remove("moving");

    noButton.style.left = "";
    noButton.style.top = "";

    // აქტივობების განულება

    planItems.forEach(plan => {
      plan.classList.remove("selected");
      plan.setAttribute("aria-pressed", "false");
    });

    const selectionHint = document.querySelector(".selection-hint");

    if (selectionHint) {
      selectionHint.textContent = "აირჩიე სასურველი აქტივობები";
    }

    musicEnabled = true;
    updateMusicButton();

    updateHint(
      "One of these buttons is behaving strangely."
    );

    showScreen(questionScreen);
  });
}


/* --------------------------------
   ACTIVITY SELECTION
-------------------------------- */

const planItems = document.querySelectorAll(".plan-item");

const allButton = document.querySelector(
  '.plan-item[data-plan="ყველა"]'
);

planItems.forEach((item) => {
  item.addEventListener("click", () => {

    // თუ დააჭირეს "ყველას"

    if (item === allButton) {
      const shouldSelectAll = !item.classList.contains("selected");

      planItems.forEach((plan) => {
        plan.classList.toggle("selected", shouldSelectAll);

        plan.setAttribute(
          "aria-pressed",
          shouldSelectAll ? "true" : "false"
        );
      });

    } else {

      // ჩვეულებრივი აქტივობის მონიშვნა / მოხსნა

      item.classList.toggle("selected");

      item.setAttribute(
        "aria-pressed",
        item.classList.contains("selected") ? "true" : "false"
      );

      // შევამოწმოთ ყველა აქტივობა მონიშნულია თუ არა

      const regularItems = [...planItems].filter(
        plan => plan !== allButton
      );

      const allSelected = regularItems.length > 0 &&
        regularItems.every(
          plan => plan.classList.contains("selected")
        );

      if (allButton) {
        allButton.classList.toggle("selected", allSelected);

        allButton.setAttribute(
          "aria-pressed",
          allSelected ? "true" : "false"
        );
      }
    }

    // არჩეული აქტივობების რაოდენობა

    const selectedCount = [...planItems].filter(
      plan => plan !== allButton && plan.classList.contains("selected")
    ).length;

    const selectionHint = document.querySelector(".selection-hint");

    if (selectionHint) {
      selectionHint.textContent = selectedCount
        ? `არჩეულია ${selectedCount} აქტივობა`
        : "აირჩიე სასურველი აქტივობები";
    }
  });
});


/* --------------------------------
   INITIAL MUSIC BUTTON STATE
-------------------------------- */

updateMusicButton();
