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
      <input type="checkbox" class="toggle-checkbox" data-id="${t.id}">

      <label class="img-btn" title="JPEG yükle">
        <input type="file" class="img-input" data-id="${t.id}" accept="image/jpeg">
        📷
      </label>
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

// Checkbox sadece seçim için (toplu silme)
document.addEventListener("change", (e) => {
  if (!e.target.classList.contains("toggle-checkbox")) return;
  const li = e.target.closest("li");
  li.classList.toggle("selected", e.target.checked);
});

// Task'a tıklayınca tamamlandı durumunu değiştir
taskList.addEventListener("click", async (e) => {
  if (e.target.closest(".toggle-checkbox") || e.target.closest(".img-btn")) return;
  const li = e.target.closest("li");
  if (!li) return;

  const titleEl = li.querySelector(".task-title");
  const willBeDone = titleEl.classList.contains("task-done") ? 0 : 1;

  titleEl.classList.toggle("task-done", willBeDone === 1);
  li.draggable = (willBeDone === 0);

  const fd = new FormData();
  fd.append("id", li.dataset.id);
  fd.append("is_done", willBeDone);

  const res = await fetch("crud.php?action=toggle", { method: "POST", body: fd });
  const data = await res.json();

  if (!data.ok) {
    // Geri al
    titleEl.classList.toggle("task-done", willBeDone !== 1);
    li.draggable = (willBeDone === 0 ? false : true);
    showToast(data.message || "Güncelleme basarisiz", "error");
    return;
  }

  // Tamamlananları aşağıya al, işareti kaldırılanları işaretli olmayan sonuna al
  if (willBeDone === 1) {
    taskList.appendChild(li);
  } else {
    // İşaretli olmayan görevlerin sonunu bul
    const lastUndone = [...taskList.children].reverse().find(child => {
      return !child.querySelector(".task-title").classList.contains("task-done");
    });
    if (lastUndone) {
      taskList.insertBefore(li, lastUndone.nextElementSibling);
    } else {
      taskList.insertBefore(li, taskList.firstElementChild);
    }
  }
  enableDragAndDrop();
});
