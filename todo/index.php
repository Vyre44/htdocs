<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <title>Mini To-Do</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; }
    .box { padding: 16px; border: 1px solid #ddd; border-radius: 10px; }

    /* sadece ekleme formu */
    .add-form { display: flex; gap: 10px; }
    .add-form input[type="text"] { flex: 1; padding: 10px; }
    .add-form button { padding: 10px 14px; cursor: pointer; }

    ul { padding-left: 0; list-style: none; overflow-wrap: anywhere; }
    li { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #eee; padding: 8px 0; }

    .task-title { flex: 1; min-width: 0; }
    .task-done { text-decoration: line-through; color: #888; }

    .actions { margin-left: auto; display: flex; align-items: center; gap: 10px; white-space: nowrap; }
    .actions input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }

    a { color: #b00020; text-decoration: none; white-space: nowrap; }
    a:hover { text-decoration: underline; }

    .left { display:flex; align-items:center; gap:10px; min-width:0; }
    .thumb { width:38px; height:38px; object-fit:cover; border-radius:8px; border:1px solid #ddd; }
    .img-btn input[type="file"] { display:none; }
    .img-btn { cursor:pointer; user-select:none; }

  </style>
</head>
<body>
  <div class="box">
    <h2>Mini To-Do</h2>

    <form id="addForm" class="add-form">
      <input id="titleInput" type="text" name="title" placeholder="Yeni görev yaz..." maxlength="255">
      <button type="submit">Ekle</button>
    </form>

    <hr>  

    <ul id="taskList"></ul>
  </div>

<script>
const taskList = document.getElementById("taskList");
const addForm = document.getElementById("addForm");
const titleInput = document.getElementById("titleInput");

function escapeHtml(s){
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function renderTask(t){
  const li = document.createElement("li");
  li.dataset.id = t.id;

  li.draggable = (t.is_done == 0);

  const imgHtml = (t.image_path && t.image_path.trim() !== "")
    ? `<img src="${t.image_path}" class="thumb" alt="">`
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

let draggedLi = null;

function enableDragAndDrop(){
  const items = taskList.querySelectorAll("li");

  items.forEach(li => {
    const cb = li.querySelector(".toggle-checkbox");
    if (cb && cb.checked) return;

    li.addEventListener("dragstart", () => {
      draggedLi = li;
      li.style.opacity = "0.5";
    });

    li.addEventListener("dragend", () => {
      li.style.opacity = "1";
      draggedLi = null;
      saveOrder(); 
    });

    li.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (!draggedLi || draggedLi === li) return;

      const rect = li.getBoundingClientRect();
      const isAfter = (e.clientY - rect.top) > (rect.height / 2);

      if (isAfter) li.after(draggedLi);
      else li.before(draggedLi);
    });
  });
}

async function saveOrder(){
  const ids = [...taskList.querySelectorAll("li")]
    .filter(li => !li.querySelector(".toggle-checkbox")?.checked)
    .map(li => li.dataset.id);

  if (ids.length === 0) return;

  const fd = new FormData();
  fd.append("order", ids.join(","));

  const res = await fetch("crud.php?action=reorder", { method:"POST", body: fd });
  const data = await res.json();
  if(!data.ok) alert(data.message || "Sıralama kaydedilemedi");
}

async function loadTasks(){
  const res = await fetch("crud.php?action=list");
  const data = await res.json();

  if(!data.ok){
    alert(data.message || "Liste yuklenemedi");
    return;
  }

  taskList.innerHTML = "";
  data.tasks.forEach(t => taskList.appendChild(renderTask(t)));

  enableDragAndDrop();
}

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if(!title) return alert("Görev boş olamaz");

  const fd = new FormData();
  fd.append("title", title);

  const res = await fetch("crud.php?action=add", { method:"POST", body: fd });
  const data = await res.json();

  if(!data.ok) return alert(data.message || "Ekleme basarisiz");

  titleInput.value = "";
  await loadTasks();
});

document.addEventListener("change", async (e) => {
  if(!e.target.classList.contains("toggle-checkbox")) return;

  const cb = e.target;
  const id = cb.dataset.id;
  const is_done = cb.checked ? 1 : 0;

  const li = cb.closest("li");
  li.querySelector(".task-title").classList.toggle("task-done", cb.checked);

  const fd = new FormData();
  fd.append("id", id);
  fd.append("is_done", is_done);

  const res = await fetch("crud.php?action=toggle", { method:"POST", body: fd });
  const data = await res.json();

  if(!data.ok){
    cb.checked = !cb.checked;
    li.querySelector(".task-title").classList.toggle("task-done", cb.checked);
    alert(data.message || "Güncelleme basarisiz");
    return;
  }

  if(cb.checked) taskList.appendChild(li);
  else taskList.insertBefore(li, taskList.firstElementChild);
  enableDragAndDrop();
});

document.addEventListener("click", async (e) => {
  if(!e.target.classList.contains("delete-link")) return;
  e.preventDefault();

  const id = e.target.dataset.id;
  if(!confirm("Silinsin mi?")) return;

  const fd = new FormData();
  fd.append("id", id);

  const res = await fetch("crud.php?action=delete", { method:"POST", body: fd });
  const data = await res.json();

  if(!data.ok) return alert(data.message || "Silme basarisiz");

  taskList.querySelector(`li[data-id="${id}"]`)?.remove();
});
document.addEventListener("change", async (e) => {
  if(!e.target.classList.contains("img-input")) return;

  const input = e.target;
  const id = input.dataset.id;
  const file = input.files[0];
  if(!file) return;

  // Hızlı client kontrol (asıl kontrol PHP)
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

  const fd = new FormData();
  fd.append("id", id);
  fd.append("image", file);

  const res = await fetch("crud.php?action=upload", { method:"POST", body: fd });
  const data = await res.json();

  if(!data.ok){
    alert(data.message || "Yükleme başarısız");
    input.value = "";
    return;
  }

  // Başarılıysa listeyi yenile (kolay yol)
  input.value = "";
  await loadTasks();
});

loadTasks();
</script>
</body>
</html>
