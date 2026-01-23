// tasks.js - Task CRUD işlemleri (Kanban 3 Sütun)

// HTML elemanlara erişim
const taskLists = {
  1: document.getElementById("taskList-1"),
  2: document.getElementById("taskList-2"),
  3: document.getElementById("taskList-3")
};
const addForm = document.getElementById("addForm");
const titleInput = document.getElementById("titleInput");

// HTML karakterleri escape et (XSS koruması)
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

// Bir task için list item HTML'i oluştur
function renderTask(t) {
  const li = document.createElement("li");
  li.dataset.id = t.id;
  li.dataset.status = t.status || 1;
  li.draggable = true;

  const imgHtml = (t.image_path && t.image_path.trim() !== "")
    ? `<img src="${escapeHtml(t.image_path)}" class="thumb" alt="">`
    : "";

  // Sadece görsel yükleme butonu, sil butonu kaldırıldı (çöp kutusuna sürükle)
  li.innerHTML = `
    <div class="left">
      <span class="task-title">${escapeHtml(t.title)}</span>
      ${imgHtml}
    </div>

    <div class="actions">
      <label class="img-btn" title="JPEG yükle">
        <input type="file" class="img-input" data-id="${t.id}" accept="image/jpeg">
        🖼️
      </label>
    </div>
  `;
  return li;
}

// Task count güncelle (çöp dahil)
function updateCounts() {
  [1, 2, 3].forEach(status => {
    const count = taskLists[status].children.length;
    document.getElementById(`count-${status}`).textContent = count;
  });
  // Çöp kutusu sayacı ayrı yönetilecek (trash.js tarafından)
}

// Tüm taskları API'den getir ve sayfada göster
async function loadTasks() {
  const res = await fetch("crud.php?action=list");
  const data = await res.json();

  if (!data.ok) {
    showToast(data.message || "Liste yuklenemedi", "error");
    return;
  }

  // Tüm sütunları temizle
  Object.values(taskLists).forEach(list => list.innerHTML = "");

  // Her task'i status'üne göre ilgili sütuna ekle
  data.tasks.forEach(t => {
    const status = t.status || 1; // Updated to default to 1 instead of 0
      // Status 0 olanları atla (çöp kutusu trash.js tarafından yönetilir)
    // Status 4 olanları atla (kalıcı silinenler admin panelinde)
    if (status === 0 || status === 4) return;
    const targetList = taskLists[status];
    if (targetList) {
      targetList.appendChild(renderTask(t));
    }
  });

  updateCounts();
  enableDragAndDrop();
}

// Yeni task ekle: form gönderildiğinde API'ye istek yap ve listeyi yenile
addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return showToast("Görev boş olamaz", "error");

  const fd = new FormData();
  fd.append("title", title);

  const res = await fetch("crud.php?action=add", { method: "POST", body: fd });
  const data = await res.json();

  if (!data.ok) return showToast(data.message || "Ekleme basarisiz", "error");

  titleInput.value = "";
  await loadTasks();
});

// Sayfa yüklendiğinde task listesini getir
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
});
