// bulk.js - Toplu işlemler (tamamlananları sil / hepsini sil)

const clearDoneBtn = document.getElementById("clearDoneBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

if (clearDoneBtn) {
  clearDoneBtn.addEventListener("click", async () => {
    const checked = [...document.querySelectorAll(".toggle-checkbox:checked")];
    if (checked.length === 0) {
      showToast("Seçili görev yok", "error");
      return;
    }

    if (!confirm("Seçili görevler silinsin mi?")) return;

    const ids = checked.map(cb => cb.dataset.id).join(",");
    const fd = new FormData();
    fd.append("ids", ids);

    const res = await fetch("crud.php?action=bulk_delete", { method: "POST", body: fd });
    const data = await res.json();

    if (!data.ok) {
      showToast(data.message || "Silme başarısız", "error");
      return;
    }

    showToast(`Seçili görevler silindi (${data.deleted})`, "success");
    await loadTasks();
    await loadTrash();
  });
}

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
