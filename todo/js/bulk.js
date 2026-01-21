// bulk.js - Toplu işlemler (tamamlananları sil / hepsini sil)

const clearDoneBtn = document.getElementById("clearDoneBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

// Tamamlandı (üstü çizili) görevleri sil
if (clearDoneBtn) {
  clearDoneBtn.addEventListener("click", async () => {
    const doneLis = [...document.querySelectorAll("#taskList li .task-title.task-done")]
      .map(el => el.closest('li'))
      .filter(Boolean);

    if (doneLis.length === 0) {
      showToast("Tamamlanmış görev yok", "error");
      return;
    }

    if (!confirm("Tamamlanmış görevler silinsin mi?")) return;

    const ids = doneLis.map(li => li.dataset.id).join(",");
    const fd = new FormData();
    fd.append("ids", ids);

    const res = await fetch("crud.php?action=bulk_delete", { method: "POST", body: fd });
    const data = await res.json();

    if (!data.ok) {
      showToast(data.message || "Silme başarısız", "error");
      return;
    }

    showToast(`Tamamlanan görevler silindi (${data.deleted})`, "success");
    await loadTasks();
    await loadTrash();
  });
}

// Tüm görevleri sil
if (clearAllBtn) {
  clearAllBtn.addEventListener("click", async () => {
    if (!confirm("Tüm görevler silinsin mi?")) return;

    const res = await fetch("crud.php?action=clear_all", { method: "POST" });
    const data = await res.json();

    if (!data.ok) {
      showToast(data.message || "Silme başarısız", "error");
      return;
    }

    showToast(`Tüm görevler silindi (${data.deleted})`, "success");
    await loadTasks();
    await loadTrash();
  });
}
