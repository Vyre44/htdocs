/**
 * upload.js - Dosya yükleme işlemleri
 */

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
    alert(data.message || "Yükleme başarısız");
    input.value = "";
    return;
  }

  // Başarılıysa listeyi yenile
  input.value = "";
  await loadTasks();
});
