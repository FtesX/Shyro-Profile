// ==========================
// FIREBASE SETUP
// ==========================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, increment, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA29_4UB7n8KxVisZ0o4PPQY4EH6E0gWE8",
  authDomain: "shyro-profile.firebaseapp.com",
  projectId: "shyro-profile",
  storageBucket: "shyro-profile.firebasestorage.app",
  messagingSenderId: "810707781934",
  appId: "1:810707781934:web:5578352d41adda6c4a52bf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Discord user id — Lanyard presence-д ашиглана
const DISCORD_ID = "1003847406372261951";

// ==========================
// VARIABLES
// ==========================

const card = document.querySelector(".card");
const isDesktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const isMobile = window.matchMedia("(pointer: coarse)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ==========================
// TOAST HELPER
// ==========================

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1800);
}

// ==========================
// PC 3D MOUSE CARD EFFECT
// ==========================

if (isDesktop && !prefersReducedMotion && card) {
  document.addEventListener("mousemove", (e) => {
    const rotateY = (window.innerWidth / 2 - e.clientX) / 30;
    const rotateX = (window.innerHeight / 2 - e.clientY) / 30;
    card.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
  });

  document.addEventListener("mouseleave", () => {
    card.style.transform = "rotateY(0deg) rotateX(0deg)";
  });
}

// ==========================
// MUSIC PLAYER (progress bar + visualizer)
// ==========================

const musicButton = document.getElementById("music");
const audio = new Audio("assets/music.mp3");
const progressFill = document.getElementById("progressFill");
const progressBar = document.querySelector(".progress-bar");
const timeCurrent = document.getElementById("timeCurrent");
const timeTotal = document.getElementById("timeTotal");
const visualizer = document.getElementById("visualizer");
let playing = false;

function formatTime(sec) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

audio.addEventListener("loadedmetadata", () => {
  if (timeTotal) timeTotal.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (progressFill && audio.duration) {
    progressFill.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
  }
  if (timeCurrent) timeCurrent.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("ended", () => {
  playing = false;
  if (musicButton) musicButton.innerHTML = "▶ Play";
  if (visualizer) visualizer.classList.remove("playing");
});

if (progressBar) {
  progressBar.addEventListener("click", (e) => {
    if (!audio.duration) return;
    const rect = progressBar.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  });
}

if (musicButton) {
  musicButton.onclick = () => {
    if (!playing) {
      audio.play().catch(() => showToast("Тоглуулж чадсангүй 🙁"));
      musicButton.innerHTML = "⏸ Pause";
      visualizer?.classList.add("playing");
      playing = true;
    } else {
      audio.pause();
      musicButton.innerHTML = "▶ Play";
      visualizer?.classList.remove("playing");
      playing = false;
    }
  };
}

// ==========================
// COPY BUTTONS (Discord ID + Share link)
// ==========================

document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const value = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      showToast("Хууллаа ✅");
    } catch {
      showToast("Хуулж чадсангүй");
    }
  });
});

const shareBtn = document.getElementById("shareBtn");
if (shareBtn) {
  shareBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Линк хуулагдлаа 🔗");
    } catch {
      showToast("Хуулж чадсангүй");
    }
  });
}

// ==========================
// FIREBASE VIEW COUNTER (session-д 1 удаа нэмэгдэнэ)
// ==========================

const viewRef = doc(db, "website", "views");
const viewElement = document.getElementById("views");

// Firestore-оос realtime тоог харуулна (яг тухайн үед бусад хэрэглэгч нэмэгдвэл шууд шинэчлэгдэнэ)
onSnapshot(viewRef, (snap) => {
  if (viewElement && snap.exists()) {
    viewElement.textContent = snap.data().count ?? 0;
  }
}, (err) => console.log("Firebase view listen error:", err));

async function addView() {
  const alreadyCounted = sessionStorage.getItem("shyro_viewed");
  try {
    const snap = await getDoc(viewRef);
    if (snap.exists()) {
      if (!alreadyCounted) {
        await updateDoc(viewRef, { count: increment(1) });
      }
    } else {
      await setDoc(viewRef, { count: 1 });
    }
    sessionStorage.setItem("shyro_viewed", "1");
  } catch (error) {
    console.log("Firebase View Error:", error);
  }
}

addView();

// ==========================
// DISCORD PRESENCE (Lanyard API) — амжилтгүй бол зүгээр далдална
// ==========================

async function loadDiscordStatus() {
  const dot = document.getElementById("statusDot");
  const text = document.getElementById("statusText");
  if (!dot || !text) return;

  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
    if (!res.ok) throw new Error("Lanyard fetch failed");
    const json = await res.json();
    if (!json.success) throw new Error("Lanyard: user not tracked");

    const status = json.data.discord_status; // online | idle | dnd | offline
    dot.dataset.state = status;

    const labels = {
      online: "🟢 Онлайн",
      idle: "🌙 Идэвхгүй",
      dnd: "⛔ Бүү саад",
      offline: "⚫ Офлайн"
    };
    text.textContent = labels[status] || "Тодорхойгүй";

    const activity = json.data.activities?.find(a => a.type === 0);
    if (activity) {
      text.textContent += ` — ${activity.name}`;
    }
  } catch (error) {
    // Алдаа гарвал энгийн default төлөвт орно, сайт эвдрэхгүй
    dot.dataset.state = "unknown";
    text.textContent = "";
    console.log("Discord presence unavailable:", error);
  }
}

loadDiscordStatus();
setInterval(loadDiscordStatus, 30000);

// ==========================
// DESKTOP CUSTOM CURSOR
// ==========================

if (isDesktop && !prefersReducedMotion) {
  const cursor = document.querySelector(".cursor");
  const trail = document.querySelector(".cursor-trail");

  document.addEventListener("mousemove", (e) => {
    if (cursor) {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    }
    if (trail) {
      setTimeout(() => {
        trail.style.left = e.clientX + "px";
        trail.style.top = e.clientY + "px";
      }, 80);
    }

    const particle = document.createElement("div");
    particle.className = "trail-particle";
    document.body.appendChild(particle);
    particle.style.left = e.clientX + "px";
    particle.style.top = e.clientY + "px";
    setTimeout(() => particle.remove(), 800);
  });
}

// ==========================
// MOBILE GYROSCOPE
// ==========================

if (isMobile && !prefersReducedMotion && card) {
  window.addEventListener("deviceorientation", (e) => {
    const rotateY = e.gamma / 5;
    const rotateX = e.beta / 10;
    card.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
  });
}

// ==========================
// PWA — SERVICE WORKER БҮРТГЭЛ (offline ажиллах боломж)
// ==========================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .catch((err) => console.log("Service worker registration failed:", err));
  });
}

// "Install app" боломжтой үед жижиг товч харуулъя (browser дэмждэг л бол)
let deferredInstallPrompt = null;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  if (installBtn) installBtn.hidden = false;
});

if (installBtn) {
  installBtn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installBtn.hidden = true;
  });
}

window.addEventListener("appinstalled", () => {
  showToast("Suulgalaa! 📲");
});

// ==========================
// LOADER REMOVE
// ==========================

window.addEventListener("load", () => {
  const loader = document.querySelector(".loader");
  if (loader) {
    setTimeout(() => loader.remove(), 1000);
  }
});
