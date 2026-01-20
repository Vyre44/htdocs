/**
 * upload.js - Dosya yükleme işlemleri
 */

/**
 * Toast bildirimi göster
 */
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

/**
 * Resim yükleme işlemi
 */
document.addEventListener("change", async (e) => {
  if (!e.target.classList.contains("img-input")) return;

  const input = e.target;
  const id = input.dataset.id;
  const file = input.files[0];
  if (!file) return;

  // Client-side kontrol (asıl kontrol PHP tarafında yapılır)
  if (file.size > 1024 * 1024) {
    alert("Dosya 1MB üstü olamaz.");
    input.value = "";
    return;
  }
  if (file.type !== "image/jpeg") {
    alert("Sadece JPEG (JPG) kabul edilir.");
    input.value = "";
    return;
  }

  // Sunucuya yükle
  const fd = new FormData();
  fd.append("id", id);
  fd.append("image", file);

  const res = await fetch("crud.php?action=upload", { method: "POST", body: fd });
  const data = await res.json();

  if (!data.ok) {
    showToast(data.message || "Yükleme başarısız", "error");
    input.value = "";
    return;
  }

  // Başarılıysa listeyi yenile
  input.value = "";
  showToast("Resim başarıyla yüklendi! ✓", "success");
  await loadTasks();
});
