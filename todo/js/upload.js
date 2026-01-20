// upload.js - Dosya yükleme işlemleri

// Resim yükleme işlemi
document.addEventListener("change", async (e) => {
  if (!e.target.classList.contains("img-input")) return;

  const input = e.target;
  const id = input.dataset.id;
  const file = input.files[0];
  if (!file) return;

  // Client-side kontrol (asıl kontrol PHP tarafında yapılır)
  if (file.size > 1024 * 1024) {
    showToast("Dosya 1MB üstü olamaz.", "error");
    input.value = "";
    return;
  }
  if (file.type !== "image/jpeg") {
    showToast("Sadece JPEG (JPG) kabul edilir.", "error");
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
