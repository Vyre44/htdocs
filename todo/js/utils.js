// utils.js - Genel yardımcı fonksiyonlar

// Toast bildirimi göster
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Animasyon için biraz bekle
  setTimeout(() => toast.classList.add("show"), 10);
  
  // 3 saniye sonra kaldır
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
