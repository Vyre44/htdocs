// tasks.js - Task CRUD işlemleri

// HTML elemanlara erişim
const taskList = document.getElementById("taskList");
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
  li.draggable = (t.is_done == 0);

  const imgHtml = (t.image_path && t.image_path.trim() !== "")
    ? `<img src="${escapeHtml(t.image_path)}" class="thumb" alt="">`
    : "";

  li.innerHTML = `
    <div class="left">
      <span class="task-title ${t.is_done == 1 ? "task-done" : ""}">${escapeHtml(t.title)}</span>
      ${imgHtml}
    </div>

    <div class="actions">
      <input type="checkbox" class="toggle-checkbox" data-id="${t.id}" ${t.is_done == 1 ? "checked" : ""}>

      <label class="img-btn" title="JPEG yükle">
        <input type="file" class="img-input" data-id="${t.id}" accept="image/jpeg">
        📷
      </label>

      <a href="#" class="delete-link" data-id="${t.id}">Sil</a>
    </div>
  `;
  return li;
}

// Tüm taskları yükle
async function loadTasks() {
  const res = await fetch("crud.php?action=list");
  const data = await res.json();

  if (!data.ok) {
    showToast(data.message || "Liste yuklenemedi", "error");
    return;
  }

  taskList.innerHTML = "";
  data.tasks.forEach(t => taskList.appendChild(renderTask(t)));

  // Sürükleme-bırakma işlevini etkinleştir
  enableDragAndDrop();
}

// Yeni task ekle
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

// Task tamamlandı/tamamlanmadı toggle et
document.addEventListener("change", async (e) => {
  if (!e.target.classList.contains("toggle-checkbox")) return;

  const cb = e.target;
  const id = cb.dataset.id;
  const is_done = cb.checked ? 1 : 0;

  const li = cb.closest("li");
  li.querySelector(".task-title").classList.toggle("task-done", cb.checked);

  const fd = new FormData();
  fd.append("id", id);
  fd.append("is_done", is_done);

  const res = await fetch("crud.php?action=toggle", { method: "POST", body: fd });
  const data = await res.json();

  if (!data.ok) {
    cb.checked = !cb.checked;
    li.querySelector(".task-title").classList.toggle("task-done", cb.checked);
    showToast(data.message || "Güncelleme basarisiz", "error");
    return;
  }

  // Tamamlananları aşağıya al
  if (cb.checked) taskList.appendChild(li);
  else taskList.insertBefore(li, taskList.firstElementChild);
  enableDragAndDrop();
});

// Task sil
document.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("delete-link")) return;
  e.preventDefault();

  const id = e.target.dataset.id;
  if (!confirm("Silinsin mi?")) return;

  const fd = new FormData();
  fd.append("id", id);

  const res = await fetch("crud.php?action=delete", { method: "POST", body: fd });
  const data = await res.json();

  if (!data.ok) return showToast(data.message || "Silme basarisiz", "error");

  taskList.querySelector(`li[data-id="${id}"]`)?.remove();
  showToast("Görev silindi! ✓", "success");
});
