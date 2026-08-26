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

// Discord user id — used for Lanyard presence
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
// BACKGROUND MUSIC — autoplays for everyone, no manual pause/resume.
// Only a live equalizer effect represents it (no track name/time shown).
// ==========================

const audio = new Audio("assets/music.mp3");
audio.loop = true;
audio.volume = 0.6;
const visualizer = document.getElementById("visualizer");

audio.addEventListener("play", () => visualizer?.classList.add("playing"));
audio.addEventListener("pause", () => visualizer?.classList.remove("playing"));

function tryAutoplay() {
  audio.play().catch(() => {
    // Most browsers block unmuted autoplay before any user interaction.
    // As soon as the visitor taps/clicks anywhere on the page, start it —
    // still fully automatic from their point of view, no button needed.
    const startOnInteract = () => {
      audio.play().catch(() => {});
      document.removeEventListener("click", startOnInteract);
      document.removeEventListener("touchstart", startOnInteract);
      document.removeEventListener("keydown", startOnInteract);
    };
    document.addEventListener("click", startOnInteract, { once: true });
    document.addEventListener("touchstart", startOnInteract, { once: true });
    document.addEventListener("keydown", startOnInteract, { once: true });
  });
}

// ==========================
// COPY BUTTON (Discord ID)
// ==========================

document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const value = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      showToast("Copied ✅");
    } catch {
      showToast("Couldn't copy");
    }
  });
});

// ==========================
// FIREBASE VIEW COUNTER (increments once per session)
// ==========================

const viewRef = doc(db, "website", "views");
const viewElement = document.getElementById("views");

// Realtime listener: view count updates live for everyone looking at the page
onSnapshot(viewRef, (snap) => {
  if (viewElement && snap.exists()) {
    viewElement.textContent = snap.data().count ?? 0;
  }
}, (err) => console.error("🔥 Firestore view listener blocked:", err.code, err.message));

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
    // Count staying at 0 despite visits is almost always a Firestore
    // Security Rules issue (writes denied for unauthenticated clients).
    // Check the browser console for "permission-denied" here.
    console.error("🔥 Firestore view write failed:", error.code, error.message);
  }
}

addView();

// ==========================
// DISCORD PRESENCE (Lanyard API) — falls back quietly on failure
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
      online: "🟢 Online",
      idle: "🌙 Idle",
      dnd: "⛔ Do Not Disturb",
      offline: "⚫ Offline"
    };
    text.textContent = labels[status] || "Unknown";

    const activity = json.data.activities?.find(a => a.type === 0);
    if (activity) {
      text.textContent += ` — ${activity.name}`;
    }
  } catch (error) {
    // On failure, just fall back to a neutral state — the site never breaks
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
// PWA — SERVICE WORKER REGISTRATION (enables offline mode)
// ==========================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .catch((err) => console.log("Service worker registration failed:", err));
  });
}

// Show the "Install App" button only when the browser supports it
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
  showToast("Installed! 📲");
});

// ==========================
// LOADER REMOVE + AUTOPLAY START
// ==========================

window.addEventListener("load", () => {
  const loader = document.querySelector(".loader");
  if (loader) {
    setTimeout(() => {
      loader.remove();
      tryAutoplay();
    }, 1000);
  } else {
    tryAutoplay();
  }
});