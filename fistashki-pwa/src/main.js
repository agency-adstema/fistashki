// PWA Service Worker registracija
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered:", registration.scope);
      })
      .catch((err) => {
        console.error("SW registration failed:", err);
      });
  });
}

// Smooth scroll za navigaciju (fallback za browse-re koji ne podržavaju CSS smooth)
document.querySelectorAll('.nav a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

console.log("🥜 Fistashki PWA spremna!");