// ========== INSTALL BUTTON LOGIC ==========
let deferredPrompt;
const installBtn = document.getElementById("installBtn");

// Hide install button if already installed as PWA
if (window.matchMedia("(display-mode: standalone)").matches) {
  if (installBtn) installBtn.style.display = "none";
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log("📲 beforeinstallprompt captured, install dugme spremno");
});

// Handle install button click
if (installBtn) {
  installBtn.addEventListener("click", async () => {
    if (deferredPrompt) {
      // Koristi native install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Install outcome: ${outcome}`);
      deferredPrompt = null;
    } else {
      // Fallback ako browser ne podrzava beforeinstallprompt ili nije jos fire-ovao
      alert(
        'Чтобы установить приложение:\n\n• Компьютер: Нажмите ⭐ в адресной строке → Установить\n\n• Телефон: ⋮ → "Добавить на главный экран"\n\nЕсли кнопки нет, обновите страницу или откройте в Chrome.'
      );
    }
  });
}

window.addEventListener("appinstalled", () => {
  console.log("✅ Fistashki PWA installed!");
  if (installBtn) installBtn.style.display = "none";
});

// ========== BUTTON CLICK → opens fistashki.org in external browser ==========
document.getElementById("mainBtn").addEventListener("click", (e) => {
  e.preventDefault();
  // Force external browser even in standalone PWA mode
  window.open("https://fistashki.org", "_blank", "noopener,noreferrer");
});

// ========== SERVICE WORKER REGISTRATION ==========
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("✅ Fistashki SW registered:", registration.scope);
      })
      .catch((err) => {
        console.error("❌ Fistashki SW registration failed:", err);
      });
  });
}

console.log("🥜 Fistashki Button PWA spremna!");